# SOUTH EAST ASIAN INSTITUTE OF TECHNOLOGY

## COLLEGE OF INFORMATION AND COMMUNICATION TECHNOLOGY
National Highway, Crossing Rubber, Tupi, 9505  
South Cotabato, Philippines

---

# Information Security Features Documentation

**Polomolok Food Ordering System**

---

**Prepared by:**

{Full Name 1}  
{Full Name 2}  
{Full Name 3}

---

## Introduction

The Polomolok Food Ordering System is a full-stack web application designed to facilitate online food ordering and delivery services for the Polomolok area. It is used by three types of users: customers who order food, delivery riders who fulfill orders, and administrators who manage the entire system. The system handles sensitive data such as personal information (names, emails, addresses), authentication credentials, payment transactions, and real-time location data. To protect this data, multiple layers of security features are implemented to prevent unauthorized access, data breaches, injection attacks, and data loss.

---

## System Users & Access Control

### Admin
- **Full system access** with complete control over all features
- Can manage food items (create, read, update, delete)
- Can manage all orders and update order statuses
- Can view and manage all users (customers and riders)
- Access to system analytics and statistics dashboard
- Can view system logs and monitor activities
- Cannot be created through registration (must be manually created in database)

### Rider (Delivery Personnel)
- Can view assigned delivery orders
- Can update their availability status
- Can update their current location for order tracking
- Can view order details and customer delivery addresses
- Can update order delivery status
- Cannot access admin features or other riders' information
- Cannot modify food items or view system analytics

### Customer (Regular Users)
- Can browse food menu and view food details
- Can add items to cart and place orders
- Can view their own order history
- Can update their profile information
- Can cancel their own pending orders
- Cannot access admin panel or rider features
- Cannot view other customers' information or orders

### Access Control Implementation

The system implements **Role-Based Access Control (RBAC)** using JWT (JSON Web Token) authentication:

1. **Authentication Middleware**: Verifies JWT tokens on every protected route
2. **Authorization Middleware**: Checks user role before granting access to specific resources
3. **Token-based Sessions**: Uses access tokens (15-minute expiry) and refresh tokens (7-day expiry)
4. **Route Protection**: All sensitive endpoints require valid authentication and appropriate role
5. **Cookie-based Storage**: Tokens stored in httpOnly cookies to prevent XSS attacks

---

## Implemented Security Features

### 1. Password Security

- **Bcrypt Hashing**: All passwords are hashed using bcrypt with 12 salt rounds before storage
- **No Plain Text Storage**: Passwords are never stored in plain text in the database
- **Minimum Length**: Passwords must be at least 8 characters long
- **Password Field Protection**: Password field is excluded from query results by default (select: false)
- **Validation**: Email format validation and password strength requirements enforced

### 2. Two-Factor Authentication (OTP Verification)

- **Email-based OTP**: 6-digit one-time password sent via email (Brevo API)
- **Time-limited**: OTP expires after 5 minutes
- **Single-use**: OTP is deleted from database after successful verification
- **Rate Limited**: Maximum 5 OTP verification attempts per 5 minutes per IP address

### 3. Account Lockout Protection

- **Login Attempt Tracking**: System tracks failed login attempts per user account
- **Automatic Lockout**: Account locked for 5 minutes after 5 failed login attempts
- **Attempt Counter**: Users are informed of remaining attempts before lockout
- **Auto-reset**: Login attempts reset to zero after successful authentication

### 4. Input Validation & Sanitization

- **Joi Schema Validation**: All API inputs validated using Joi schemas
- **NoSQL Injection Prevention**: Custom middleware sanitizes MongoDB operators ($, .)
- **XSS Protection**: Script tags and dangerous JavaScript removed from user inputs
- **Parameter Validation**: Request body, query parameters, and URL parameters sanitized
- **File Upload Validation**: File type and size restrictions enforced (5MB max)

### 5. Rate Limiting

Multiple rate limiters protect against brute force and DDoS attacks:

- **General API**: 100 requests per 15 minutes per IP
- **Authentication Endpoints**: 10 requests per 15 minutes per IP
- **OTP Verification**: 5 attempts per 5 minutes per IP
- **Order Creation**: 10 orders per 10 minutes per IP
- **File Uploads**: 15 uploads per 10 minutes per IP
- **Food Management**: 20 operations per 5 minutes per IP (admin)

### 6. CSRF Protection

- **Token-based Protection**: CSRF tokens generated for each session
- **Session Validation**: Tokens validated on all state-changing operations (POST, PUT, DELETE)
- **Token Expiration**: CSRF tokens expire after 1 hour
- **Cookie Storage**: Session IDs stored in httpOnly cookies
- **Automatic Cleanup**: Expired tokens automatically removed every 10 minutes

### 7. JWT Token Security

