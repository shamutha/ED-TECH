# Shamutha Server (Backend)

This directory contains the Node.js/Express backend API for the Shamutha EdTech platform. It handles business logic, database persistence, real-time Socket.IO coordination, and AI/Payment integrations.

## ✨ Features

*   **RESTful API**: Endpoints for users, courses, mock tests, and analytics.
*   **Real-time Coordination**: Socket.IO integration powering Coding Battles matchmaking, webinar chats, and live canvas syncing.
*   **Database Abstraction**: Connects to MongoDB via Mongoose, with a seamless fallback to a local `database.json` file if MongoDB is unavailable.
*   **Redis Caching**: Built-in Redis support for caching data, with an in-memory fallback.
*   **AI Integrations**: `/ai/transcribe` endpoint utilizing OpenAI Whisper, and stub endpoints for plagiarism checking.
*   **Payment Gateways**: Secure endpoints to generate Razorpay orders and Stripe payment intents/subscriptions.
*   **Dynamic PDFs**: Certificate generation using `pdfkit`.
*   **WebRTC Signalling**: Stubs for handling WebRTC offers, answers, and ICE candidates for peer-to-peer video streaming.

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
    Create a `.env` file in the root of the `server` folder. Add the necessary keys based on the features you want to enable:

    ```env
    # Server Port
    PORT=5001

    # Database & Caching
    MONGO_URI=mongodb://localhost:27017/shamutha
    REDIS_URL=redis://localhost:6379

    # Payments
    RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_secret
    STRIPE_SECRET_KEY=your_stripe_secret

    # AI & Media
    OPENAI_API_KEY=your_openai_api_key
    ```
    *Note: The server is designed to be resilient. If `MONGO_URI`, `REDIS_URL`, or `OPENAI_API_KEY` are missing or fail to connect, the server will gracefully fall back to local storage, in-memory caching, and stubbed responses respectively.*

4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    The server will start (defaulting to `http://localhost:5001`) and listen for both HTTP and Socket.IO connections.
