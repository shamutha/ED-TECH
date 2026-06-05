# Shamutha Client (Frontend)

This directory contains the frontend web application for the Shamutha EdTech platform, built with React and Vite.

## ✨ Features

*   **Interactive Dashboard**: Personalized student dashboard tracking course progress and test history.
*   **Coding Interface**: Integrated code editor for executing algorithms and participating in live Coding Battles.
*   **Live Classes Module**: Real-time webinars featuring video streams and a collaborative drawing canvas.
*   **AI Interview UI**: Interfaces for recording audio answers and interacting with the AI virtual interviewer.
*   **Payment UI**: Seamless checkout flows integrated with Razorpay.

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
    Create a `.env` file in the root of the `client` folder. Add the following required variables:
    ```env
    # Your Razorpay Test Key ID for processing frontend payments
    VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
    ```

4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    The Vite development server will start, typically accessible at `http://localhost:5173`.

## 🏗️ Build for Production

To create a production build:
```bash
npm run build
```
The optimized static files will be generated in the `dist` directory.
