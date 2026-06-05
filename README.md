# Shamutha EdTech Super Platform

Welcome to the **Shamutha AI EdTech Super Platform**, a comprehensive MERN-stack application designed to revolutionize online learning, coding, and interview preparation.

## 🌟 Key Features

*   **Online Coding Platform**: Interactive code editor for practicing Data Structures & Algorithms.
*   **Real-time Coding Battles**: Compete with other students in live, timed coding challenges.
*   **AI Interview Simulator**: Voice-enabled AI mock interviews with transcription and real-time feedback.
*   **Live Classes & Webinars**: Interactive live sessions featuring WebRTC video and collaborative whiteboarding.
*   **AI-Generated Mock Tests**: Dynamic assessments tailored to student performance.
*   **Course Marketplace**: Browse, purchase, and track progress on various technical courses.
*   **Certificate Generation**: Automated, downloadable PDF certificates upon course completion.
*   **Payment Gateways**: Seamless subscriptions and payments via Stripe and Razorpay.
*   **Proctoring & Plagiarism**: Screen monitoring capabilities and AI-driven plagiarism checks.

## 🚀 Technology Stack

*   **Frontend**: React.js (Vite), TailwindCSS/Vanilla CSS, WebRTC
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (with local JSON fallback), Redis (caching)
*   **Real-time**: Socket.IO (Signalling, Chat, Live Whiteboard)
*   **AI Integrations**: OpenAI Whisper (Audio Transcription)
*   **Payments**: Razorpay & Stripe

## 📦 Project Structure

The repository is organized into two main workspaces:

*   [`/client`](./client/README.md) - Contains the React frontend application.
*   [`/server`](./server/README.md) - Contains the Node.js/Express backend API.

## ⚙️ General Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/shamutha/ED-TECH.git
    cd ED-TECH
    ```

2.  **Install dependencies for the Server**:
    ```bash
    cd server
    npm install
    ```

3.  **Install dependencies for the Client**:
    ```bash
    cd ../client
    npm install
    ```

4.  **Set up Environment Variables**:
    *   Create a `.env` file in the `server` directory (refer to `server/README.md` for required keys).
    *   Create a `.env` file in the `client` directory (refer to `client/README.md` for required keys).

5.  **Run the application**:
    You will need to run both the client and server concurrently. Open two terminal windows.
    
    *Terminal 1 (Backend):*
    ```bash
    cd server
    npm run dev
    ```
    
    *Terminal 2 (Frontend):*
    ```bash
    cd client
    npm run dev
    ```

The platform should now be accessible locally!