- **Short-lived Access Tokens**: Expire in 15 minutes to minimize exposure
- **Long-lived Refresh Tokens**: Expire in 7 days for user convenience
- **Automatic Refresh**: System automatically refreshes expired access tokens
- **Secure Storage**: Tokens stored in httpOnly cookies (not localStorage)
- **Token Verification**: All tokens verified before granting access

### 8. HTTP Security Headers (Helmet.js)

- **Content Security Policy**: Restricts resource loading to trusted sources
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Strict-Transport-Security**: Enforces HTTPS connections
- **X-XSS-Protection**: Enables browser XSS filtering

### 9. CORS (Cross-Origin Resource Sharing)

- **Origin Restriction**: Only configured client URL allowed
- **Credentials Support**: Cookies and authentication headers permitted
- **Method Restriction**: Only necessary HTTP methods allowed

### 10. Google reCAPTCHA v2

- **Bot Protection**: Prevents automated registration and login attempts
- **Server-side Verification**: reCAPTCHA tokens verified on backend
- **Registration Protection**: Required for all new user registrations
- **Suspicious Activity Logging**: Failed verifications logged for monitoring

### 11. Real-time Communication Security (Socket.IO)

- **CORS Configuration**: Socket connections restricted to authorized origins
- **Authentication Required**: Users must authenticate before establishing socket connections
- **Room-based Isolation**: Users can only access their own chat rooms and order updates
- **Event Validation**: All socket events validated before processing

---

## Session Management

### Session Timeout
- **Access Token Expiry**: 15 minutes of inactivity
- **Refresh Token Expiry**: 7 days maximum session length
- **Automatic Logout**: Users logged out when tokens expire
- **Token Refresh**: Seamless token refresh without user interruption

### Session Storage
- **HttpOnly Cookies**: Prevents JavaScript access to tokens
- **Secure Flag**: Cookies only transmitted over HTTPS in production
- **SameSite Attribute**: Set to 'strict' to prevent CSRF attacks
- **Cookie Expiration**: Aligned with token expiration times

---

## Data Security & Classification

### Data Types and Protection

| Type of Data | Description | Security Measure Applied |
|--------------|-------------|-------------------------|
| User Credentials | Email addresses and passwords | Bcrypt hashing (12 rounds), OTP verification |
| Personal Information | Names, phone numbers, addresses | Access control, encrypted transmission (HTTPS) |
| Order Data | Order details, items, amounts | Role-based access, audit logging |
| Payment Information | Transaction records | Access restriction, admin-only visibility |
| Location Data | Rider GPS coordinates | Real-time encryption, rider-only access |
| Session Tokens | JWT access and refresh tokens | HttpOnly cookies, short expiration |
| Chat Messages | Customer support conversations | Room isolation, user-specific access |
| System Logs | Authentication and activity logs | Admin-only access, separate log files |

### Confidential Data

**Highly Sensitive Data:**
- User passwords (hashed with bcrypt, never retrievable)
- OTP codes (temporary, deleted after use)
- JWT tokens (httpOnly cookies, not accessible via JavaScript)
- Login attempt counters and lockout timestamps

**Protected Data:**
- User email addresses (used for authentication)
- Personal information (names, addresses, phone numbers)
- Order history and transaction details
- Rider location data

**Protection Methods:**
- Database field-level protection (select: false for sensitive fields)
- Role-based access control
- Encrypted transmission (HTTPS)
- Audit logging for access attempts

---

## System Logs & Monitoring

### Logging Features

The system implements comprehensive logging using Winston logger:

**1. Access Logs (access.log)**
- All HTTP requests logged with timestamps
- Request method, URL, status code, response time
- User agent and IP address tracking

**2. Error Logs (error.log)**
- Application errors and exceptions
- Stack traces for debugging
- Error severity levels

**3. Security Logs (security.log)**
- Failed login attempts with email and IP address
- Successful login events
- User registration events
- Unauthorized access attempts
- Suspicious activity detection
- Failed reCAPTCHA verifications
- Account lockout events

**4. Combined Logs (combined.log)**
- General application activity
- API endpoint access
- System events and warnings

### Log Rotation
- Maximum file size: 5MB per log file
- Maximum files retained: 5-10 files depending on log type
- Automatic rotation when size limit reached

### Purpose
Logs are used to:
- Monitor system usage and performance
- Detect suspicious activities and security threats
- Audit user actions for compliance
- Debug application errors
- Track authentication events
- Investigate security incidents

---

## Encryption Policy

### Password Encryption
- **Algorithm**: Bcrypt with 12 salt rounds
- **Implementation**: Passwords hashed before database storage using Mongoose pre-save hook
- **Verification**: Secure password comparison using bcrypt.compare()

