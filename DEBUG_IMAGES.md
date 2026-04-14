# Debug Images in Production - Quick Guide

## Step 1: Check What URL is Being Generated

Open your production site, go to Admin Foods page, open browser console (F12), and run:

```javascript
// Get the first food item's image
const firstFoodCard = document.querySelector('img[alt]');
console.log('Image SRC:', firstFoodCard?.src);
console.log('Image ALT:', firstFoodCard?.alt);

// Check if image loaded
console.log('Image loaded:', firstFoodCard?.complete);
console.log('Image natural width:', firstFoodCard?.naturalWidth);
```

**Expected Output:**
```
Image SRC: https://your-backend-url.onrender.com/uploads/1234567890-food.jpg
Image loaded: true
Image natural width: 800 (or some number > 0)
```

**If naturalWidth is 0:** Image failed to load

---

## Step 2: Test Backend Uploads Endpoint

Visit this URL in your browser:
```
https://your-backend-url.onrender.com/test-uploads
```

**Expected Response:**
```json
{
  "success": true,
  "uploadsPath": "/opt/render/project/src/uploads",
  "files": [
    "1234567890-food.jpg",
    "9876543210-dish.jpg"
  ],
  "cwd": "/opt/render/project/src",
  "exists": true
}
```

**If files array is empty:** No images uploaded yet
**If exists is false:** Uploads directory doesn't exist

---

## Step 3: Test Direct Image Access

Try accessing an image directly (use a filename from Step 2):
```
https://your-backend-url.onrender.com/uploads/1234567890-food.jpg
```

**Expected:** Image displays in browser

**If 404 Error:** Static file serving not working
**If CORS Error:** CORS headers not set
**If blank:** Image file corrupted

---

## Step 4: Check Environment Variables

### Frontend (Vercel/Netlify/Render):
```bash
# Should be set to your backend URL
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### Backend (Render):
```bash
# Should be set to your frontend URL
CLIENT_URL=https://your-frontend-url.vercel.app
```

---

## Step 5: Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Img"
4. Reload the page
5. Look for failed image requests

**Check:**
- Status code (should be 200)
- Request URL (should point to your backend)
- Response headers (should include CORS headers)

---

## Common Scenarios & Solutions

### Scenario 1: Images Show Placeholder
**Symptom:** All images show "No Image" placeholder

**Cause:** `getImageUrl()` returning empty string or placeholder

**Debug:**
```javascript
// In browser console
const food = { image: '/uploads/test.jpg' };
const apiUrl = import.meta.env.VITE_API_URL;
console.log('API URL:', apiUrl);
console.log('Base URL:', apiUrl?.replace('/api', ''));
```

**Fix:** Set VITE_API_URL in frontend deployment

---

### Scenario 2: Images Show Broken Icon
**Symptom:** Broken image icon (🖼️❌)

**Cause:** Image URL is correct but file doesn't exist or can't be accessed

**Debug:**
1. Copy image URL from browser
2. Paste in new tab
3. Check what error you get

**Possible Fixes:**
- File doesn't exist: Re-upload the food item
- 404 Error: Static file serving not working
- CORS Error: CORS headers not set

---

### Scenario 3: Images Work in Dev, Not in Prod
**Symptom:** localhost works, production doesn't

**Cause:** Environment variable not set in production

**Fix:**
```bash
# In your frontend deployment settings
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**Verify:**
```javascript
// In browser console on production site
console.log(import.meta.env.VITE_API_URL);
// Should output: https://your-backend-url.onrender.com/api
```

---

### Scenario 4: Images Disappear After Restart
**Symptom:** Images work after upload but disappear later

**Cause:** Render's file system is ephemeral (resets on restart)

**Fix:** Use cloud storage (Cloudinary, S3, etc.)

**Temporary Workaround:** Keep your service always running (paid plan)

---

## Quick Fix Script

Add this to your AdminFoods.tsx temporarily for debugging:

```typescript
const getImageUrl = (imagePath: string) => {
  console.log('🖼️ Getting image URL for:', imagePath);
  
  if (!imagePath) {
    console.log('❌ No image path provided');
    return 'https://via.placeholder.com/400x300?text=No+Image';
  }
  
  if (imagePath.startsWith('http')) {
    console.log('✅ Already full URL:', imagePath);
    return imagePath;
  }
  
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiUrl.replace('/api', '');
  const fullUrl = `${baseUrl}/${cleanPath}`;
  
  console.log('📍 API URL:', apiUrl);
  console.log('📍 Base URL:', baseUrl);
  console.log('📍 Clean Path:', cleanPath);
  console.log('📍 Full URL:', fullUrl);
  
  return fullUrl;
};
```

This will log every step of URL construction to help you debug.

---

## What to Share for Help

If you need help debugging, share:

1. **Image URL from browser:**
   ```
   Right-click image → Copy Image Address
   ```

2. **Response from /test-uploads:**
   ```
   Visit: https://your-backend-url.onrender.com/test-uploads
   Copy the JSON response
   ```

3. **Console logs:**
   ```
   Open DevTools → Console tab
   Copy any errors or warnings
   ```

4. **Network tab:**
   ```
   Open DevTools → Network tab → Filter: Img
   Screenshot of failed requests
   ```

5. **Environment variables:**
   ```
   VITE_API_URL value (from frontend deployment)
   CLIENT_URL value (from backend deployment)
   ```

---

## Most Likely Issue

Based on your screenshot, the most likely issue is:

**VITE_API_URL not set in production**

### How to Fix:

1. Go to your frontend deployment (Vercel/Netlify/Render)
2. Find Environment Variables settings
3. Add:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
4. Redeploy frontend
5. Clear browser cache
6. Test again

---

## Test After Fix

1. Upload a new food item
2. Check if image displays immediately
3. Refresh the page
4. Check if image still displays
5. Open in incognito/private window
6. Check if image displays

If all tests pass, the issue is fixed! ✅
