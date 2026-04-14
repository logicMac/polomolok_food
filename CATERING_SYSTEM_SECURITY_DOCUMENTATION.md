# SOUTH EAST ASIAN INSTITUTE OF TECHNOLOGY

## COLLEGE OF INFORMATION AND COMMUNICATION TECHNOLOGY
National Highway, Crossing Rubber, Tupi, 9505  
South Cotabato, Philippines

---

# Information Security Features Documentation

**Catering Management System**

---

**Prepared by:**

{Full Name 1}  
{Full Name 2}  
{Full Name 3}

---

## Introduction

The Catering Management System is a web-based application designed to streamline catering service bookings and management operations. It is used by two types of users: customers who book catering services and menus, and administrators who manage bookings, payments, inventory, menus, and staff. The system handles sensitive data such as personal information (names, emails, contact details), booking details, payment transactions, and administrative credentials. To protect this data, multiple security features are implemented to prevent unauthorized access, SQL injection attacks, cross-site scripting (XSS), data breaches, and ensure secure authentication. The system is deployed online using InfinityFree hosting services.

---

## System Users & Access Control

### Admin
- **Full system access** with complete control over all features
- Can approve or reject customer booking requests
- Can process and manage payment transactions
- Can add, edit, and delete inventory items
- Can manage menu items (create, update, delete)
- Can manage staff accounts and permissions
- Can view all customer bookings and booking history
- Can generate reports and view system analytics
- Access to system configuration and settings
- Cannot be created through public registration (admin accounts created manually)

### Customer (Regular Users)
- Can browse available catering menus and services
- Can submit booking requests for catering services
- Can view their own booking history and status
- Can update their profile information
- Can view menu details and pricing
- Cannot access admin panel or administrative features
- Cannot view other customers' bookings or information
- Cannot modify inventory, menus, or staff data
- Cannot process payments or approve bookings

### Access Control Implementation

The system implements **Role-Based Access Control (RBAC)** with session-based authentication:

1. **Session Management**: PHP sessions track authenticated users and their roles
2. **Role Verification**: Every admin page checks user role before granting access
3. **Login Required**: All protected pages redirect to login if user not authenticated
4. **OTP Verification**: Two-factor authentication required for all login attempts
5. **Page-level Protection**: Admin and customer areas separated with role checks
6. **Automatic Logout**: Sessions expire after period of inactivity

---

## Implemented Security Features

### 1. Password Security

- **Password Hashing**: All passwords hashed using PHP's `password_hash()` function with bcrypt algorithm
- **No Plain Text Storage**: Passwords never stored in plain text in MySQL database
- **Minimum Length**: Passwords must be at least 8 characters long
- **Password Verification**: Secure password comparison using `password_verify()` function
- **Validation**: Email format validation and password strength requirements enforced
- **Salt Generation**: Automatic salt generation for each password (built into bcrypt)

### 2. Two-Factor Authentication (OTP Verification)

- **Email-based OTP**: 6-digit one-time password sent via email for every login attempt
- **Time-limited**: OTP expires after 5 minutes
- **Single-use**: OTP deleted from database after successful verification
- **Mandatory**: No user can login without OTP verification
- **Secure Generation**: Random OTP generation using secure PHP functions
- **Database Storage**: OTP temporarily stored with expiration timestamp

### 3. Rate Limiting

Protection against brute force attacks and excessive requests:

- **Login Attempts**: Maximum 5 failed login attempts per IP address
- **Temporary Lockout**: 15-minute lockout after exceeding login attempts
- **IP-based Tracking**: Failed attempts tracked by IP address in database
- **Automatic Reset**: Attempt counter resets after successful login
- **Registration Limiting**: Prevents mass account creation from single IP
- **OTP Request Limiting**: Maximum OTP requests per time period

### 4. MySQL Injection Prevention

