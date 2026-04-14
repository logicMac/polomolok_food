# Security Module Setup Guide

## Quick Start

This guide will help you set up and integrate the Admin Activity Monitoring and Security Module into your system.

## Installation Steps

### 1. Backend Setup

#### Install Dependencies (if not already installed)

```bash
cd backend
npm install
```

All required dependencies are already in package.json.

#### Create Database Indexes

The indexes will be created automatically when the models are first used, but you can manually create them:

```javascript
// Run in MongoDB shell or Compass
use your_database_name;

// ActivityLog indexes
db.activitylogs.createIndex({ userId: 1 });
db.activitylogs.createIndex({ ipAddress: 1 });
db.activitylogs.createIndex({ timestamp: -1 });
db.activitylogs.createIndex({ actionType: 1 });
db.activitylogs.createIndex({ status: 1 });

// BlockedIP indexes
db.blockedips.createIndex({ ipAddress: 1, isActive: 1 });
```

#### Verify Files Created

Ensure these files exist:

**Backend:**
- `backend/src/models/ActivityLog.ts`
- `backend/src/models/BlockedIP.ts`
- `backend/src/controllers/securityController.ts`
- `backend/src/middlewares/ipBlocker.ts`
- `backend/src/routes/securityRoutes.ts`
- `backend/src/utils/activityLogger.ts`

**Frontend:**
- `client/src/pages/AdminSecurity.tsx`
- `client/src/components/security/ActivityLogsTab.tsx`
- `client/src/components/security/IPManagementTab.tsx`
- `client/src/components/security/SecurityStatsTab.tsx`

### 2. Frontend Setup

#### Add Route to App Router

Update your main router file (e.g., `client/src/App.tsx` or routing configuration):

```typescript
import AdminSecurity from './pages/AdminSecurity';

// Add this route in your admin routes section
<Route path="/admin/security" element={<AdminSecurity />} />
```

#### Add Navigation Link

Update your admin navigation (e.g., `client/src/components/Navbar.tsx` or admin sidebar):

```typescript
import { Shield } from 'lucide-react';

// Add this link in admin navigation
<Link to="/admin/security" className="nav-link">
  <Shield className="w-5 h-5" />
  Security & Monitoring
</Link>
```

### 3. Test the Installation

#### Start the Backend

```bash
cd backend
npm run dev
```

#### Start the Frontend

```bash
cd client
npm run dev
```

#### Verify Endpoints

Test the API endpoints:

```bash
# Get CSRF token first
curl http://localhost:5000/api/csrf-token

# Test activity logs (requires admin auth)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:5000/api/security/logs

# Test blocked IPs
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:5000/api/security/ips/blocked
```

### 4. Access the Dashboard

1. Login as an admin user
2. Navigate to `/admin/security`
3. You should see three tabs:
   - Overview (statistics)
   - Activity Logs (log viewer)
   - IP Management (IP blocking)

## Configuration

### Adjust Auto-Block Settings

Edit `backend/src/middlewares/ipBlocker.ts`:

```typescript
// Change these constants
const MAX_FAILED_ATTEMPTS = 10;  // Default: 10 attempts
const ATTEMPT_WINDOW = 15 * 60 * 1000;  // Default: 15 minutes
```

### Adjust Log Retention

Edit `backend/src/models/ActivityLog.ts`:

```typescript
// Change TTL index expiration (in seconds)
activityLogSchema.index(
  { timestamp: 1 }, 
  { expireAfterSeconds: 7776000 }  // Default: 90 days
);
```

### Adjust Cache Refresh Rate

Edit `backend/src/middlewares/ipBlocker.ts`:

```typescript
// Change cache refresh interval
setInterval(async () => {
  // Refresh blocked IP cache
}, 60000);  // Default: 1 minute
```

## Integration with Existing Code

### Add Logging to Controllers

Update your existing controllers to include activity logging:

