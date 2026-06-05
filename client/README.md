# Shamutha Client (Frontend)

The frontend web application for the **Shamutha AI EdTech Super Platform**, built with **React 18** and **Vite 5**. It delivers the dashboard, coding arena, live classes, AI interview UI, mock tests, and the Razorpay-powered checkout.

## ✨ Features

*   **Interactive Dashboard**: Personalized student dashboard tracking course progress, XP, and test history.
*   **Coding Interface**: Integrated code editor for executing algorithms and participating in real-time Coding Battles.
*   **Live Classes Module**: Real-time webinars featuring WebRTC video streams and a collaborative drawing canvas (`LiveClassesModule.jsx`).
*   **AI Interview UI**: Record audio answers and interact with the AI virtual interviewer (transcription via the backend).
*   **AI Mock Tests & Resume Builder**: Dynamic assessments and resume tooling.
*   **Payment UI**: Course enrollment checkout flows integrated with **Razorpay** (test & live).

## 🛠️ Technology Stack

| Concern | Library |
|---|---|
| UI framework | React 18 (`react`, `react-dom`) |
| Build tool / dev server | Vite 5 (`@vitejs/plugin-react`) |
| State management | Redux Toolkit + React Redux (`store.js`) |
| Real-time | `socket.io-client` |
| WebRTC (P2P video) | `simple-peer` |
| On-device ML | `@tensorflow/tfjs` |
| Icons | `lucide-react` |
| Payments | Razorpay Checkout (loaded at runtime), `@stripe/stripe-js` |

## 📁 Project Structure

```
client/
├── index.html              # Vite entry HTML
├── vite.config.js          # Dev server (port 3000) + proxy to backend
├── src/
│   ├── main.jsx            # React/Redux root
│   ├── App.jsx             # Main application & routing/tabs
│   ├── store.js            # Redux Toolkit store & slices
│   ├── LiveClassesModule.jsx  # WebRTC video + collaborative canvas
│   ├── flashProxy.js       # Proxy helper
│   └── index.css           # Global styles
└── dist/                   # Production build output
```

## 🛠️ Setup & Installation

1.  **Navigate to the client directory**:
    ```bash
    cd client
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    Create a `.env` file in the root of the `client` folder:
    ```env
    # Razorpay Test Key ID for the checkout popup.
    # MUST match RAZORPAY_KEY_ID in server/.env, or the Razorpay page fails to load.
    VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

    # Optional — override the backend base URL (defaults to http://localhost:5001).
    # VITE_BACKEND_URL=http://localhost:5001
    ```
    > ⚠️ **Vite only reads `.env` at startup.** After changing any `VITE_*` value you must **restart** the dev server — a browser refresh alone will not pick it up.

4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    The app runs at **`http://localhost:3000`**. `vite.config.js` proxies `/api` and `/socket.io` to the backend at `http://localhost:5001`, so the client and server can run side by side without CORS issues.

## 📜 Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server on port 3000 (with `--host` for LAN access). |
| `npm run build` | Produce an optimized production build in `dist/`. |
| `npm run preview` | Serve the production build locally for a final check. |

## 🏗️ Build for Production

```bash
npm run build
```
The optimized static files are generated in the `dist/` directory, ready to be served by any static host or the project's Docker setup.
