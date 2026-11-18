# Free-tier deployment

The v1.1.0 stack uses Firebase Hosting for the static React/PWA site, Render's
free Docker web service for the Spring Boot API, and Neon for managed PostgreSQL.
Firebase Hosting serves the browser app directly. The app calls the API and
WebSocket endpoint on Render, so Hosting does not need a Cloud Run rewrite.

This setup is intended for coursework, demos, and low traffic. Render free web
services sleep after 15 minutes without incoming requests and can take about a
minute to wake. Neon free projects have monthly compute and storage limits. The
SLA monitor only runs while the Render API is awake. Do not use this configuration
for a production service that requires continuous monitoring or uptime guarantees.
Render's own free PostgreSQL expires after 30 days, so use Neon for the database.

## 1. Create the Neon database

Create a PostgreSQL project in Neon and choose the Singapore region to match the
Render API. Use the pooled connection option if the Neon console offers it. Keep
the connection details private. Configure Render with these environment values:

- `SPRING_DATASOURCE_URL` — JDBC URL such as
  `jdbc:postgresql://HOST/DB_NAME?sslmode=require`.
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET` — a random secret with at least 32 bytes of entropy.

The application initializes its schema and sample services/SLA policies when the
API starts. Sign-up creates employee accounts; no production credentials are
seeded.

## 2. Deploy the API to Render

1. Create a Render account and connect the GitHub repository
   `0053-debug/BPHC-it-helpdesk`.
2. Choose **New > Blueprint** and select this repository. Render reads
   `render.yaml` and creates the `bphc-iitsm-api` free web service in Singapore.
3. When prompted, enter the four environment values above. You can also edit them
   later under the service's **Environment** page. Never add them to GitHub or
   the source tree.
4. Wait for the first deploy to finish, then copy the service URL. It will look
   like `https://bphc-iitsm-api.onrender.com`.

The web service listens on Render's `PORT` setting. The Docker image is built
from `backend/Dockerfile`; later pushes to `main` trigger a redeploy.

## 3. Point the frontend at Render

The source defaults to `https://bphc-iitsm-api.onrender.com`. If Render assigns a
different URL, add these repository variables under GitHub **Settings > Secrets
and variables > Actions > Variables**:

- `VITE_API_BASE_URL` — `https://YOUR-RENDER-HOST/api`
- `VITE_WS_BASE_URL` — `https://YOUR-RENDER-HOST`

These are public endpoint URLs, not secrets. The PWA build, desktop installer,
and Android package workflows use the same values. The backend's CORS defaults
already allow the Firebase web domains and Capacitor app origins.

## 4. Deploy Firebase Hosting

Firebase Hosting's Spark plan can serve this static site within its no-cost
quotas. The Hosting configuration is in `firebase.json`; it contains only the
single-page-app fallback and static asset headers.

For an automated deploy, add `FIREBASE_TOKEN` under GitHub **Settings > Secrets
and variables > Actions > Secrets**, then run **Deploy Firebase Hosting** from
the repository's Actions tab. To generate the token, run
`npx firebase-tools login:ci` on your computer and store its output directly
in GitHub. This token is sensitive. Firebase currently labels this CI-token
method as legacy.

Alternatively, sign into the Firebase CLI locally and deploy from the repository
root:

```powershell
npx --yes firebase-tools@latest login
npx --yes firebase-tools@latest deploy --only hosting --project bphc-it-helpdesk
```

The live site URL is `https://bphc-it-helpdesk.web.app`. Downloadable desktop and
Android builds are attached to the GitHub v1.1.0 release rather than stored on
Firebase Hosting.

## 5. First account

Register through the site to create an employee account. If the project needs
admin/technician dashboards, promote the initial trusted account through the
Neon SQL editor, then sign out and sign in again:

```sql
UPDATE users
SET role = 'ROLE_ADMIN'
WHERE email = 'your-email@example.com';
```

Only grant that role to a trusted account. Do not enable demo accounts on a
public deployment.

## Limits and costs

Firebase Hosting's Spark quotas cover the static site. Render's free API sleeps
when idle, and Neon caps free database compute/storage. The first API request
after sleep is slow, and automated SLA monitoring pauses while Render sleeps.
Check each provider's current limits before relying on this for a live service.

References: [Render free services](https://render.com/docs/free),
[Neon free plan](https://neon.com/pricing), and
[Firebase Hosting quotas](https://firebase.google.com/docs/hosting/usage-quotas-pricing).
