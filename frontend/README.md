# Frontend

React 18 application bundled with Vite.

## Run

From this directory, run `npm ci` and then `npm run dev`. Vite serves the
frontend on port 5173 and proxies `/api` and `/ws-iitsm` to the backend on
`http://localhost:8080` as configured in `vite.config.js`.

Use `npm run build` to create a production bundle in `dist/`.
