# Boink Client

React/Vite frontend for the Boink social app.

## Local development

1. Install dependencies with `npm install`.
2. Start the frontend with `npm run dev`.
3. Run the Express API separately. The Vite development proxy expects it at `http://localhost:5000`.

## Deploy to Vercel

Import this repository as its own Vercel project. Use the repository root, build command `npm run build`, and output directory `dist` (Vite is normally auto-detected).

Set the Vercel production environment variable `VITE_API_URL` to the deployed API base URL ending in `/api`, for example `https://your-api.example.com/api`, then redeploy. Do not put database credentials or JWT secrets in this frontend repository or in `VITE_*` variables.
