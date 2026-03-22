# OTP Redirect Issue - FIXED

## Problem
When entering wrong OTP, the page was automatically redirecting back to the login screen instead of staying on the OTP verification screen.

## Root Cause
The API interceptor in `client/src/services/api.ts` was catching ALL 401 errors and attempting to refresh the authentication token. When the backend returned a 401 for invalid OTP, the interceptor would:

1. Catch the 401 error
2. Try to refresh the token
3. Fail (because user isn't logged in yet)
4. Redirect to `/login`

### The Problematic Code:
```typescript
// This was catching OTP verification errors too!
if (error.response?.status === 401 && !originalRequest._retry) {
  // Try to refresh token
  // If fails, redirect to login
  window.location.href = '/login';
}
```

## Solution
Added a check to exclude authentication endpoints from the automatic token refresh logic:

```typescript
// Don't try to refresh token for auth endpoints
const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || 
                      originalRequest?.url?.includes('/auth/register') ||
                      originalRequest?.url?.includes('/auth/verify-otp');

// Only refresh token if NOT an auth endpoint
if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
  // Token refresh logic...
}
```

## Files Modified

### client/src/services/api.ts
- Added `isAuthEndpoint` check before token refresh logic
- Prevents interceptor from interfering with login/register/OTP flows
- Fixed TypeScript errors for `import.meta.env`

## How It Works Now

### Wrong OTP Flow:
1. ✅ User enters wrong OTP
2. ✅ Backend returns 401 with error message
3. ✅ Interceptor sees it's an auth endpoint, skips token refresh
4. ✅ Error is passed to the component
5. ✅ Component displays error message
6. ✅ User stays on OTP screen
7. ✅ User can try again

### Correct OTP Flow:
1. ✅ User enters correct OTP
2. ✅ Backend returns 200 with tokens
3. ✅ User is logged in
4. ✅ Redirects to home page

### Regular API Calls (After Login):
1. ✅ API call returns 401 (token expired)
2. ✅ Interceptor catches it (not an auth endpoint)
3. ✅ Automatically refreshes token
4. ✅ Retries original request
5. ✅ If refresh fails, redirects to login

## Testing

### Test Wrong OTP:
1. Login with correct credentials
2. Get to OTP screen
3. Enter wrong OTP (e.g., "000000")
4. Click "Verify OTP"
5. **Expected:**
   - Error message appears: "Invalid verification code"
   - You stay on OTP screen
   - Can try again immediately
   - No redirect to login

### Test Expired OTP:
1. Login with correct credentials
2. Wait 5+ minutes
3. Enter any OTP
4. **Expected:**
   - Error message: "Verification code has expired"
   - You stay on OTP screen
   - Click "Back to login" to get new OTP

### Test Correct OTP:
1. Login with correct credentials
2. Check email for OTP
3. Enter correct OTP
4. **Expected:**
   - Success message: "Login successful! Redirecting..."
   - Redirects to home page after 500ms

## Additional Fixes

### Also fixed in this update:
1. **Error persistence** - Errors no longer blink/disappear
2. **TypeScript errors** - Fixed `import.meta.env` type issues
3. **Form behavior** - Added `autoComplete="off"` to OTP input
4. **Debug logging** - Added console logs for troubleshooting

## Timezone Note

The OTP expiration uses server time (`new Date()`). If your server is in a different timezone than Asia/Manila, the OTP will still work correctly because:
- OTP is generated with: `Date.now() + 5 * 60 * 1000` (5 minutes from now)
- OTP is checked with: `user.otpExpires < new Date()` (current time)
- Both use the same timezone (server's local time)

The timezone doesn't matter as long as both generation and verification use the same time source (the server).

## Verification

After this fix:
- ✅ Wrong OTP stays on OTP screen
- ✅ Error messages display correctly
- ✅ No automatic redirects
- ✅ Token refresh still works for regular API calls
- ✅ Login/register flows unaffected