- **Prepared Statements**: All database queries use PDO prepared statements with parameter binding
- **Input Sanitization**: User inputs sanitized before database operations
- **Parameterized Queries**: No direct SQL string concatenation with user input
- **PDO Configuration**: PDO error mode set to exception for better error handling
- **Type Casting**: Numeric inputs cast to appropriate types before queries
- **Whitelist Validation**: Only expected values allowed for critical parameters

### 5. Input Validation & Sanitization

- **Server-side Validation**: All form inputs validated on server before processing
- **Email Validation**: Email format verified using PHP filter functions
- **Phone Number Validation**: Phone numbers validated for correct format
- **Length Restrictions**: Maximum and minimum length enforced for all inputs
- **Special Character Filtering**: Dangerous characters removed or escaped
- **HTML Entity Encoding**: Output encoded to prevent XSS attacks
- **File Upload Validation**: File type, size, and extension validated for uploads

### 6. XSS (Cross-Site Scripting) Protection

- **Output Encoding**: All user-generated content encoded using `htmlspecialchars()`
- **Input Filtering**: Script tags and JavaScript code removed from inputs
- **Content Security Policy**: HTTP headers configured to prevent inline scripts
- **Attribute Escaping**: HTML attributes properly escaped
- **JavaScript Validation**: Client-side validation as additional layer (not relied upon)

### 7. CSRF (Cross-Site Request Forgery) Protection

- **CSRF Tokens**: Unique tokens generated for each user session
- **Token Validation**: All form submissions require valid CSRF token
- **Token Regeneration**: New tokens generated after successful form submission
- **Session-based Tokens**: Tokens stored in PHP session and verified on submission
- **Form Protection**: All state-changing operations protected with CSRF tokens
- **Token Expiration**: Tokens expire with session timeout

### 8. Google reCAPTCHA v2

- **Bot Protection**: Prevents automated registration attempts
- **Registration Requirement**: reCAPTCHA required for all new user registrations
- **Server-side Verification**: reCAPTCHA response verified on backend with Google API
- **Score Validation**: Verification response checked before account creation
- **Failed Attempt Logging**: Failed reCAPTCHA attempts logged for monitoring
- **User-friendly**: Checkbox-based reCAPTCHA for better user experience

### 9. Environment Variable Protection (.env)

- **Sensitive Data Storage**: Database credentials, API keys stored in .env file
- **File Permissions**: .env file permissions restricted (not publicly accessible)
- **Version Control Exclusion**: .env file excluded from Git repository
- **.htaccess Protection**: .env file access blocked via .htaccess rules
- **Configuration Separation**: Development and production configs separated
- **No Hardcoded Credentials**: All sensitive data loaded from environment variables

### 10. .htaccess Security Configuration

- **Directory Listing Disabled**: Prevents browsing of directory contents
- **File Access Restriction**: Sensitive files (.env, config files) blocked from web access
- **HTTPS Enforcement**: Redirects HTTP traffic to HTTPS (if SSL available)
- **PHP Error Display**: Error display disabled in production
- **File Upload Protection**: Prevents execution of uploaded PHP files
- **Security Headers**: Additional HTTP security headers configured
- **URL Rewriting**: Clean URLs implemented for better security

---

## Session Management

### Session Security
- **Session Timeout**: Sessions expire after 30 minutes of inactivity
- **Session Regeneration**: Session ID regenerated after login to prevent fixation attacks
- **Secure Session Storage**: Session data stored server-side only
- **HttpOnly Flag**: Session cookies set with httpOnly flag (if supported by hosting)
- **Session Validation**: User agent and IP validation for session integrity
- **Logout Functionality**: Complete session destruction on logout

### Session Storage
- **Server-side Storage**: Session data stored on server, not in cookies
- **Session ID Only**: Only session identifier sent to client
- **Automatic Cleanup**: Expired sessions automatically cleaned by PHP garbage collection
- **Session Hijacking Prevention**: Session ID regeneration and validation checks

---

## Data Security & Classification

### Data Types and Protection

