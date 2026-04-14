# How to Access the Security & Monitoring Module

## Quick Access Guide

### For Admin Users:

1. **Login as Admin**
   - Go to your application URL (e.g., `http://localhost:5173`)
   - Login with your admin credentials

2. **Navigate to Admin Dashboard**
   - After login, you'll be redirected to the admin dashboard
   - Or click on "Dashboard" in the navigation bar

3. **Access Security Module**
   - On the Admin Dashboard, you'll see a new card labeled **"Security & Monitoring"**
   - Click on this card to access the security features
   - Or directly navigate to: `http://localhost:5173/admin/security`

### What You'll See:

The Security & Monitoring page has **3 tabs**:

#### 1. Overview Tab (Default)
- Total events count
- Success/failure statistics
- Activity breakdown by type (Auth, CRUD, Security)
- Most active users
- Most active IP addresses
- Recent activity feed

#### 2. Activity Logs Tab
- Searchable table of all system activities
- Filter by:
  - Username, email, or IP address
  - Action type (Authentication, CRUD, Security, Permissions)
  - Status (Success, Failure, Warning)
  - Date range
- Pagination for large datasets
- Shows detailed information:
  - Timestamp
  - User information
  - IP address
  - Action performed
  - Device and browser
  - Status

#### 3. IP Management Tab
- **Blocked IPs View:**
  - List of all blocked IP addresses
  - Reason for blocking
  - Who blocked it
  - When it was blocked
  - Type (Manual or Auto-blocked)
  - Unblock button

- **Access History View:**
  - All IP addresses that accessed the system
  - Request counts
  - Success/failure ratios
  - Risk level indicators (Low/Medium/High)
  - Last access time
  - Current status

- **Block IP Button:**
  - Manually block any IP address
  - Provide reason for blocking
  - Set duration (optional, permanent if not specified)

## Direct URLs:

- **Admin Dashboard**: `http://localhost:5173/admin`
- **Security Module**: `http://localhost:5173/admin/security`
- **Security Overview**: `http://localhost:5173/admin/security` (default tab)
- **Activity Logs**: `http://localhost:5173/admin/security` (click "Activity Logs" tab)
- **IP Management**: `http://localhost:5173/admin/security` (click "IP Management" tab)

## Visual Guide:

```
Home Page
    ↓
Login (as Admin)
    ↓
Admin Dashboard
    ↓
[Security & Monitoring Card] ← Click here
    ↓
Security & Monitoring Page
    ├── Overview Tab (Statistics)
    ├── Activity Logs Tab (Search & Filter logs)
    └── IP Management Tab (Block/Unblock IPs)
```

## Features You Can Use:

### 1. Monitor System Activity
- View all user actions in real-time
- Track login attempts
- Monitor CRUD operations
- Identify security threats

### 2. Search and Filter Logs
- Search by username, email, or IP
- Filter by action type
- Filter by success/failure status
- Set custom date ranges

### 3. Manage IP Addresses
- View all IPs accessing your system
- Block suspicious IP addresses
- Unblock previously blocked IPs
- See risk levels for each IP

### 4. Security Insights
- Success rate metrics
- Most active users
- Most active IP addresses
- Recent security events

## Requirements:

- You must be logged in as an **Admin** user
- Regular customers and riders cannot access this feature
- Backend server must be running
- Database must be connected

## Troubleshooting:

### Can't see the Security card on Admin Dashboard?
- Make sure you're logged in as an admin
- Clear browser cache and refresh
- Check browser console for errors

### Getting "Access Denied" error?
- Verify you have admin role
- Check if your session is still valid
- Try logging out and logging back in

### No logs appearing?
- Logs are created as users interact with the system
- Try performing some actions (login, create food, etc.)
- Check if backend is running
- Verify database connection

### IP blocking not working?
- Restart the backend server
- Check if the IP is in the blocked list
- Verify the middleware is loaded

## Next Steps:

1. **Explore the Overview Tab** to get familiar with the statistics
2. **Check Activity Logs** to see what's been happening
3. **Review IP Access History** to identify any suspicious activity
4. **Test IP Blocking** by blocking a test IP address
5. **Monitor regularly** to keep your system secure

## Support:

For detailed documentation, see:
- `ADMIN_SECURITY_MONITORING_MODULE.md` - Complete feature documentation
- `SECURITY_MODULE_SETUP.md` - Setup and integration guide

---

**Note**: This feature is only accessible to admin users. Make sure you have proper admin credentials before attempting to access it.