### Data Transmission Encryption
- **HTTPS/TLS**: All data transmitted over encrypted HTTPS connections in production
- **Secure Cookies**: Cookies marked as 'secure' in production environment
- **API Communication**: Client-server communication encrypted end-to-end

### Token Encryption
- **JWT Signing**: Tokens signed with secret key (HS256 algorithm)
- **Payload Protection**: Sensitive data not included in JWT payload
- **Token Verification**: Signature verified on every request

### Database Connection
- **MongoDB Connection**: Encrypted connection string with authentication
- **Environment Variables**: Sensitive credentials stored in .env files (not in code)

---

## Data Backup & Recovery

### Backup Strategy

**Data Backed Up:**
- MongoDB database (all collections: users, foods, orders, chat messages)
- Uploaded files (food images, rider profile pictures)
- System logs (security, error, access logs)
- Configuration files

**Backup Method:**
- **Database**: MongoDB Atlas automatic backups (if using cloud)
- **Local Database**: Manual mongodump commands for local development
- **Files**: Regular file system backups of uploads directory

**Backup Frequency:**
- **Production**: Daily automated backups (recommended)
- **Development**: Weekly manual backups

**Storage Location:**
- **Cloud**: MongoDB Atlas cloud backup storage
- **Local**: External storage or cloud storage services
- **Logs**: Rotated and archived automatically

### Recovery Procedures
- Database restoration using mongorestore command
- File restoration from backup storage
- Log file recovery from archived logs
- Environment configuration restoration from secure storage

---

## Additional Security Measures

### 1. File Upload Security
- **File Type Validation**: Only image files allowed (JPEG, PNG, GIF)
- **File Size Limit**: Maximum 5MB per file
- **Multer Configuration**: Secure file handling middleware
- **Storage Path**: Files stored outside web root with controlled access

### 2. API Security
- **Request Size Limiting**: Maximum 10KB request body size
- **JSON Parsing**: Built-in Express JSON parser with size limits
- **URL Encoding**: Limited to prevent parameter pollution
- **Error Handling**: Generic error messages (no sensitive information exposed)

### 3. Environment Security
- **Environment Variables**: All sensitive data in .env files
- **.gitignore**: Environment files excluded from version control
- **Secret Key Management**: Strong random JWT secret keys
- **API Key Protection**: Third-party API keys (Brevo, reCAPTCHA) secured

### 4. Database Security
- **MongoDB Sanitization**: Prevents NoSQL injection attacks
- **Schema Validation**: Mongoose schemas enforce data types and constraints
- **Connection Security**: Authenticated database connections only
- **Index Optimization**: Unique indexes on email fields prevent duplicates

---

## Limitations of the System Security

While the system implements robust security measures, the following limitations exist:

1. **No Multi-Factor Authentication (MFA)**: System uses OTP via email only, not SMS or authenticator apps
2. **No End-to-End Encryption**: Chat messages encrypted in transit but not end-to-end encrypted
3. **No Payment Gateway Integration**: Payment security depends on future integration
4. **Limited Biometric Authentication**: No fingerprint or face recognition support
5. **Session Management**: Relies on client-side token storage (cookies), vulnerable if client compromised
6. **No IP Whitelisting**: Admin access not restricted to specific IP addresses
7. **File Upload Scanning**: No antivirus scanning of uploaded files
8. **No Database Encryption at Rest**: Database contents not encrypted (depends on MongoDB Atlas encryption)
9. **Limited Audit Trail**: No detailed audit trail for all data modifications
10. **No Automated Security Scanning**: No automated vulnerability scanning or penetration testing

---

## Summary of Security Features

The Polomolok Food Ordering System implements comprehensive security measures including:

- **Authentication**: JWT-based authentication with OTP email verification
- **Password Security**: Bcrypt hashing with 12 salt rounds
- **Access Control**: Role-based access control (Admin, Rider, Customer)
- **Rate Limiting**: Multiple rate limiters to prevent brute force and DDoS attacks
- **Input Validation**: Joi schema validation and NoSQL injection prevention
- **CSRF Protection**: Token-based CSRF protection for state-changing operations
- **XSS Protection**: Input sanitization and secure HTTP headers
- **Account Security**: Automatic account lockout after failed login attempts
- **Session Management**: Short-lived access tokens with automatic refresh
- **Logging & Monitoring**: Comprehensive security event logging with Winston
- **Bot Protection**: Google reCAPTCHA v2 integration
- **Secure Communication**: HTTPS encryption and Socket.IO security
- **File Upload Security**: File type and size validation
- **CORS Configuration**: Restricted cross-origin access
- **HTTP Security Headers**: Helmet.js for additional protection

These security features work together to ensure data confidentiality, integrity, and availability while protecting against common web application vulnerabilities and attacks.

---

**Document Version**: 1.0  
**Last Updated**: {Current Date}  
**System Version**: 1.0.0