| Type of Data | Description | Security Measure Applied |
|--------------|-------------|-------------------------|
| User Credentials | Email addresses and passwords | Bcrypt password hashing, OTP verification |
| Personal Information | Names, phone numbers, addresses | Input validation, XSS protection, access control |
| Booking Data | Catering bookings, dates, details | Role-based access, SQL injection prevention |
| Payment Information | Payment status, transaction records | Admin-only access, encrypted transmission (HTTPS) |
| Inventory Data | Stock levels, item details | Admin-only access, input validation |
| Menu Information | Menu items, pricing, descriptions | Input sanitization, XSS protection |
| Staff Data | Staff accounts, roles, permissions | Admin-only access, password hashing |
| OTP Codes | Temporary verification codes | Time-limited, single-use, automatic deletion |
| Session Data | User sessions, authentication state | Server-side storage, session timeout |
| CSRF Tokens | Form protection tokens | Session-based, single-use validation |

### Confidential Data

**Highly Sensitive Data:**
- User passwords (hashed with bcrypt, never retrievable)
- OTP verification codes (temporary, deleted after use)
- Database credentials (stored in .env file)
- API keys (reCAPTCHA secret key, email service keys)
- Session identifiers

**Protected Data:**
- User email addresses and contact information
- Customer booking details and preferences
- Payment transaction records
- Staff account information
- Inventory and stock data

**Protection Methods:**
- Database encryption for sensitive fields
- Role-based access control
- HTTPS encrypted transmission (when SSL configured)
- Input validation and output encoding
- Audit logging for sensitive operations

---

## System Logs & Monitoring

### Logging Features

The system implements logging for security and monitoring purposes:

**1. Authentication Logs**
- Failed login attempts with timestamp and IP address
- Successful login events with user ID and timestamp
- OTP generation and verification attempts
- Account lockout events due to excessive failed attempts
- Session creation and destruction

**2. Security Event Logs**
- Failed reCAPTCHA verification attempts
- CSRF token validation failures
- SQL injection attempt detection
- Suspicious input patterns
- Unauthorized access attempts to admin pages

**3. User Activity Logs**
- Booking creation and modifications
- Payment processing events
- Inventory changes (admin actions)
- Menu management operations
- Staff account modifications

**4. Error Logs**
- Database connection errors
- File upload errors
- Email sending failures
- System exceptions and warnings

### Log Storage
- Logs stored in database tables with timestamps
- Separate log files for different event types
- Log rotation to prevent excessive file sizes
- Admin dashboard for viewing recent security events

### Purpose
Logs are used to:
- Monitor system usage and detect anomalies
- Investigate security incidents
- Track failed authentication attempts
- Audit administrative actions
- Debug application errors
- Comply with security best practices
- Identify potential security threats

---

## Encryption Policy

### Password Encryption
- **Algorithm**: Bcrypt (via PHP `password_hash()` function)
- **Cost Factor**: Default bcrypt cost (currently 10 rounds)
- **Implementation**: Passwords hashed before database insertion
- **Verification**: Secure comparison using `password_verify()`
- **Rehashing**: Passwords can be rehashed if cost factor increases

### Data Transmission Encryption
- **HTTPS/SSL**: System supports HTTPS for encrypted data transmission
- **InfinityFree SSL**: Free SSL certificate available through hosting provider
- **Secure Forms**: All forms submit over HTTPS when SSL enabled
- **Cookie Security**: Secure flag on cookies when HTTPS active

### Sensitive Data Encryption
- **Database Fields**: Sensitive fields can be encrypted before storage
- **OTP Storage**: OTP codes stored with expiration timestamps
- **Session Data**: Session data encrypted by PHP session handler

### Configuration Security
- **.env File**: Database credentials and API keys stored securely
- **File Permissions**: Configuration files have restricted permissions
- **.htaccess Protection**: Direct access to config files blocked

---

## Data Backup & Recovery

### Backup Strategy

**Data Backed Up:**
- MySQL database (all tables: users, bookings, inventory, menus, staff, logs)
- Uploaded files (menu images, booking attachments)
- Configuration files (.env, database config)
- .htaccess security rules

