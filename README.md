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

## 📸 Application Screenshots

Here are the screenshots showcasing the features of the Shamutha EdTech Super Platform:

### 🖥️ Dashboard & Marketplace
*   **Student Dashboard**:
    ![Student Dashboard](./docs/screenshots/dashboard.png)
*   **Course Marketplace**:
    ![Course Marketplace](./docs/screenshots/course_marketplace.png)

### 💻 Coding Platform & Battles
*   **Practice Coding Platform**:
    ![Coding Platform](./docs/screenshots/coding_platform.png)
*   **Coding Battles (Lobby & Matchmaking)**:
    ![Coding Battles Matchmaking](./docs/screenshots/coding_battles_1.png)
*   **Coding Battles (Arena & Challenge Editor)**:
    ![Coding Battles Arena](./docs/screenshots/coding_battles_2.png)
*   **Leaderboard**:
    ![Leaderboard](./docs/screenshots/leaderboard.png)

### 🤖 AI-Powered Features
*   **AI Mock Interview Simulator**:
    ![AI Interview Simulator](./docs/screenshots/ai_interview.png)
*   **AI-Generated Mock Tests**:
    ![AI Mock Tests](./docs/screenshots/mock_test.png)
*   **AI Resume Builder**:
    ![AI Resume Builder](./docs/screenshots/resume_builder.png)

### 👥 Classroom, Career & Analytics
*   **Live Classes & Webinars**:
    ![Live Classes & Webinars](./docs/screenshots/live_classes.png)
*   **Placement Portal**:
    ![Placement Portal](./docs/screenshots/placement_portal.png)
*   **Performance Analytics & Progress**:
    ![Performance Analytics](./docs/screenshots/performance_analytics.png)
*   **Verifiable Certificates**:
    ![Verifiable Certificates](./docs/screenshots/certificate.png)

### 💳 Payments & Checkout (Razorpay)
End-to-end course enrollment powered by the Razorpay test gateway:

*   **Course Marketplace (Enroll Now)**:
    ![Course Marketplace](./docs/screenshots/payment/payment_marketplace.png)
*   **Razorpay Checkout — Payment Options**:
    ![Razorpay Checkout](./docs/screenshots/payment/payment_checkout.png)
*   **Save Card (RBI Guidelines)**:
    ![Save Card Consent](./docs/screenshots/payment/payment_save_card.png)
*   **OTP / 3-D Secure Authentication**:
    ![OTP Authentication](./docs/screenshots/payment/payment_otp.png)
*   **Confirming Payment**:
    ![Confirming Payment](./docs/screenshots/payment/payment_processing.png)
*   **Payment Successful**:
    ![Payment Successful](./docs/screenshots/payment/payment_success.png)
