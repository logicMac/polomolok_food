# Admin Activity Monitoring and Security Module

## Overview

This document describes the comprehensive Admin Activity Monitoring and Security Module implemented in the Polomolok Food Ordering System. This module provides real-time monitoring, logging, and IP management capabilities to enhance system security and provide administrators with complete visibility into system activities.

## Features

### 1. Activity Logging System

#### Logged Events

The system automatically logs all significant user and system activities:

**Authentication Events:**
- User login attempts (success/failure)
- User logout
- User registration
- OTP generation and verification
- Account lockouts due to failed attempts
- Session creation and expiration

**CRUD Operations:**
- Food item creation, updates, deletions
- Order creation, updates, status changes
- User account modifications
- Rider management operations
- Menu management
- Inventory changes

**Security Events:**
- Failed login attempts with IP tracking
- Suspicious activity detection
- IP address blocking/unblocking
- Unauthorized access attempts
- CSRF token validation failures
- reCAPTCHA verification failures

**Permission Changes:**
- User role modifications
- Permission grants/revocations
- Admin privilege changes

#### Log Metadata

Each log entry contains comprehensive metadata:

```typescript
{
  userId: ObjectId,              // User who performed the action
  username: string,              // Username for quick reference
  email: string,                 // User email
  ipAddress: string,             // Client IP address
  userAgent: string,             // Full user agent string
  device: string,                // Device type (Desktop/Mobile/Tablet)
  browser: string,               // Browser name (Chrome/Firefox/Safari/etc)
  action: string,                // Description of action performed
  actionType: string,            // Category (auth/crud/security/permission)
  resource: string,              // Resource affected (user/food/order/etc)
  resourceId: string,            // ID of affected resource
  status: string,                // success/failure/warning
  method: string,                // HTTP method (GET/POST/PUT/DELETE)
  endpoint: string,              // API endpoint accessed
  statusCode: number,            // HTTP status code
  errorMessage: string,          // Error details if failed
  metadata: object,              // Additional context data
  timestamp: Date                // Exact time of event
}
```

### 2. Admin Dashboard Features

#### Security Overview Tab

Displays real-time statistics and metrics:

- **Total Events**: Count of all logged activities
- **Success Rate**: Percentage of successful operations
- **Failure Count**: Number of failed operations
- **Warning Count**: Security warnings and suspicious activities
- **Activity by Type**: Breakdown by auth/CRUD/security events
- **Most Active Users**: Top users by activity count
- **Most Active IPs**: Top IP addresses by request count
- **Recent Activity**: Live feed of latest system events

#### Activity Logs Tab

Comprehensive log viewing with advanced features:

**Search and Filtering:**
- Full-text search across username, email, IP address, and actions
- Filter by action type (auth/crud/security/permission)
- Filter by status (success/failure/warning)
- Date range filtering (start date to end date)
- Combined filters for precise queries

**Display Features:**
- Paginated table view (50 entries per page)
- Sortable columns
- Color-coded status indicators
- Device and browser information
- Error message display for failed operations
- Timestamp with local timezone

**Export Capabilities:**
- Download logs as CSV/JSON (future enhancement)
- Print-friendly view

#### IP Management Tab

Two sub-views for comprehensive IP management:

**Blocked IPs View:**
- List of all blocked IP addresses
- Reason for blocking
- Blocked by (admin username)
- Block timestamp
- Block type (manual/automatic)
- Expiration time (if temporary)
- Unblock action button

**Access History View:**
- All IP addresses that accessed the system
- Total request count per IP
- Success/failure ratio
- Risk level indicator (low/medium/high)
- Last access timestamp
- First access timestamp
- Associated usernames
- Current block status

### 3. IP Blocking System

#### Manual IP Blocking

Administrators can manually block IP addresses:

**Block IP Form:**
- IP Address (required)
- Reason for blocking (required)
- Duration in hours (optional, permanent if not specified)

**Features:**
- Immediate enforcement (blocks take effect instantly)
- Notification to admin upon successful block
- Activity logging of block action
- Validation to prevent duplicate blocks

#### Automatic IP Blocking

System automatically blocks IPs based on suspicious behavior:

**Auto-Block Triggers:**
- 10 failed login attempts within 15 minutes
- Automatic 24-hour block duration
- System-generated block reason
- Flagged as "auto-blocked" in database
- Admin notification of auto-blocks

**Failed Attempt Tracking:**
- In-memory tracking for performance
- Sliding window of 15 minutes
- Automatic reset after successful login
- Periodic cleanup of old entries

#### IP Unblocking

Administrators can unblock IPs:

