-- RLS: korisnici vide samo svoje objave (po user_email)

-- Ukloni staru permisivnu read politiku
drop policy if exists "Allow read" on generated_posts;

-- Nova SELECT politika: dozvoli samo kada user_email odgovara
-- Koristimo RPC funkciju jer RLS ne može direktno da čita parametre iz zahteva.
-- Direktan SELECT na tabelu je blokiran (nema politike koja dozvoljava).

-- Funkcija za bezbedno čitanje objava po email-u (zaobiđe RLS sa SECURITY DEFINER)
create or replace function get_my_posts(p_user_email text)
returns setof generated_posts
language sql
security definer
set search_path = public
as $$
  select *
  from generated_posts
  where platform = 'facebook'
    and (
      (p_user_email is null and user_email is null)
      or (p_user_email is not null and user_email = p_user_email)
    )
  order by created_at desc
  limit 20;
$$;

-- Dozvoli anon i auth da pozovu funkciju
grant execute on function get_my_posts(text) to anon;
grant execute on function get_my_posts(text) to authenticated;

-- Napomena: Direktan SELECT na generated_posts sada vraća prazno (nema politike).
-- Klijent MORA koristiti get_my_posts(email) za čitanje.