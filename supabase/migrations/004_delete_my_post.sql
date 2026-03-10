-- Funkcija za bezbedno brisanje: samo ako user_email odgovara
create or replace function delete_my_post(p_id uuid, p_user_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from generated_posts
  where id = p_id
    and platform = 'facebook'
    and (
      (p_user_email is null and user_email is null)
      or (p_user_email is not null and user_email = p_user_email)
    );
end;
$$;

grant execute on function delete_my_post(uuid, text) to anon;
grant execute on function delete_my_post(uuid, text) to authenticated;

-- Dozvola za direktan delete (fallback ako RPC nije dostupan; RPC je preferirani način)
create policy "Allow delete" on generated_posts for delete using (true);