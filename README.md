<p align="center">
  <img src="assets/images/logo.png" alt="MyBasera logo" width="96" />
</p>

<h1 align="center">MyBasera</h1>

<p align="center">Find your basera — homes to buy and rent across Pakistan.</p>

MyBasera is a real-estate listings app built with Expo (React Native). Browse and filter
homes, see them on a map, chat with agents, negotiate offers, and close deals with a
confirmed record on both sides. Prices are in PKR.

## Features

- **Browse & search** — listings with search by area/city/name, property-type chips, and
  advanced filters (buy/rent, PKR price bands, bedrooms, bathrooms, facilities, sort).
- **Map** — OpenStreetMap via Leaflet; listing location preview and a full-screen map with
  an “Open in Google Maps” link.
- **Listings** — anyone can list a property with a photo (Supabase Storage), map
  coordinates (or “use my current location”), and facilities; owners can edit, delete,
  mark as sold, or relist.
- **Chat** — realtime messaging between buyers/tenants and agents.
- **Deals** — offer → counter → accept → both sides confirm completion; listings move to
  *Under offer* → *Sold/Rented*. Reviews are allowed only after a completed deal. Rentals
  link to the official provincial police tenant-registration services.
- **Favorites**, **profile** (photo upload, appearance, help, about), and account deletion.

## Tech stack

| Area | Choice |
| --- | --- |
| App | [Expo](https://expo.dev) SDK 57, React Native, TypeScript, Expo Router |
| Styling | NativeWind (Tailwind CSS), Reanimated animations |
| Auth | [Clerk](https://clerk.com) (email + password) |
| Backend | [Supabase](https://supabase.com) — Postgres with Row Level Security, Storage, Realtime |
| State | Zustand (client-only UI state) |
| Maps | Leaflet + OpenStreetMap tiles in `react-native-webview` |

## Getting started

### Prerequisites

- Node.js 20+ and npm
- A free [Supabase](https://supabase.com) project and a free [Clerk](https://clerk.com) application
- The [Expo Go](https://expo.dev/go) app on your phone (SDK 57), or a simulator

### 1. Install

```bash
git clone <your-repo-url> mybasera
cd mybasera
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your **publishable** keys only (they're bundled into the app):

| Variable | Where to find it |
| --- | --- |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `EXPO_PUBLIC_SUPABASE_KEY` | Supabase → Project Settings → API (publishable / anon key) |

Never put a Clerk secret key or a Supabase service-role / secret key in this app.

### 3. Set up the database

Run every file in [`supabase/migrations/`](supabase/migrations) **in filename order** — either
paste each into the Supabase SQL Editor, or link the project with the Supabase CLI and run
`supabase db push`. Then, optionally, run [`supabase/seed.sql`](supabase/seed.sql) for demo
listings (fictional agents and placeholder contact details).

### 4. Connect Clerk and Supabase

MyBasera uses Supabase's native third-party auth with Clerk, so database rules can check the
signed-in user:

1. In Clerk, activate the Supabase integration (Dashboard → `setup/supabase`) and copy your
   Clerk domain.
2. In Supabase, go to **Authentication → Sign In / Providers → Third-Party Auth**, add
   **Clerk**, and paste the domain.
3. In Clerk, enable **Email address** + **Password** sign-in.

### 5. Run

```bash
npx expo start --clear
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `a` / `i` / `w`
for Android, iOS or web.

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run android` / `ios` / `web` | Start and open a platform |
| `npm run lint` | Lint with ESLint (`eslint-config-expo`) |
| `npx tsc --noEmit` | Type-check |

## Project structure

```
src/
  app/          Expo Router screens ((auth), (tabs), property, deal, chat, …)
  components/   Reusable UI components
  constants/    Design tokens, brand, static data
  hooks/        Data hooks wrapping Supabase queries
  lib/          Supabase client, API helpers, formatting
  store/        Zustand stores
  types/        Database types
supabase/
  migrations/   SQL migrations — the source of truth for the schema
  seed.sql      Demo data
```

## Security

- All tables use Row Level Security; private data (chats, deals, favorites) is visible only
  to the people involved, and deal changes go through checked database functions.
- Only publishable keys live in the app. `.env*` files are git-ignored.
- Map tiles come from OpenStreetMap's community servers; for high-traffic production use,
  switch to a commercial OSM tile provider (see `src/lib/leaflet-html.ts`).

## License

[MIT](LICENSE) © 2026 Zaki
