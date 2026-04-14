# Rate Limiting Guide

## Issue: "Too many requests" Error

If you're seeing the error **"Too many requests from this IP, please try again later"** or **"Too many authentication attempts"**, it means you've hit the rate limit.

## What is Rate Limiting?

Rate limiting is a security feature that prevents abuse by limiting how many requests can be made from a single IP address within a time window. This protects against:
- Brute force attacks
- DDoS attacks
- API abuse
- Spam

## Current Rate Limits (Updated for Development)

### 1. General API Limiter
- **Window**: 15 minutes
- **Max Requests**: 500 requests per IP
- **Applies to**: All `/api/*` routes

### 2. Authentication Limiter
- **Window**: 15 minutes
- **Max Requests**: 50 requests per IP
- **Applies to**: 
  - `/api/auth/register`
  - `/api/auth/login`

### 3. OTP Verification Limiter
- **Window**: 5 minutes
- **Max Requests**: 20 attempts per IP
- **Applies to**: `/api/auth/verify-otp`

### 4. Order Creation Limiter
- **Window**: 10 minutes
- **Max Requests**: 50 orders per IP
- **Applies to**: Order creation endpoints

### 5. Food Management Limiter
- **Window**: 5 minutes
- **Max Requests**: 100 operations per IP
- **Applies to**: Admin food CRUD operations

### 6. File Upload Limiter
- **Window**: 10 minutes
- **Max Requests**: 50 uploads per IP
- **Applies to**: File upload endpoints

## How to Fix "Too Many Requests" Error

### Option 1: Wait for the Window to Reset
The easiest solution is to wait for the time window to expire:
- For auth errors: Wait 15 minutes
- For OTP errors: Wait 5 minutes
- For general API errors: Wait 15 minutes

### Option 2: Restart the Backend Server
Restarting the server clears the rate limit counters:

```bash
# Stop the server (Ctrl+C)
# Then restart
cd backend
npm run dev
```

### Option 3: Adjust Rate Limits (Development Only)

Edit `backend/src/middlewares/rateLimiter.ts`:

```typescript
// For even more lenient limits during development
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Increase this number
  // ... rest of config
});
```

### Option 4: Disable Rate Limiting (Not Recommended)

For local development only, you can temporarily disable rate limiting:

**In `backend/src/routes/authRoutes.ts`:**

```typescript
// Comment out the rate limiters
// router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/register', validate(registerSchema), register);

// router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/login', validate(loginSchema), login);
```

**⚠️ Warning**: Never disable rate limiting in production!

## Recommended Settings

### Development Environment
```typescript
apiLimiter: max: 500-1000
authLimiter: max: 50-100
otpLimiter: max: 20-50
```

### Production Environment
```typescript
apiLimiter: max: 100-200
authLimiter: max: 10-20
otpLimiter: max: 5-10
```

## How Rate Limiting Works

1. **Request Received**: Server receives a request from an IP
2. **Counter Check**: Checks how many requests from that IP in the time window
3. **Under Limit**: If under limit, request proceeds
4. **Over Limit**: If over limit, returns 429 error
5. **Window Reset**: Counter resets after the time window expires

## Checking Your Rate Limit Status

Rate limit information is sent in response headers:

```
RateLimit-Limit: 50
RateLimit-Remaining: 45
RateLimit-Reset: 1234567890
```

You can see these in:
- Browser DevTools → Network tab → Response Headers
- Postman → Response Headers

## IP Address Detection

The system detects your IP from:
1. `x-forwarded-for` header (if behind proxy)
2. `x-real-ip` header
3. `req.socket.remoteAddress`

In development, your IP is usually `::1` or `127.0.0.1` (localhost).

## Common Scenarios

### Scenario 1: Testing Login Multiple Times
**Problem**: Hit auth limit while testing
**Solution**: 
- Wait 15 minutes, OR
- Restart server, OR
- Increase `authLimiter.max` to 100

### Scenario 2: Developing with Hot Reload
**Problem**: Each code change triggers requests
**Solution**: 
- Increase `apiLimiter.max` to 1000
- Use longer time windows

### Scenario 3: Multiple Developers on Same Network
**Problem**: Shared IP hits limits faster
**Solution**:
- Use different ports
- Increase limits significantly
- Use VPN for separate IPs

### Scenario 4: Automated Testing
**Problem**: Test suite hits limits
**Solution**:
- Disable rate limiting for test environment
- Use separate test database
- Mock rate limiter in tests

## Environment-Based Configuration

You can make rate limits environment-dependent:

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 100 : 10, // Higher in dev
  // ... rest
});
```

## Monitoring Rate Limits

### Check Current Limits
Look at `backend/src/middlewares/rateLimiter.ts`

### View Rate Limit Hits
Check server logs for 429 errors:
```bash
# In backend directory
cat logs/combined.log | grep "429"
```

### Activity Logs
Rate limit violations are logged in the Security & Monitoring dashboard:
1. Go to `/admin/security`
2. Click "Activity Logs"
3. Filter by status: "failure"
4. Look for "Too many requests" messages

## Best Practices

### For Development
1. ✅ Use higher limits (50-100 for auth)
2. ✅ Restart server when hit limit
3. ✅ Monitor logs for rate limit errors
4. ❌ Don't disable completely (test security features)

### For Production
1. ✅ Use strict limits (10-20 for auth)
2. ✅ Monitor rate limit hits
3. ✅ Adjust based on legitimate traffic patterns
4. ✅ Log all rate limit violations
5. ❌ Don't make limits too high (defeats purpose)

## Troubleshooting

### Error: "Too many requests from this IP"
- **Cause**: Hit general API limit (500 requests/15min)
- **Fix**: Wait 15 minutes or restart server

### Error: "Too many authentication attempts"
- **Cause**: Hit auth limit (50 requests/15min)
- **Fix**: Wait 15 minutes or increase limit

### Error: "Too many OTP verification attempts"
- **Cause**: Hit OTP limit (20 attempts/5min)
- **Fix**: Wait 5 minutes or increase limit

### Rate Limit Not Working
- **Check**: Is rate limiter imported in routes?
- **Check**: Is middleware applied before route handler?
- **Check**: Are you testing from different IPs?

## Security Considerations

### Why Rate Limiting is Important
1. **Prevents Brute Force**: Attackers can't try unlimited passwords
2. **Stops DDoS**: Limits impact of denial-of-service attacks
3. **Reduces Abuse**: Prevents API abuse and scraping
4. **Protects Resources**: Prevents server overload

### What Rate Limiting Doesn't Prevent
1. **Distributed Attacks**: Attacks from many IPs
2. **Slow Attacks**: Attacks under the rate limit
3. **Application Logic Flaws**: Business logic vulnerabilities
4. **Social Engineering**: Human-targeted attacks

### Additional Security Layers
Rate limiting works best with:
- Account lockout (after failed logins)
- IP blocking (for persistent attackers)
- CAPTCHA (for bot prevention)
- WAF (Web Application Firewall)
- Monitoring and alerts

## Summary

The rate limits have been increased for development:
- **API**: 100 → 500 requests/15min
- **Auth**: 10 → 50 requests/15min
- **OTP**: 5 → 20 attempts/5min
- **Orders**: 10 → 50 orders/10min
- **Food Mgmt**: 20 → 100 ops/5min
- **Uploads**: 15 → 50 uploads/10min

These limits are more suitable for development while still providing security. For production, consider reducing them based on your actual traffic patterns.

---

**If you continue to hit rate limits, restart your backend server or increase the limits further in `rateLimiter.ts`** 🚀
