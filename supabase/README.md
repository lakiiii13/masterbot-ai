# Supabase setup

1. Otvori [Supabase Dashboard](https://supabase.com/dashboard) → tvoj projekat
2. Idi na **SQL Editor**
3. Pokreni migracije redom:
   - `001_create_generated_posts.sql` — tabela
   - `002_add_user_email.sql` — kolona user_email
   - `003_rls_user_email.sql` — RLS i get_my_posts RPC
   - `004_delete_my_post.sql` — delete_my_post RPC i dozvola za brisanje