```typescript
import { logCRUD } from '../utils/activityLogger';

// Example: Food controller
export const createFood = async (req: AuthRequest, res: Response) => {
  try {
    const food = await Food.create(req.body);
    
    // Add this line
    await logCRUD.create(req, 'food', food._id.toString(), 'success');
    
    res.status(201).json({ success: true, data: food });
  } catch (error) {
    // Add this line
    await logCRUD.create(req, 'food', '', 'failure', error.message);
    
    res.status(500).json({ success: false, message: 'Failed to create food' });
  }
};
```

### Add Logging to Other Operations

```typescript
// Update operations
await logCRUD.update(req, 'order', orderId, 'success');

// Delete operations
await logCRUD.delete(req, 'user', userId, 'success');

// Read operations (optional, can be verbose)
await logCRUD.read(req, 'food', foodId);

// Security events
await logSecurity.suspiciousActivity(req, 'Unusual pattern detected', { details });

// Permission changes
await logPermission.roleChanged(req, userId, 'customer', 'admin');
```

## Verification Checklist

- [ ] Backend server starts without errors
- [ ] Frontend compiles successfully
- [ ] Can access `/admin/security` page
- [ ] Activity logs are being recorded
- [ ] Can view logs in the dashboard
- [ ] Can filter and search logs
- [ ] Can block an IP address
- [ ] Can unblock an IP address
- [ ] Blocked IPs cannot access the system
- [ ] Auto-blocking works after failed attempts
- [ ] Statistics display correctly

## Common Issues

### Issue: Logs not appearing

**Solution:**
- Check if ActivityLog model is imported in server.ts
- Verify database connection
- Check for errors in server console
- Ensure logging functions are being called

### Issue: IP blocking not working

**Solution:**
- Verify `checkBlockedIP` middleware is loaded in server.ts
- Check if middleware is before route handlers
- Restart server to clear cache
- Check BlockedIP collection in database

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Rebuild TypeScript
cd backend
npm run build

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Frontend components not rendering

**Solution:**
- Check browser console for errors
- Verify API endpoints are accessible
- Check authentication token is valid
- Ensure user has admin role

## Performance Optimization

### For High-Traffic Systems

1. **Increase Cache TTL:**
```typescript
// In ipBlocker.ts
const CACHE_TTL = 300000; // 5 minutes instead of 1
```

2. **Reduce Log Verbosity:**
```typescript
// Only log important events
if (actionType === 'security' || status === 'failure') {
  await logActivity(...);
}
```

3. **Add Database Sharding:**
```javascript
// For very large log collections
db.activitylogs.createIndex({ timestamp: 1 }, { background: true });
```

4. **Use Log Aggregation:**
```typescript
// Aggregate logs before displaying
const aggregatedLogs = await ActivityLog.aggregate([
  { $match: filter },
  { $group: { _id: '$action', count: { $sum: 1 } } }
]);
```

## Security Best Practices

1. **Protect Admin Routes:**
   - Always verify admin role
   - Use HTTPS in production
   - Implement rate limiting

2. **Sanitize Log Data:**
   - Never log passwords or tokens
   - Sanitize user inputs
   - Limit log entry size

3. **Regular Maintenance:**
   - Clean up old logs periodically
   - Monitor disk space
   - Review blocked IPs regularly

4. **Backup Logs:**
   - Export important logs
   - Store backups securely
   - Implement log rotation

## Next Steps

1. **Customize the UI:**
   - Match your brand colors
   - Add custom charts
   - Implement dark mode

2. **Add Notifications:**
   - Email alerts for critical events
   - Slack/Discord webhooks
   - SMS notifications

3. **Enhance Analytics:**
   - Add more statistics
   - Create custom reports
   - Implement data visualization

4. **Integrate with External Tools:**
   - SIEM systems
   - Log aggregation services
   - Monitoring platforms

## Support

For issues or questions:
1. Check the main documentation: `ADMIN_SECURITY_MONITORING_MODULE.md`
2. Review error logs in `backend/logs/`
3. Check MongoDB logs for database issues
4. Verify all dependencies are installed

## Conclusion

Your Admin Activity Monitoring and Security Module is now set up! You can monitor all system activities, manage IP addresses, and enhance your application's security posture.
