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

- **VITE_API_URL** — URL backend-a (npr. `http://localhost:3000`)
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
