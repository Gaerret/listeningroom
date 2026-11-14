# The Listening Room

Personal vinyl collection and wishlist, built with Next.js App Router, React and TypeScript. Warm amber light, dark wood and an analog Hi-Fi atmosphere, with responsive layouts for desktop and iPhone.

## Run locally

Requires Node.js 22.18+ (Node 24 recommended) and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For production: `npm run build` then `npm start`.

## MVP

- Collection and wishlist with counts, album/artist search, genre filters and sorting.
- Add, edit and remove records; move a wishlist record to the collection through its Shelf field.
- Record year, genre, sleeve color and personal notes.
- Browser-local persistence with validated JSON backup export/import. Import adds unseen IDs and preserves existing records.
- Responsive layout, keyboard focus styles, native accessible modal, form validation and reduced-motion support.

The first visit shows eight **demo records** with original CSS sleeve illustrations, not official album artwork. All records can be edited or removed. There are no accounts, credentials, database, music playback or third-party catalog integrations. Data stays in the current browser and does not automatically sync between Mac and iPhone. Export/import transfers it manually. Browser storage can be cleared; keep backups. Corrupted saved data is preserved rather than silently replaced. Google Fonts supplies optional typefaces, with local serif/sans-serif fallbacks if unavailable.

## Validation

```sh
npm test
npm run typecheck
npm run build
```

Unit tests cover backup schema validation, malformed imports, duplicate IDs and limits. A production build checks Next.js compilation and TypeScript. Browser interaction and physical iPhone/Safari testing remain separate manual checks.

No environment variables are required. Deploy to a host supporting Next.js 16 and Node.js; no hosting account is preconfigured.

## Docker

Build and run the production container with Docker Compose:

```sh
docker compose up -d --build
```

The application is exposed on port `3100` on the host. Follow logs with:

```sh
docker compose logs -f listeningroom
```
