# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Praising — an Italian PWA for viewing lyrics and chords of Christian worship songs (Next.js **Pages Router**, TypeScript, MUI, Redux Toolkit, Firebase). UI strings, comments and song metadata are in Italian; keep new user-facing text in Italian.

## Commands

```bash
npm run dev            # next dev
npm run build          # next build + python3 script.py --fix-service-worker --update-sitemap
npm run start          # serve production build
npm run deploy         # script.py --generate-revisions && vercel build --prod && vercel --prebuilt --prod
npm run lint:check     # eslint .   (lint:fix to autofix; note: `npm run linter` calls a non-existent lint:next script)
npm run format         # prettier --write .  (format:check to verify)
npm run knip           # unused files/exports/deps
npm run pending        # review queue CLI: list | approve | reject | recount (see below)
npx tsc --noEmit       # typecheck — the build does NOT fail on lint (eslint.ignoreDuringBuilds: true)
```

Node 22.18.0 (`.tool-versions`). `npm run build` requires **python3** on PATH. There is no test framework in this repo — no unit/e2e tests exist.

`script.py` is a build helper: `--fix-service-worker` escapes apostrophes in `.crd` filenames inside the generated `public/sw.js`; `--update-sitemap` syncs `public/sitemap.xml` from `logic/songs.config.json` + file mtimes; `--generate-revisions` writes page hashes to `info_revision.json` for SW precaching.

## Architecture

### Song catalog: static, file-based

The canonical catalog is **`logic/songs.config.json`** (Italian keys: `Nome`, `Nome file`, `Caratteristica`, `Parte della messa`, `Link`, `Autore`, `Id`) and the chord files in **`public/accordi/*.crd`** (ChordPro). `logic/local_logic.ts` maps that JSON into the `Song` interface (memoized in a module-level `localSongs`) and is the only place the Italian field names are translated. Adding a song = drop a `.crd` in `public/accordi/` + add an entry to `songs.config.json`; the sitemap/SW updates come from `npm run build`.

Chord content reaches the client two ways, and both must keep working:

- **SSG** — `pages/songs/[id]/index.tsx` uses `getStaticPaths` over every catalog id and `getStaticProps` reads the `.crd` from disk into `initialContent` (done for SEO; see commit `9748563`).
- **`/api/song/[id]`** — reads the same file at runtime with a `Cache-Control` header; used for reloads, offline SW caching (`songs-v1`), and when a user-specific version is requested. `useContentSong` skips the initial fetch when SSG already supplied content.

### Rendering pipeline

`logic/handle_text_song.ts` is the core: ChordPro → `chordsheetjs` → HTML, then post-processed with `cheerio` to tag chorus/chord/lyrics/column CSS classes (styled by `components/song_div.module.css`). It also handles transposition, sharp/flat choice (`DIESIS_NOTES`) and symbol↔solfège notation (`ChordNotations`, default solfège). `logic/song_to_pdf.ts` (html2canvas + jspdf) produces printable PDFs.

### State

Redux Toolkit store (`logic/redux/store.tsx`) with `playlist`, `infoSongs`, `settings`, `userInfo` slices (`sessions_slice` exists but is commented out). Use the typed `useAppSelector` / `useAppDispatch` exports. **Slices persist to localStorage inside their reducers** via `saveToStorage`/`getFromStorage` from `local_logic.ts`, and `initialState` reads from localStorage — this is why `_app.tsx` renders nothing until `mounted` (avoids hydration mismatch on theme/settings).

### Firebase layer (`logic/server/`)

Despite the name, these are **client-side** modules (`firebase_config.ts` holds public web config): `auth.ts` (Google + anonymous auth, with anonymous→Google account linking that migrates the old user doc), `database.ts` (Firestore: `users`, `songs`/`versions`/`parts`, `playlist`; persistent local cache enabled only in production), `storage.ts` (user song versions at `songs/{songId}/{versionId}.crd`, audio parts at `songs/{songId}/parts/{partId}.mp3`). `emails.ts` only declares the payload types shared with the `pages/api/*` nodemailer endpoints (`EMAIL_USER`/`EMAIL_PASS` env vars). `ai.tsx` is fully commented-out/dead.

Auth state flows through `logic/context/auth_context.tsx` → `useFirebaseAuth`; data-fetching hooks in `logic/hooks/` (`use_content_song`, `use_playlists`, `use_single_playlist`, `use_parts_song`, `use_lecture`) all gate on `loading`/`authUser` before hitting Firebase.

Playlists are **dual-source**: Redux/localStorage plus Firestore. `usePlaylists` merges legacy localStorage playlists (which may be an array _or_ a record — `getOldLegacyPlaylists` normalizes) with shared and owned server playlists. Preserve that legacy path when touching playlist code.

### Review queue (pending versions & parts)

User-submitted song versions and audio parts are written to Firestore with
`state: 'pending'` and must be approved by hand. There is **no admin UI** — the
comment at `logic/server/database.ts:297` describes the manual two-step approval.

The queue is read straight out of Firestore by `scripts/lib/pending_queue.mjs`
(shared module, `firebase-admin`, credentials from `FIREBASE_SERVICE_ACCOUNT`
JSON or `GOOGLE_APPLICATION_CREDENTIALS` path):

- `.github/workflows/pending-review.yml` runs `scripts/report_pending.mjs` daily
  and keeps **one** GitHub issue in sync (created when work is pending, updated
  silently, commented on only for new/newly-stuck items, closed when empty).
- `npm run pending` (`scripts/pending.mjs`) acts on it: `list`, `approve`,
  `reject`, `recount [--fix]`. `approve` does the state flip and the counter
  decrement in one batch so they cannot drift.

The `pages/api/notification-song-*` emails are a _convenience ping only_ — they
are one-shot and were previously the only signal that anything was pending.
Never treat them as the source of truth again.

Two schema traps when touching this data: `author` holds a **uid** on `versions`
but a typed **display name** on `parts` (uid is in `userId` there), and version
documents created before 2026-08 have no `userId` field at all.

### Daily liturgy

`logic/scraper_liturgy.ts` scrapes chiesacattolica.it with cheerio into `WebStructLiturgy`; exposed via `pages/api/lectures/[date].ts` and consumed by `pages/lectures.tsx` through `use_lecture`. Selectors are brittle by nature — expect breakage there when readings fail to load.

### PWA / service worker

`@serwist/next` compiles `init-service-worker.ts` → `public/sw.js` (disabled in development, registered manually in `_app.tsx`, not by the plugin). `public/sw.js` and `public/sitemap.xml` are **generated build outputs** — edit `init-service-worker.ts` / `script.py`, never the generated files.

### Other conventions

- Path alias `@/*` → repo root; files are `snake_case.tsx`, components default- or named-exported from `components/`.
- Routes are centralized in `logic/routes.ts` — add new paths there.
- Prettier: single quotes, no trailing commas, 80 cols, 2 spaces. ESLint flat config extends next + `eslint-config-love` + prettier and ignores `pages/api`, `public/`, `components/react-smooth-dnd/` (vendored fork of smooth-dnd).
- Sentry is wired through `next.config.mjs` + `instrumentation*.ts` / `sentry.*.config.ts`; `VERSION_APP` in `local_logic.ts` must be kept in sync with `package.json`'s `version`.
- `route.ts` (root) is empty and `tmp_part/` is scratch — ignore both.
