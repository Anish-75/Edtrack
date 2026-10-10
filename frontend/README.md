# Marksheet Parser Frontend

The React 19 and Vite interface for uploading Excel marksheets and viewing generated student results.

## Run Locally

Install dependencies and start Vite:

```powershell
npm install
npm run dev
```

Start the backend separately from the repository root:

```powershell
cd backend
..\.venv\Scripts\Activate.ps1
python main.py
```

Open the URL printed by Vite, normally `http://localhost:5173`. With the default empty API base, Vite proxies API requests to `http://localhost:8000`.

## Environment

Copy `.env.example` to `.env.local` when you need custom values:

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_BASE` | empty | API origin or path prefix. Empty keeps the development proxy active. |
| `VITE_API_KEY` | empty | Optional `X-API-Key` header value; pair with the backend `API_KEY`. |

These values are compiled into client-side code. Do not put a private production secret in `VITE_API_KEY`.

## Scripts

```powershell
npm run dev
npm run lint
npm run build
npm run preview
```

## Source Layout

```text
src/App.jsx              App state and workflow orchestration
src/components/          Header, upload, processing, results, table, and toast
src/hooks/               Health status polling
src/styles/tokens.css    Light and dark theme variables
src/styles/app.css       Base component styles
src/styles/design.css    Current visual direction and responsive overrides
src/utils/               API URLs/errors, SGPA values, and formatters
public/favicon.svg       Accent-matched SVG favicon
```

## Screenshot

<!-- Screenshot placeholder: add an application screenshot at ../docs/screenshots/marksheet-parser.png. -->

![Application screenshot placeholder](../docs/screenshots/marksheet-parser.png)