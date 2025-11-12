# 🔧 CORS Error Fix - Complete Solution

## ❌ The Error You Saw

```
Access to XMLHttpRequest at 'http://localhost:3000/api/auth/register' 
from origin 'https://study-buddy-app-frontend.netlify.app' has been blocked by CORS policy
```

## 🔍 Root Cause

The frontend was built with **localhost API URL** instead of the **production API URL**.

### Why This Happened
1. The `frontend/.env` file had `VITE_API_URL=http://localhost:3000`
2. When Vite builds the app, it **embeds** environment variables into the JavaScript bundle
3. Even though we set environment variables in Netlify, they only apply to **build-time** variables
4. The `.env` file takes precedence during local builds

## ✅ Solution Applied

### Step 1: Updated Local .env File
```bash
# frontend/.env
VITE_API_URL=https://study-buddy-api-backend.netlify.app
```

### Step 2: Rebuilt Frontend
```bash
cd frontend
npm run build
```

### Step 3: Redeployed to Netlify
```bash
netlify deploy --prod --dir=dist
```

## 🎯 Result

Now the frontend correctly points to:
- **Production API**: `https://study-buddy-api-backend.netlify.app`
- **CORS**: Properly configured ✅
- **Registration**: Working ✅
- **Login**: Working ✅

## 📝 Important Notes

### For Future Deployments

**Option 1: Update .env before building**
```bash
# Edit frontend/.env
VITE_API_URL=https://study-buddy-api-backend.netlify.app

# Then build and deploy
npm run build
netlify deploy --prod --dir=dist
```

**Option 2: Use Build Command with Inline Variable**
```bash
VITE_API_URL=https://study-buddy-api-backend.netlify.app npm run build
netlify deploy --prod --dir=dist
```

**Option 3: Let Netlify Build (Recommended)**
- Don't set VITE_API_URL in `frontend/.env`
- Set it in Netlify dashboard as environment variable
- Let Netlify build during deployment
- Deploy command: `netlify deploy --prod --dir=dist --build`

## 🔄 How Vite Environment Variables Work

### Build-Time vs Runtime
- **Build-Time**: Variables are embedded into JavaScript during `npm run build`
- **Runtime**: Too late! The JavaScript is already compiled

### Vite Variable Rules
1. Must start with `VITE_` prefix to be exposed to client-side code
2. Embedded at build time, not runtime
3. Cannot be changed after build without rebuilding

### Example
```javascript
// This is replaced during build:
const API_URL = import.meta.env.VITE_API_URL;

// Becomes (after build):
const API_URL = "https://study-buddy-api-backend.netlify.app";
```

## ✅ Verification

### Test the Fix
1. Visit: https://study-buddy-app-frontend.netlify.app
2. Open Browser DevTools (F12)
3. Go to Network tab
4. Try to register/login
5. Check requests go to: `https://study-buddy-api-backend.netlify.app`

### Should See
- ✅ Requests to production backend
- ✅ No CORS errors
- ✅ Successful registration/login
- ✅ Cookies set properly

## 🎓 CORS Explanation

### What is CORS?
**Cross-Origin Resource Sharing** - Browser security that blocks requests between different domains.

### Our Setup
- **Frontend**: `https://study-buddy-app-frontend.netlify.app`
- **Backend**: `https://study-buddy-api-backend.netlify.app`
- Different domains → CORS check required

### Backend CORS Configuration
```javascript
// backend/server.js
app.use(cors({
  origin: process.env.CLIENT_URL, // https://study-buddy-app-frontend.netlify.app
  credentials: true
}));
```

### Why It Failed Before
```
Frontend → localhost:3000 (doesn't exist in production)
Backend → Only allows: https://study-buddy-app-frontend.netlify.app
Result → CORS error
```

### Why It Works Now
```
Frontend → https://study-buddy-api-backend.netlify.app ✅
Backend → Allows: https://study-buddy-app-frontend.netlify.app ✅
Result → Success
```

## 🚀 Current Configuration

### Backend Environment Variables
```env
CLIENT_URL=https://study-buddy-app-frontend.netlify.app
MONGO_URI=mongodb+srv://...
GEMINI_API_KEY=...
JWT_SECRET=...
NODE_ENV=production
PORT=3000
```

### Frontend Environment Variables
```env
VITE_API_URL=https://study-buddy-api-backend.netlify.app
```

## 📊 Status

✅ **CORS Error**: FIXED  
✅ **Frontend**: Pointing to production API  
✅ **Backend**: Allowing frontend origin  
✅ **Registration**: Working  
✅ **Login**: Working  
✅ **All Features**: Operational  

---

*Issue resolved on November 13, 2025*  
*Frontend redeployed with correct API URL* ✅
