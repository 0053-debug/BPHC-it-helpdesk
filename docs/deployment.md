# No-card demo and hosting options

The app has a React/Vite frontend, a Java/Spring Boot API, and a PostgreSQL
database. Firebase Hosting Spark can serve the static frontend, but it does not
run this Spring Boot API. The API still needs a running machine or a backend
hosting service. The current no-card option below runs the complete app on your
computer and shares it through a temporary Cloudflare Quick Tunnel. It uses the
Neon connection already stored in the ignored root `.env` file.

## Share a live demo without adding a card

Install Java 17+, Node.js, and `cloudflared`. In a PowerShell terminal at the
repository root, start the API:

```powershell
.\scripts\run-backend.ps1
```

This reads the root `.env` into the backend process. It does not print the
environment values. In a second terminal, start the frontend:

```powershell
cd frontend
npm ci
npm run dev
```

In a third terminal, expose the frontend and its Vite-proxied API:

```powershell
cloudflared tunnel --url http://localhost:5173
```

Open the `https://...trycloudflare.com` address printed in that terminal. The
browser app and API share the same origin, and API/WebSocket requests are proxied
to the local Spring Boot process. Keep all three terminals and your computer
running during the demo. The app will use the configured Neon database.

The Quick Tunnel URL is temporary, anyone with it can reach the app, and the URL
changes when a new tunnel is started. Cloudflare documents Quick Tunnels as a
testing/development option without an account or domain and without an uptime
guarantee. Use the app's login and share the link only with demo participants.
Optionally, restrict the tunnel to specific email addresses by adding one or
more `--allowed-mail email@example.com` arguments to the tunnel command.

## Firebase Hosting

Firebase Hosting can publish the static frontend, but a Firebase Hosting deploy
alone does not make the Java API available. A complete Firebase-hosted website
needs a separate reachable API service. If you later configure one, set the
GitHub Actions repository variables `VITE_API_BASE_URL` (ending in `/api`) and
`VITE_WS_BASE_URL` (the API origin) before using the Firebase or desktop/mobile
build workflows. Do not place database credentials or `JWT_SECRET` in frontend
variables; those remain server-side.

## Keep credentials private

The local root `.env` is ignored by Git. Spring Boot does not read `.env` on its
own; use `scripts/run-backend.ps1` so the saved database and JWT variables are
exported to the backend process. Do not paste their values into chat, frontend
configuration, or GitHub repository variables. On a hosted backend, copy the
existing values directly from your local file into that provider's server-side
secret settings; you do not need to regenerate the Neon credentials or JWT
secret for that reason.

References: [Cloudflare Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/),
[Firebase Hosting usage and pricing](https://firebase.google.com/docs/hosting/usage-quotas-pricing),
and [Neon pricing](https://neon.com/pricing).
