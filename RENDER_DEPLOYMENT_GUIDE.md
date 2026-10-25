# Render Deployment Guide — CALZARE Footwear Backend

This repository includes a production-ready Render Blueprint ([render.yaml](file:///d:/CALZARE/render.yaml)) and optimized configurations for deploying the **CALZARE Footwear Backend API** to [Render](https://render.com).

---

## Option 1: 1-Click Blueprint Deployment (Recommended)

1. **Log in to Render**: Go to [https://dashboard.render.com](https://dashboard.render.com).
2. **Create New Blueprint**:
   - Click the **New +** button in the top right.
   - Select **Blueprint**.
3. **Connect Your GitHub Repository**:
   - Select `TechyDeveloper8/Calzare`.
   - Render will automatically detect [render.yaml](file:///d:/CALZARE/render.yaml).
4. **Enter Required Secrets**:
   - **`MONGO_URI`**: Your MongoDB connection string (e.g. from MongoDB Atlas: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/calzare_production?retryWrites=true&w=majority`).
   - **`RAZORPAY_KEY_ID`**: (Optional / Live) Your Razorpay Key ID (`rzp_live_...` or test key).
   - **`RAZORPAY_KEY_SECRET`**: (Optional / Live) Your Razorpay Secret.
5. **Click "Apply"**:
   - Render will build the backend, install dependencies, run health checks at `/api/health`, and provision your live service URL:
     `https://calzare-backend.onrender.com`

---

## Option 2: Manual Web Service Setup on Render

If you prefer to configure the Web Service manually via the Render UI:

| Setting | Value |
|---|---|
| **Type** | Web Service |
| **Name** | `calzare-backend` |
| **Language** | `Node` |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |
| **Health Check Path** | `/api/health` |

### Environment Variables to Configure in Render Dashboard:

| Key | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `10000` | Render automatically binds this port |
| `CLIENT_URL` | `*` or your frontend URL | E.g. `https://calzare.vercel.app` |
| `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas database URI |
| `JWT_SECRET` | 64+ char random string | Secret for JWT authentication |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `FSHIP_API_KEY` | `68e1a2b5a61128696f34531432751be18eaea96aea6ea1aa093ff8b54c4b0507` | FShip courier API key |
| `FSHIP_BASE_URL` | `https://capi.fship.in` | FShip API URL |
| `FSHIP_PICKUP_PINCODE` | `560038` | Origin warehouse pincode |
| `STORAGE_TYPE` | `local` | Upload asset storage |
| `UPLOAD_DIR` | `uploads` | Upload directory |

---

## How to Seed Production Data on Render

Once your Render backend is deployed, you can seed the initial catalog (products, categories, collections, CMS sections, admin credentials) using one of two methods:

### Method A: Via Render Web Shell
1. Go to your Web Service in the Render dashboard.
2. Click **Shell** in the left menu.
3. Run:
   ```bash
   npm run seed
   node seed/seedMenCollection.js
   node seed/updateHeaderNav.js
   ```

### Method B: From Your Local Machine Pointed to Cloud DB
Run the seed script locally with your remote `MONGO_URI`:
```bash
MONGO_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/calzare_production" node seed/seedData.js
MONGO_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/calzare_production" node seed/seedMenCollection.js
MONGO_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/calzare_production" node seed/updateHeaderNav.js
```

---

## Updating Frontend to Point to Render Backend

Once Render gives you your live backend URL (e.g. `https://calzare-backend.onrender.com`), update your frontend production configuration:

In `frontend/.env.production` (or your Vercel/Netlify environment variables):
```env
VITE_API_BASE_URL=https://calzare-backend.onrender.com/api/v1
```