- One-click unblock from blocked IPs table
- Confirmation dialog to prevent accidents
- Activity logging of unblock action
- Immediate access restoration

#### Block Enforcement

IP blocks are enforced at multiple levels:

**Backend Enforcement:**
- Middleware checks before all API requests
- Cached blocked IP list for performance
- Database fallback for cache misses
- 403 Forbidden response for blocked IPs

**Frontend Enforcement:**
- API calls rejected for blocked IPs
- User-friendly error messages
- No sensitive information disclosure

### 4. Risk Assessment

The system automatically calculates risk levels for IP addresses:

**Risk Calculation:**
```typescript
- High Risk: >50% failure rate OR >20 failed attempts
- Medium Risk: >30% failure rate OR >10 failed attempts
- Low Risk: All other cases
```

**Risk Indicators:**
- Color-coded badges (red/yellow/green)
- Displayed in Access History view
- Used for admin decision-making
- Suggests IPs for manual review

## Technical Implementation

### Backend Architecture

#### Models

**ActivityLog Model** (`backend/src/models/ActivityLog.ts`):
- MongoDB schema for log storage
- Indexed fields for fast queries
- TTL index for automatic cleanup (90 days)
- Compound indexes for common query patterns

**BlockedIP Model** (`backend/src/models/BlockedIP.ts`):
- Stores blocked IP information
- Tracks manual vs automatic blocks
- Supports temporary and permanent blocks
- References admin who blocked the IP

#### Controllers

**Security Controller** (`backend/src/controllers/securityController.ts`):
- `getActivityLogs`: Fetch logs with filtering and pagination
- `getActivityStats`: Calculate statistics and metrics
- `getBlockedIPs`: Retrieve blocked IP list
- `blockIP`: Manually block an IP address
- `unblockIP`: Remove IP from blocklist
- `getAccessIPs`: Get IP access statistics
- `cleanupLogs`: Admin maintenance function

#### Middleware

**IP Blocker** (`backend/src/middlewares/ipBlocker.ts`):
- `checkBlockedIP`: Validates IP before request processing
- `trackFailedLogin`: Records failed login attempts
- `clearFailedAttempts`: Resets counter on success
- In-memory cache for performance
- Automatic cache refresh every minute

#### Utilities

**Activity Logger** (`backend/src/utils/activityLogger.ts`):
- `logActivity`: Core logging function
- `logAuth`: Authentication event helpers
- `logCRUD`: CRUD operation helpers
- `logSecurity`: Security event helpers
- `logPermission`: Permission change helpers
- `getClientIp`: Extract client IP from request
- `parseUserAgent`: Parse device and browser info

#### Routes

**Security Routes** (`backend/src/routes/securityRoutes.ts`):
```
GET  /api/security/logs          - Get activity logs
GET  /api/security/logs/stats    - Get statistics
DELETE /api/security/logs/cleanup - Cleanup old logs
GET  /api/security/ips/blocked   - Get blocked IPs
GET  /api/security/ips/access    - Get IP access stats
POST /api/security/ips/block     - Block an IP
PUT  /api/security/ips/unblock/:id - Unblock an IP
```

All routes require admin authentication.

### Frontend Architecture

#### Pages

**AdminSecurity** (`client/src/pages/AdminSecurity.tsx`):
- Main security dashboard page
- Tab navigation (Overview/Logs/IPs)
- Responsive layout
- Admin-only access

#### Components

**SecurityStatsTab** (`client/src/components/security/SecurityStatsTab.tsx`):
- Overview statistics display
- Date range filtering
- Activity charts and metrics
- Top users and IPs lists
- Recent activity feed

**ActivityLogsTab** (`client/src/components/security/ActivityLogsTab.tsx`):
- Searchable log table
- Advanced filtering
- Pagination controls
- Status indicators
- Export functionality

**IPManagementTab** (`client/src/components/security/IPManagementTab.tsx`):
- Blocked IPs table
- Access history table
- Block IP modal
- Unblock functionality
- Risk level indicators

### Database Indexes

Optimized indexes for query performance:

```javascript
// ActivityLog indexes
{ userId: 1 }
{ username: 1 }
{ email: 1 }
{ ipAddress: 1 }
{ action: 1 }
{ actionType: 1 }
{ status: 1 }
{ timestamp: -1 }
{ timestamp: -1, actionType: 1 }
{ userId: 1, timestamp: -1 }
{ ipAddress: 1, timestamp: -1 }
{ status: 1, timestamp: -1 }
{ timestamp: 1 } // TTL index (90 days)

// BlockedIP indexes
{ ipAddress: 1 }
{ isActive: 1 }
{ ipAddress: 1, isActive: 1 }
```

## Security Considerations