**Backup Method:**
- **Database**: Manual MySQL database exports via phpMyAdmin
- **InfinityFree Backup**: Hosting provider's backup features (if available)
- **Manual Exports**: Regular database dumps using mysqldump
- **File Backup**: FTP download of uploaded files and critical directories

**Backup Frequency:**
- **Production**: Weekly manual database backups (recommended)
- **Before Updates**: Backup before any major system changes
- **Monthly**: Full system backup including files and database

**Storage Location:**
- **Local Storage**: Database backups downloaded to local computer
- **Cloud Storage**: Backups uploaded to Google Drive or Dropbox
- **External Drive**: Additional backup on external storage device
- **Version Control**: Code backed up in Git repository (excluding sensitive files)

### Recovery Procedures
- Database restoration using phpMyAdmin import feature
- File restoration via FTP upload
- Configuration restoration from backup .env file
- Testing restored system before going live
- Rollback procedures for failed updates

---

## Additional Security Measures

### 1. File Upload Security
- **File Type Validation**: Only allowed file types accepted (images for menus)
- **File Size Limit**: Maximum file size enforced (e.g., 5MB)
- **File Extension Check**: Double extension attacks prevented
- **Upload Directory Protection**: Uploaded files stored outside web root or with execution disabled
- **Filename Sanitization**: Uploaded filenames sanitized to prevent directory traversal
- **MIME Type Verification**: File content verified to match extension

### 2. Form Security
- **Server-side Validation**: All validation performed on server (not just client-side)
- **Required Field Enforcement**: Critical fields marked as required
- **Data Type Validation**: Numeric fields validated as numbers, dates as valid dates
- **Dropdown Validation**: Select options validated against allowed values
- **Hidden Field Protection**: Hidden fields validated to prevent tampering

### 3. Database Security
- **PDO with Prepared Statements**: All queries use parameterized statements
- **Least Privilege Principle**: Database user has only necessary permissions
- **Connection Security**: Database credentials stored in .env file
- **Error Handling**: Database errors logged, not displayed to users
- **Table Prefixes**: Optional table prefixes for additional security
- **Regular Updates**: MySQL version kept up to date (managed by hosting)

### 4. Hosting Security (InfinityFree)
- **Free Hosting**: System deployed on InfinityFree shared hosting
- **SSL Support**: Free SSL certificates available via hosting panel
- **PHP Version**: Modern PHP version supported (7.4+)
- **File Manager**: Secure file management through hosting control panel
- **phpMyAdmin**: Database management with password protection
- **Firewall**: Hosting provider's firewall protection
- **DDoS Protection**: Basic DDoS protection by hosting provider

### 5. Error Handling
- **Custom Error Pages**: User-friendly error pages (404, 500)
- **Error Logging**: Errors logged to file, not displayed to users
- **Production Mode**: Display_errors set to Off in production
- **Generic Messages**: Generic error messages shown to users (no sensitive details)
- **Exception Handling**: Try-catch blocks for critical operations

---

## Deployment Security (InfinityFree)

### Hosting Configuration
- **Control Panel**: Secure access to hosting control panel with strong password
- **FTP Security**: FTP credentials protected, SFTP used when available
- **File Permissions**: Proper file permissions set (644 for files, 755 for directories)
- **Directory Protection**: Sensitive directories protected with .htaccess
- **Database Access**: phpMyAdmin access restricted by password

### Production Environment
- **Debug Mode Off**: PHP error display disabled in production
- **Error Logging**: Errors logged to files, not shown to users
- **.env Security**: Environment file protected from web access
- **Version Control**: .git directory excluded or removed from production
- **Backup Before Deploy**: Always backup before deploying updates

### SSL/HTTPS Configuration
- **Free SSL**: InfinityFree provides free SSL certificates
- **HTTPS Redirect**: .htaccess configured to redirect HTTP to HTTPS
- **Secure Cookies**: Cookies set with secure flag when HTTPS active
- **Mixed Content**: All resources loaded over HTTPS

---

## Limitations of the System Security

