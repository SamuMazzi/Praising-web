<p align="center">
  <img src="public/icons/icon-192x192.png" alt="Praising" width="96" height="96">
</p>

<h1 align="center">Praising</h1>

<p align="center">
  Lyrics and chords for Christian worship songs, always in your pocket. Even offline.
  <br>
  <a href="https://praising.vercel.app"><strong>praising.vercel.app</strong></a>
</p>

---

Praising is a Progressive Web App for people who play and sing at Mass, in
prayer groups and at gatherings: more than 230 songs with chords, key
transposition, shareable setlists and the daily readings. It installs from
the browser and works without a connection, for when there's no signal in
church.

The app and its song catalog are in Italian.

[![Praising demo](docs/demo.gif)](docs/demo.mp4)

## Features

- **Songs with chords**: ChordPro rendering with highlighted choruses and
  text size fitted to the screen.
- **Transposition** to any key, with a choice of sharps or flats and of
  Italian solfège (Do, Re, Mi…) or letter notation (C, D, E…).
- **Search and filters** by title, author and part of the Mass (entrance,
  offertory, communion…).
- **Playlists** to prepare the setlist for a celebration and share it with
  the rest of the choir.
- **PDF export** of songs, ready to print.
- **Daily readings** from the Catholic liturgy.
- **Offline**: every chord sheet is available without a network; full pages
  can be downloaded from Settings → "Disponibilità offline".
- **Community contributions**: signed-in users can propose new songs,
  alternative chord versions and audio tracks for individual voice parts.
  Every submission is reviewed before it goes live.
- **Screen stays on** while a song is open.

## Tech stack

| Area       | Technologies                                                                      |
| ---------- | --------------------------------------------------------------------------------- |
| Framework  | [Next.js](https://nextjs.org) 15 (Pages Router), React 19, TypeScript             |
| UI         | [MUI](https://mui.com) 7                                                          |
| State      | Redux Toolkit, persisted to `localStorage`                                        |
| Chords     | [ChordSheetJS](https://github.com/martijnversluis/ChordSheetJS) (ChordPro format) |
| Backend    | Firebase: Auth, Firestore, Storage                                                |
| PWA        | [Serwist](https://serwist.pages.dev)                                              |
| Monitoring | Sentry                                                                            |
| Hosting    | Vercel                                                                            |

## Running locally

Requirements: **Node 22** (see `.tool-versions`) and **python3**, used by
the build scripts.

```bash
git clone https://github.com/SamuMazzi/Praising-web.git
cd Praising-web
npm install
npm run dev
```

The app runs at <http://localhost:3000>. The service worker is disabled in
development: to try offline mode you need a production build
(`npm run build && npm run start`).

> [!NOTE]
> The Firebase config in `logic/server/firebase_config.ts` points at the
> production project (it is the public web config and holds no secrets).
> If you are working on features that write to Firestore or Storage, swap
> it for the config of your own Firebase project.

### Useful commands

| Command              | What it does                                 |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Development server                           |
| `npm run build`      | Production build, service worker and sitemap |
| `npm run start`      | Serve the production build                   |
| `npm run lint:check` | ESLint                                       |
| `npm run format`     | Prettier                                     |
| `npx tsc --noEmit`   | Type check (the build does not fail on lint) |
| `npm run knip`       | Unused files, exports and dependencies       |

### Environment variables

None are needed to run the app. They are only used by a few server-side
features:

| Variable                                                      | Used for                                    |
| ------------------------------------------------------------- | ------------------------------------------- |
| `EMAIL_USER`, `EMAIL_PASS`, `RECIPIENT_EMAIL`                 | Email notifications for new submissions     |
| `FIREBASE_SERVICE_ACCOUNT` / `GOOGLE_APPLICATION_CREDENTIALS` | Review queue and song sync scripts          |
| `VERCEL_DEPLOY_HOOK_URL`                                      | Triggering a deploy when a song is approved |

## Project structure

```
pages/              Next.js routes (songs, playlists, readings, settings…) and API
components/         React components
logic/
  songs.config.json    Song catalog
  handle_text_song.ts  ChordPro → HTML, transposition, notation
  redux/               State slices
  server/              Firebase clients (auth, Firestore, Storage)
  hooks/               Data-loading hooks
public/accordi/     One .crd (ChordPro) file per song
scripts/            Review queue and song sync
init-service-worker.ts  Service worker source
```

## Adding or fixing a song

The catalog is made of static files, so a fix is a regular pull request.

1. Create or edit the file in `public/accordi/` in
   [ChordPro](https://www.chordpro.org/chordpro/) format, with chords in
   Italian notation inside square brackets and the chorus between `{soc}`
   and `{eoc}`:

   ```
   {key: Sol}
   [Sol]Lode al no[Re]me Tuo, dalle [Mi-]terre più flo[Do]ride,
   {soc}
   [Sol]Tornerò a lo[Re]darti sempre, [Mi-]per ogni dono [Do]Tuo,
   {eoc}
   ```

2. For a new song, add its entry to `logic/songs.config.json` (title, file
   name, author, part of the Mass, link and an unused `Id`).
3. Check the result with `npm run dev` by opening `/songs/<id>`.

You can also propose a song straight from the app, on the **Contribuisci**
(Contribute) page.

## Contributing

Issues and pull requests are welcome: wrong chords, missing songs, bugs or
ideas. For larger changes, please open an issue first so we can discuss it.

Before sending a PR:

```bash
npm run lint:check
npm run format:check
npx tsc --noEmit
```

The user interface is in Italian, so new user-facing strings should be too.
