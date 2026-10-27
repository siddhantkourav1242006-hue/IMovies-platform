# Deployment Guide — iMovies

This guide details how to deploy the **iMovies** production stack:
- **Frontend**: Vercel or Netlify
- **Backend & Socket.io**: Render
- **Database**: MongoDB Atlas

---

## 1. Database: MongoDB Atlas

1. Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free or dedicated cluster (M0 or higher).
2. Under **Database Access**, create a database user (e.g., `imovies_user`) and generate a secure password.
3. Under **Network Access**, add an IP access list entry allowing `0.0.0.0/0` (or Render's outbound IPs).
4. Go to **Database** → **Connect** → **Drivers (Node.js)** and copy the connection URI:
   ```env
   mongodb+srv://imovies_user:<password>@cluster0.abcde.mongodb.net/imovies?retryWrites=true&w=majority
   ```
5. Ensure the TTL index on the `seats` collection is enabled so expired holds clear automatically:
   - The Mongoose model automatically sets `lockedAt` with `expireAfterSeconds: 300`.

---

## 2. Backend & Real-Time Engine: Render

1. Log into [Render](https://render.com) and click **New +** → **Web Service**.
2. Connect your Git repository containing the project.
3. Configure the service settings:
   - **Name**: `imovies-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. In the **Environment Variables** section, configure:
   ```env
   PORT=10000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://imovies_user:<password>@cluster0.abcde.mongodb.net/imovies?retryWrites=true&w=majority
   JWT_SECRET=super_secure_random_jwt_secret_key_minimum_32_characters
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://imovies.vercel.app

   PAYMENT_GATEWAY=razorpay
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.xxxxxxxx
   FROM_EMAIL=tickets@imovies.com
   ```
5. Click **Create Web Service**. Note the deployed URL (e.g., `https://imovies-api.onrender.com`).
6. *Optional Database Seeding:* Run one-time database seed via Render SSH / Shell:
   ```bash
   node src/seeds/seed.js
   ```

---

## 3. Frontend: Vercel or Netlify

### Option A: Vercel (Recommended)
1. Log into [Vercel](https://vercel.com) and click **Add New** → **Project**.
2. Select your repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   ```env
   VITE_API_URL=https://imovies-api.onrender.com/api
   VITE_SOCKET_URL=https://imovies-api.onrender.com
   VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
   ```
5. Add Single Page Application (SPA) rewrite by ensuring `vercel.json` exists in `client/`:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
6. Click **Deploy**.

---

### Option B: Netlify
1. Log into [Netlify](https://www.netlify.com) → **Add new site** → **Import an existing project**.
2. Set **Base directory** to `client`, **Build command** to `npm run build`, and **Publish directory** to `dist`.
3. Set the environment variables (`VITE_API_URL`, `VITE_SOCKET_URL`).
4. Ensure `client/public/_redirects` contains:
   ```text
   /*    /index.html   200
   ```
5. Click **Deploy Site**.

---

## 4. Verification Checklist

- [ ] Check CORS origin allows the deployed frontend domain.
- [ ] Connect frontend to backend WebSocket and verify seat lock events emit across browsers.
- [ ] Test sample booking with mock payment to verify atomic seat booking in MongoDB Atlas.
- [ ] Verify 5-minute countdown auto-releases unconfirmed holds.