While the system implements robust security measures, the following limitations exist:

1. **Shared Hosting Limitations**: InfinityFree is shared hosting with resource limitations
2. **No Dedicated Firewall**: Relies on hosting provider's firewall, no custom WAF
3. **Limited Server Access**: No SSH access or server-level configuration control
4. **No Automated Backups**: Manual backup process required (no automated backup system)
5. **Basic Rate Limiting**: Rate limiting implemented in application, not at server level
6. **No Intrusion Detection**: No dedicated IDS/IPS system
7. **Email Security**: Depends on hosting provider's email service or third-party API
8. **No Database Encryption at Rest**: MySQL data not encrypted at rest (hosting limitation)
9. **Limited Logging**: Log storage limited by hosting disk space
10. **No Multi-Factor Authentication Options**: Only email-based OTP available
11. **Session Storage**: PHP file-based sessions (no Redis or Memcached)
12. **No CDN**: No content delivery network for DDoS protection
13. **Limited PHP Extensions**: Some security extensions may not be available
14. **No Automated Security Scanning**: Manual security audits required

---

## Security Best Practices Implemented

### Development Practices
- **Secure Coding**: Following OWASP security guidelines
- **Input Validation**: Never trust user input
- **Output Encoding**: Always encode output to prevent XSS
- **Least Privilege**: Users have minimum necessary permissions
- **Defense in Depth**: Multiple layers of security

### Maintenance Practices
- **Regular Updates**: PHP and dependencies kept up to date
- **Security Monitoring**: Regular review of security logs
- **Backup Routine**: Regular database and file backups
- **Password Policy**: Strong password requirements enforced
- **Access Review**: Regular review of admin accounts

### Deployment Practices
- **Environment Separation**: Development and production environments separated
- **Secure Credentials**: All credentials stored in .env file
- **Version Control**: Code managed in Git (sensitive files excluded)
- **Testing**: Security features tested before deployment
- **Documentation**: Security measures documented for maintenance

---

## Summary of Security Features

The Catering Management System implements comprehensive security measures including:

- **Authentication**: Session-based authentication with mandatory OTP email verification for every login
- **Password Security**: Bcrypt password hashing with PHP `password_hash()` function
- **Access Control**: Role-based access control (Admin and Customer roles)
- **Rate Limiting**: Login attempt limiting with IP-based tracking and temporary lockout
- **SQL Injection Prevention**: PDO prepared statements with parameter binding for all database queries
- **Input Validation**: Server-side validation and sanitization of all user inputs
- **XSS Protection**: Output encoding with `htmlspecialchars()` and input filtering
- **CSRF Protection**: Token-based CSRF protection for all form submissions
- **Bot Protection**: Google reCAPTCHA v2 for registration
- **Environment Security**: Sensitive credentials stored in .env file with .htaccess protection
- **.htaccess Configuration**: Directory listing disabled, file access restrictions, security headers
- **Session Management**: Secure PHP sessions with timeout and regeneration
- **File Upload Security**: File type, size, and extension validation
- **HTTPS Support**: SSL/TLS encryption for data transmission (InfinityFree SSL)
- **Security Logging**: Comprehensive logging of authentication and security events
- **Error Handling**: Secure error handling with generic user messages

### Technology Stack
- **Backend**: PHP (7.4+)
- **Database**: MySQL with PDO
- **Frontend**: HTML, CSS, JavaScript, TailwindCSS
- **Hosting**: InfinityFree (Free Web Hosting)
- **Security**: reCAPTCHA v2, CSRF tokens, bcrypt hashing
- **Email**: PHP mail() or third-party email service for OTP delivery

These security features work together to protect against common web application vulnerabilities including SQL injection, XSS, CSRF, brute force attacks, and unauthorized access, ensuring the confidentiality, integrity, and availability of the catering management system and its data.

---

**Document Version**: 1.0  
**Last Updated**: {Current Date}  
**System Version**: 1.0.0  
**Deployment**: InfinityFree Hosting (Production)
