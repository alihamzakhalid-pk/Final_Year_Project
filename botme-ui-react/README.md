# BOTme UI (React + Vite)

Modern, responsive frontend for BOTme using React, Tailwind CSS, Material UI, and Framer Motion.

## Tech
- React 18 (Vite)
- Tailwind CSS
- Material UI (MUI)
- Framer Motion
- React Router

## Run locally
```bash
npm install
npm start
# or
npm run dev
```

## Environment
- Dev proxy is configured in `vite.config.js` to forward `/api` → `http://127.0.0.1:5000`.
- Optional: set a base URL without proxy using `VITE_API_URL`.

## API wiring
- Axios instance: `src/api/axios.js` (attaches `auth_token` from localStorage).
- Replace placeholder calls in `Login`, `Signup`, `Dashboard`, `Chat` with your Flask endpoints.
- Example endpoints:
  - POST `/api/login`, `/api/signup`, `/api/upload`, `/api/chat/:id`, `/api/contact`

## Routing
- React Router pages: `/`, `/login`, `/signup`, `/dashboard`, `/chat/:chatId`, `/about`, `/help`, `/contact`.

## Components
- Reusable: `Navbar`, `Footer`, `ProtectedRoute`, `AuthForm`, `UploadCard`, `ChatWindow`, `MessageInput`, `Avatar`, `Loader`.

## Structure
```
src/
  components/
  pages/
  assets/
  hooks/
  styles/
```

## Theming
- Light/dark mode with system preference and toggle.
- Tailwind classes and MUI theme synchronize via `useThemePreference`.

## Integrations
- Replace the placeholder in `src/pages/Chat.jsx` with your Flask API endpoint to send/receive messages.

