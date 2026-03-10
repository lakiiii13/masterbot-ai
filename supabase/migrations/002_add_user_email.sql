-- Kolona za identifikaciju korisnika (email iz Bubble.io URL-a)
alter table generated_posts add column if not exists user_email text;

create index if not exists idx_generated_posts_user_email on generated_posts(user_email);

-- RLS: korisnici vide samo svoje objave (kada se koristi user_email)
-- Napomena: filtriranje se radi u klijentu na osnovu ?email= u URL-u.
-- Za strožiju sigurnost, dodaj backend koji validira email pre upita.