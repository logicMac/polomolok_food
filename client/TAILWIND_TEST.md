# Tailwind CSS Troubleshooting

## If the UI looks messy or unstyled:

### 1. Clear Cache and Restart Dev Server

```bash
# Stop the dev server (Ctrl+C)

# Clear Vite cache
rm -rf node_modules/.vite

# Or on Windows PowerShell:
Remove-Item -Recurse -Force node_modules/.vite

# Restart dev server
npm run dev
```

### 2. Hard Refresh Browser

- **Chrome/Edge**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Firefox**: `Ctrl + Shift + R`
- **Safari**: `Cmd + Shift + R`

### 3. Check Browser Console

Open Developer Tools (F12) and check for:
- CSS loading errors
- 404 errors for stylesheets
- JavaScript errors

### 4. Verify Tailwind is Working

The pages should have:
- Black and white color scheme
- Proper spacing and padding
- Rounded corners on buttons
- Border styling
- Responsive grid layouts

### 5. Test Build

```bash
npm run build
npm run preview
```

This will build and preview the production version.

### 6. Check Network Tab

In browser DevTools > Network tab:
- Look for `index-*.css` file
- It should be ~21KB
- Check if it's loading successfully

## Common Issues

### Issue: Styles not applying

**Solution**: Make sure `index.css` is imported in `main.jsx`:
```javascript
import './index.css'
```

### Issue: Tailwind classes not working

**Solution**: Restart dev server after changing Tailwind config

### Issue: Build works but dev doesn't

**Solution**: Clear `.vite` cache folder

## Verify Tailwind Installation

```bash
npm list tailwindcss
npm list @tailwindcss/vite
```

Both should show version 4.2.1 or higher.

## Manual Test

Create a test file to verify Tailwind:

**client/src/pages/TailwindTest.tsx**:
```tsx
const TailwindTest = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-4">Tailwind Test</h1>
        <div className="bg-white border-2 border-black rounded-lg p-6 mb-4">
          <p className="text-gray-600">If you can see this styled correctly, Tailwind is working!</p>
        </div>
        <button className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800">
          Test Button
        </button>
      </div>
    </div>
  );
};

export default TailwindTest;
```

Add route in `App.jsx`:
```jsx
import TailwindTest from './pages/TailwindTest';

// In routes:
<Route path="/test" element={<TailwindTest />} />
```

Visit: `http://localhost:5173/test`

## Expected Appearance

### Home Page:
- Black header with white text
- White background for content area
- Black bordered search input
- Category buttons with black borders
- Food cards with black borders and rounded corners

### Login Page:
- Centered form with black border
- Input fields with black borders
- Black button with white text
- Icons visible next to inputs

### Admin Dashboard:
- Statistics cards with black borders
- Grid layout
- Proper spacing

## If Still Not Working

1. Check `vite.config.js` has:
```javascript
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

2. Check `index.css` starts with:
```css
@import "tailwindcss";
```

3. Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Screenshot Comparison

### What it SHOULD look like:
- Clean black and white design
- Proper spacing and alignment
- Visible borders on cards
- Rounded corners
- Hover effects on buttons

### What it SHOULD NOT look like:
- Plain HTML with no styling
- Times New Roman font
- No spacing
- No colors
- Broken layout

## Get Help

If issues persist:
1. Check browser console for errors
2. Verify all files are saved
3. Check if `dist/assets/index-*.css` exists after build
4. Try incognito/private browsing mode