### Log Security

1. **Immutability**: Logs cannot be modified or deleted by regular users
2. **Admin-Only Access**: Only admins can view logs
3. **Input Sanitization**: All logged data is sanitized
4. **No Sensitive Data**: Passwords and tokens never logged
5. **Secure Storage**: Logs stored in protected database

### IP Blocking Security

1. **Admin Verification**: Only admins can block/unblock IPs
2. **Audit Trail**: All block/unblock actions logged
3. **Whitelist Protection**: System IPs cannot be blocked
4. **Expiration Support**: Temporary blocks auto-expire
5. **Cache Invalidation**: Immediate enforcement of changes

### Performance Optimization

1. **Caching**: Blocked IPs cached in memory
2. **Pagination**: Large result sets paginated
3. **Indexes**: Database indexes for fast queries
4. **TTL**: Automatic cleanup of old logs
5. **Aggregation**: Statistics pre-calculated

## Usage Guide

### For Administrators

#### Viewing Activity Logs

1. Navigate to Admin Dashboard
2. Click "Security & Monitoring" in sidebar
3. Select "Activity Logs" tab
4. Use filters to narrow results:
   - Search by username, email, or IP
   - Filter by action type
   - Filter by status
   - Set date range
5. Click "Refresh" to update data
6. Review logs in table format

#### Blocking an IP Address

1. Go to "IP Management" tab
2. Click "Block IP" button
3. Enter IP address (e.g., 192.168.1.100)
4. Provide reason for blocking
5. Optionally set duration in hours
6. Click "Block IP" to confirm
7. IP is immediately blocked

#### Unblocking an IP Address

1. Go to "IP Management" tab
2. View "Blocked IPs" list
3. Find the IP to unblock
4. Click "Unblock" button
5. Confirm the action
6. IP access is restored

#### Monitoring System Security

1. Check "Overview" tab regularly
2. Review success/failure rates
3. Monitor high-risk IPs
4. Investigate suspicious activities
5. Review auto-blocked IPs
6. Check most active users/IPs

### For Developers

#### Adding Custom Log Events

```typescript
import { logActivity } from '../utils/activityLogger';

// Log a custom event
await logActivity({
  req,
  action: 'Custom action performed',
  actionType: 'system',
  status: 'success',
  resource: 'custom-resource',
  resourceId: 'resource-123',
  metadata: { key: 'value' }
});
```

#### Using Helper Functions

```typescript
import { logAuth, logCRUD, logSecurity } from '../utils/activityLogger';

// Log authentication event
await logAuth.login(req, email, 'success');

// Log CRUD operation
await logCRUD.create(req, 'food', foodId, 'success');

// Log security event
await logSecurity.suspiciousActivity(req, 'Multiple failed attempts', { count: 10 });
```

## Future Enhancements

1. **Real-time Notifications**: Push notifications for critical events
2. **Advanced Analytics**: Machine learning for anomaly detection
3. **Export Functionality**: CSV/PDF export of logs
4. **Geolocation**: IP geolocation mapping
5. **Rate Limit Customization**: Per-user rate limits
6. **Webhook Integration**: External system notifications
7. **Compliance Reports**: Automated compliance reporting
8. **Log Retention Policies**: Configurable retention periods
9. **Multi-factor Authentication Logs**: MFA event tracking
10. **API Key Management**: API key usage logging

## Maintenance

### Log Cleanup

Automatic cleanup via TTL index (90 days), or manual cleanup:

```bash
# Via API (admin only)
DELETE /api/security/logs/cleanup
Body: { "daysOld": 90 }
```

### Cache Management

Blocked IP cache automatically refreshes every minute. Manual refresh:

```typescript
// Restart server to clear cache
npm run dev
```

### Database Maintenance

```bash
# Rebuild indexes
db.activitylogs.reIndex()
db.blockedips.reIndex()

# Check index usage
db.activitylogs.aggregate([{ $indexStats: {} }])
```

## Troubleshooting

### Logs Not Appearing

1. Check database connection
2. Verify ActivityLog model is imported
3. Check for errors in server logs
4. Ensure logging functions are called

### IP Block Not Working

1. Verify IP is in blocked list
2. Check cache refresh timing
3. Restart server to clear cache
4. Verify middleware is loaded

### Performance Issues

1. Check database indexes
2. Reduce log retention period
3. Increase pagination limit
4. Optimize query filters
5. Consider log archiving

## Conclusion

The Admin Activity Monitoring and Security Module provides comprehensive visibility and control over system security. With real-time logging, IP management, and risk assessment, administrators can proactively monitor and protect the system from threats while maintaining detailed audit trails for compliance and investigation purposes.
