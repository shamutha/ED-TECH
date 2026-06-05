# Shamutha Server (Backend)

The **Node.js / Express** backend API for the Shamutha AI EdTech platform. It handles business logic, database persistence, real-time Socket.IO coordination, and AI/Payment integrations. The server is **ESM** (`"type": "module"`) and built to be **resilient** — missing external services fall back to local storage, in-memory caching, or stubbed responses.

## ✨ Features

*   **RESTful API**: Endpoints for resumes, interviews, courses, jobs, mock tests, analytics, and certificates.
*   **Real-time Coordination**: Socket.IO powering Coding Battles matchmaking, webinar chat, live canvas syncing, and proctoring signals.
*   **Database Abstraction**: MongoDB via Mongoose, with a seamless fallback to a local `database.json` file when MongoDB is unavailable (`db.js`).
*   **Redis Caching**: Optional Redis (`ioredis`) with an in-memory fallback.
*   **AI Integrations**: `/ai/transcribe` via OpenAI Whisper (`ai.js`) and a stubbed `/ai/plagiarism` endpoint.
*   **Payment Gateways**: Razorpay order creation (`razorpay.js`) and Stripe subscriptions (`stripe.js`).
*   **Dynamic PDFs**: Certificate generation using `pdfkit` (`certificate.js`).
*   **WebRTC Signalling**: Offer/answer/ICE-candidate relay for peer-to-peer video (`webrtc.js`).

## 🛠️ Technology Stack

Express 4 · Socket.IO 4 · Mongoose 8 · ioredis 5 · OpenAI SDK · Razorpay · Stripe · pdfkit · simple-peer · express-fileupload · dotenv

## 📁 Project Structure

```
server/
├── index.js          # App entry: Express, CORS, Socket.IO, Redis, route mounting
├── routes.js         # All REST endpoints (mounted under /api)
├── db.js             # Mongo connection + database.json fallback
├── database.json     # Local JSON datastore (fallback persistence)
├── razorpay.js       # Razorpay client (initialized only when keys are present)
├── stripe.js         # Stripe client
├── ai.js             # OpenAI Whisper transcription + AI helpers
├── certificate.js    # PDF certificate generation (pdfkit)
├── webrtc.js         # WebRTC signalling helpers
├── middleware/
│   └── auth.js       # Auth middleware
└── models/           # Mongoose schemas: Student, Job, Company, Application
```

## 🌐 API Endpoints

All routes are mounted under the `/api` prefix (e.g. `POST /api/payment/create-order`).

| Method | Path | Purpose |
|---|---|---|
| POST | `/resume` | Save a resume |
| GET | `/resume/:email` | Fetch a resume by email |
| POST | `/interview` | Save an AI interview result |
| GET | `/interviews` | List interviews |
| GET | `/analytics` | Performance analytics |
| POST | `/analytics/activity` | Record an activity event |
| POST | `/courses/enroll` | Enroll in a course |
| GET | `/courses/my-courses` | List enrolled courses |
| POST | `/jobs/apply` | Apply to a job |
| GET | `/jobs/applications` | List job applications |
| POST | `/compile` | Run/compile submitted code |
| POST | `/mocktest/generate` | Generate an AI mock test |
| POST | `/mocktest/submit` | Submit a mock test for grading |
| GET | `/mocktest/history` | Mock test history |
| POST | `/payment/create-order` | Create a Razorpay order |
| POST | `/payment/create-subscription` | Create a Stripe subscription |
| POST | `/ai/transcribe` | Transcribe audio (OpenAI Whisper) |
| POST | `/ai/plagiarism` | Plagiarism check (stub) |
| GET | `/leaderboard` | Coding battle leaderboard |
| GET | `/certificates/:userId` | Generate/fetch a PDF certificate |
| POST | `/webrtc/offer` · `/webrtc/answer` · `/webrtc/candidate` | WebRTC signalling |

## 🔌 Socket.IO Events

`join-webinar`, `webinar-chat-msg`, `canvas-draw`, `canvas-clear`, `join-battle-queue`, `battle-code-update`, `battle-win`, `proctor-violation`, plus `error` / `disconnect`.

## 🛠️ Setup & Installation

1.  **Navigate to the server directory**:
    ```bash
    cd server
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    Create a `.env` file in the root of the `server` folder.

    | Variable | Required? | Notes |
    |---|---|---|
    | `PORT` | optional | Defaults to `5001`. |
    | `MONGO_URI` | optional | Falls back to `database.json` if unset/unreachable. |
    | `REDIS_URL` | optional | Falls back to in-memory cache. |
    | `RAZORPAY_KEY_ID` | for payments | `rzp_test_…` (test) or `rzp_live_…` (live). |
    | `RAZORPAY_KEY_SECRET` | for payments | Server-side only — never expose to the client. |
    | `STRIPE_SECRET_KEY` | for Stripe | Subscription endpoint is stubbed without it. |
    | `OPENAI_API_KEY` | for AI | Transcription/AI responses are stubbed without it. |

    ```env
    PORT=5001
    MONGO_URI=mongodb://localhost:27017/shamutha
    REDIS_URL=redis://localhost:6379

    RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
    RAZORPAY_KEY_SECRET=your_razorpay_secret
    STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
    OPENAI_API_KEY=sk-xxxxxxxxxxxx
    ```
    > 💳 **Razorpay note:** `RAZORPAY_KEY_ID` here must match `VITE_RAZORPAY_KEY_ID` in `client/.env`. If the keys are missing, `/payment/create-order` returns a **mock** order; if the key/secret pair is invalid, Razorpay responds `401` and the endpoint returns `500`. Restart the server after editing `.env` (dotenv only reads it at boot).

4.  **Run the Server**:
    ```bash
    npm run dev    # nodemon, auto-restart on change
    # or
    npm start      # plain node
    ```
    The server starts on **`http://localhost:5001`** and listens for both HTTP and Socket.IO connections.

## 📜 Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with `nodemon` (auto-reload on file changes). |
| `npm start` | Start with plain `node` (production). |

## 🧩 Resilience

The server degrades gracefully: if `MONGO_URI`, `REDIS_URL`, or `OPENAI_API_KEY` are missing or fail to connect, it falls back to **local JSON storage**, **in-memory caching**, and **stubbed AI responses** respectively — so you can run the full app locally with zero external services configured.
