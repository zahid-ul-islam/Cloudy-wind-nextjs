# Deployment Guide for Cloudy Wind

This guide will walk you through deploying the **Cloudy Wind** application.
- **Backend**: Deployed to [Render.com](https://render.com)
- **Frontend**: Deployed to [Vercel](https://vercel.com)

## Prerequisites

1.  **GitHub Repository**: Ensure your project is pushed to a GitHub repository.
2.  **Render Account**: Sign up at [render.com](https://render.com).
3.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).

---

## Part 1: Deploy Backend to Render

1.  **Log in to Render** and go to your Dashboard.
2.  Click **New +** and select **Web Service**.
3.  **Connect your GitHub repository**:
    - Find your `Cloudy_Wind` repository and click **Connect**.
4.  **Configure the Service**:
    - **Name**: `cloudy-wind-backend` (or your preferred name)
    - **Region**: Choose a region close to you (e.g., Oregon, Frankfurt).
    - **Branch**: `main` (or your default branch).
    - **Root Directory**: `backend` (Important! This tells Render where the backend code lives).
    - **Runtime**: `Node`
    - **Build Command**: `npm install && npm run build` (Render might auto-detect this).
    - **Start Command**: `npm start` (Render might auto-detect this).
5.  **Environment Variables**:
    - Scroll down to the **Environment Variables** section.
    - Add the following keys and values (copy them from your local `backend/.env` file):
        - `MONGO_URI`: Your MongoDB connection string.
        - `JWT_SECRET`: Your secret key for JWT.
        - `NODE_ENV`: `production`
        - `PORT`: `10000` (Render uses this port by default, but good to be explicit).
        - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://cloudy-wind-frontend.vercel.app`). You can update this *after* deploying the frontend.
6.  **Create Web Service**:
    - Click **Create Web Service**.
    - Wait for the deployment to finish. You should see "Live" in the status.
    - **Copy the Backend URL**: It will look like `https://cloudy-wind-backend.onrender.com`. You will need this for the frontend.

---

## Part 2: Deploy Frontend to Vercel

1.  **Log in to Vercel** and go to your Dashboard.
2.  Click **Add New...** -> **Project**.
3.  **Import Git Repository**:
    - Find your `Cloudy_Wind` repository and click **Import**.
4.  **Configure Project**:
    - **Project Name**: `cloudy-wind-frontend` (or your preferred name).
    - **Framework Preset**: `Next.js` (Vercel should auto-detect this).
    - **Root Directory**: Click **Edit** and select `frontend`.
5.  **Environment Variables**:
    - Expand the **Environment Variables** section.
    - Add the following variable:
        - `NEXT_PUBLIC_API_URL`: Paste the **Backend URL** you copied from Render (e.g., `https://cloudy-wind-backend.onrender.com/api`). **Important**: Make sure to append `/api` if your backend routes are prefixed with it (which they are in `server.ts`).
6.  **Deploy**:
    - Click **Deploy**.
    - Vercel will build and deploy your frontend.
7.  **Verify**:
    - Once deployed, click the screenshot to visit your live site.
    - Test logging in or signing up to ensure the frontend can talk to the backend.

---

## Troubleshooting

-   **CORS Issues**: If you see CORS errors in the browser console, you might need to update the `cors` configuration in `backend/src/server.ts` to allow your new Vercel domain.
    -   *Quick Fix*: Set `origin: "*"` in your backend `cors` options temporarily, or add your Vercel domain to the allowed origins list and redeploy the backend.
-   **Database Connection**: If the backend fails to start, double-check your `MONGO_URI` in Render environment variables. Ensure your MongoDB Atlas IP whitelist allows access from anywhere (0.0.0.0/0) or specifically from Render's IPs (which can change).
