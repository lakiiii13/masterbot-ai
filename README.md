# Maste Bot — AI alat za društvene mreže

React aplikacija za kreiranje sadržaja za Facebook i Instagram (objave, caption-i). Podržani modeli: ChatGPT 5.2 (OpenAI), Gemini 3.1 Pro (Google), Claude Sonnet 4.5/4.6 (Anthropic).

## Pokretanje

```bash
npm install
npm run dev:all
```

Pokreće backend (port 3000) i frontend (port 6262). Otvori `http://localhost:6262`.

Samo frontend: `npm run dev`  
Samo backend: `npm run dev:server`

## Konfiguracija

Kopiraj `.env.example` u `.env`:

- **VITE_API_URL** — samo za lokalni dev (npr. `http://localhost:3000`). Na Netlify nije potrebno.
- **VITE_API_KEY** — isti kao `API_SECRET` (zaštita od neovlašćenog pristupa)
- **API_SECRET** — tajni ključ; samo zahtevi sa `X-API-Key` headerom prolaze
- **Backend** — API ključevi (OpenAI, Anthropic, Google) idu u backend `.env`

## Struktura

- `src/components/DrustveneMareze.jsx` — početna stranica (grid alata)
- `src/components/FacebookObjava.jsx` — wizard za Facebook objavu
- `src/components/InstagramObjava.jsx` — wizard za Instagram caption
- `src/App.jsx` — rute: `/`, `/alati/facebook-objava`, `/alati/instagram-objava`

## Build

```bash
npm run build
```

Produkcijski fajlovi u `dist/`.

## Deploy na Netlify

Frontend i API (Netlify Functions) na jednom mestu:

```bash
npm run deploy
```

**Env varijable** — postavi u Netlify Dashboard (Site settings → Environment variables): `API_SECRET`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GEMINI_API_KEY`, `VITE_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, itd.

(Projekat mora biti povezan: `netlify link`)

## Bubble integracija

**Workflow (copy-paste iz generator slika):**
1. Trigger: klik na element (npr. "Facebook Objave")
2. Step 1: Show Obavestenje 1 — *Only when*: `words used > available` OR `datum vazenja < now`
3. Step 2: Open external website — *Only when*: `words used < available` AND `datum vazenja > now`  
   **Destination:** `https://facebook.pisac.master-bot.ai/?email=Current User's email`

**Bubble workflow za update reči:** Kreiraj workflow koji prima `user_email` i `words`, ažurira potrošnju. URL stavi u `.env` kao `VITE_BUBBLE_UPDATE_WORDS_URL`.
