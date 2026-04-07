## Spotify Presave Flow

This app provides an Instagram-safe Spotify presave journey with test mode and production auth flow.

## Environment

Create `.env.local` with:

```bash
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
REDIRECT_URI=http://127.0.0.1:3000/api/callback
SPOTIFY_TRACK_ID=...
# Optional explicit state signing secret
# SPOTIFY_STATE_SECRET=...
```

Make sure the same callback URI is added in Spotify Developer Dashboard.

## Local Development

```bash
npm run dev
```

Open `http://127.0.0.1:3000`.

Note: Dev mode may show HMR websocket warnings depending on browser extensions and local setup.

## Demo Mode (Recommended for Meetings)

Run a production-like local server to avoid dev HMR noise:

```bash
npm run demo
```

This builds and starts the app with `next start`.

## Quality Checks

```bash
npm run lint
npm run test
```

## Test Mode

Open with query params:

- `/?test=true` to skip Spotify API and simulate success
- `/?error=token_fail` to view error state rendering
