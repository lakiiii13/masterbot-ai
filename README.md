# Maste Bot — AI alat za društvene mreže

React aplikacija za kreiranje sadržaja za Facebook i Instagram (objave, caption-i). Koristi OpenAI API (GPT-4o / GPT-4 Turbo).

## Pokretanje

```bash
npm install
npm run dev
```

Otvori `http://localhost:5173`. Početna stranica nudi grid alata; klik na **Facebook objava** ili **Instagram objava** vodi u wizard (korak po korak).

## Konfiguracija

Kopiraj `.env.example` u `.env` i unesi OpenAI API ključ:

```
VITE_OPENAI_API_KEY=sk-proj-...
```

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
