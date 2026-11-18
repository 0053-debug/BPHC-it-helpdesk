# Website and app builds

The release is **I-ITSM 1.1.0**. The browser app is a Firebase Hosting single-page
site; `/api` and `/ws-iitsm` are rewritten to the `iitsm-api` Cloud Run service.
The Spring Boot API uses PostgreSQL, so Hosting alone is not a complete live
deployment.

## Cloud services setup

The Firebase project is `bphc-it-helpdesk`; Hosting uses
`https://bphc-it-helpdesk.web.app`. Hosting configuration is in `firebase.json`.
The backend container is in `backend/Dockerfile` and the manual GitHub Actions
workflow `.github/workflows/deploy-backend.yml` deploys it to Cloud Run in
`asia-south1`.

Before deploying the API, create these Secret Manager secrets in the Google
Cloud project and grant the Cloud Run runtime service account access to them:

- `SPRING_DATASOURCE_URL` — JDBC URL for a reachable PostgreSQL database.
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET` — a randomly generated secret of at least 32 bytes.

The GitHub repository needs a `GCP_SERVICE_ACCOUNT_KEY` Actions secret containing
service account credentials authorized to build and deploy Cloud Run and use
those Secret Manager values. Configure the Firebase deploy credential as the
`FIREBASE_TOKEN` Actions secret. Then run **Deploy API to Cloud Run** followed by
**Deploy Firebase Hosting** from the Actions tab. These workflows are manual so
an ordinary source push does not publish a release. The Hosting deployment
expects the `iitsm-api` Cloud Run service to exist first.

The current Firebase project does not have a Cloud Billing account attached.
Google therefore blocks enabling Cloud Run and its image registry APIs, so the
live Hosting deploy cannot be finalized yet. Attach a billing account to the
project, create the PostgreSQL database and secrets above, deploy the API, then
deploy Hosting. The application itself can remain within free quotas, but Cloud
Run and the database may incur charges depending on use and provider settings.

## Desktop and Android packages

Push a `v1.1.0` tag to run `.github/workflows/release-apps.yml`. It builds a
Windows NSIS installer, a universal macOS DMG, and an Android APK, then attaches
them to a GitHub Release. The Firebase landing page links to those release
assets. Windows and macOS installers are unsigned; the operating systems may
show an installation warning. The Android APK is debug-signed for evaluation
and sideloading, not Play Store publication.

On iPhone/iPad, visit the Hosting website in Safari, choose **Share**, and tap
**Add to Home Screen**. The site is a PWA with an app icon and standalone
display. A distributable iOS IPA or App Store listing requires Apple Developer
signing credentials and provisioning, which are not stored in this repository.
Native Android and iOS project shells are included in `frontend/`. Run
`npm run cap:sync` before opening Android Studio or Xcode. Open the iOS project
on a Mac with Xcode when signed iOS distribution is configured.

## Local development

Run the backend and frontend as described in the root README. The browser uses
Vite's `/api` and `/ws-iitsm` development proxies. To launch the desktop shell,
run `npm run electron:dev` from `frontend/`. To prepare native project files,
run `npm run cap:init:android` or `npm run cap:init:ios` once to generate a
native project, then use `npm run cap:sync` and open it with Android Studio or
Xcode.

Never put database passwords, signing keys, Firebase service-account files, or
JWT secrets in the repository or built frontend.
