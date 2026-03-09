# Polomolok Food Ordering System

A highly secure full-stack food ordering web application with production-grade security features.

## 🔒 Security Features

### Authentication & Authorization
- **JWT Authentication** with access and refresh tokens
- **OTP Verification** via email (Brevo API)
- **Role-Based Access Control (RBAC)** - Admin & Customer roles
- **Rate Limiting** - Max 5 login attempts, 5-minute account lockout
- **Password Security** - bcrypt hashing with salt rounds

### API Security
- **Input Validation** using Joi schemas
- **NoSQL Injection Prevention** with mongo-sanitize
- **XSS Protection** with xss-clean middleware
- **CSRF Protection** via helmet
- **Parameter Pollution Prevention**
- **Request Size Limiting** (10kb max)

### Infrastructure Security
- **Helmet.js** - Security HTTP headers
- **CORS** - Configured origin restrictions
- **Rate Limiters** on all endpoints
- **.htaccess** rules for additional protection
- **Environment Variables** for sensitive data

### Token Security
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Automatic token refresh on expiration
- Secure token storage in localStorage

## 🏗️ Tech Stack

### Backend
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- JWT for authentication
- Brevo for email OTP

### Frontend
- React 19
- TypeScript
- TailwindCSS
- React Router DOM
- Axios for API calls
- Lucide React for icons

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Auth, validation, rate limiting
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── types/          # TypeScript types
│   └── utils/          # Helper functions
├── .env                # Environment variables
├── .htaccess          # Apache security rules
├── db.ts              # Database connection
└── server.ts          # Express server

client/
├── src/
│   ├── components/    # Reusable components
│   ├── context/       # React context (Auth, Cart)
│   ├── pages/         # Page components
│   ├── services/      # API service
│   └── types/         # TypeScript types
└── .env               # Frontend environment variables
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Brevo account for email API

### Quick Verification

Run the setup verification script:
```bash
node verify-setup.js
```

This will check if everything is properly configured.

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URL=your_mongodb_connection_string

# Brevo API
BREVO_API_KEY=your_brevo_api_key
BREVO_EMAIL=your_sender_email

# JWT Secret (use a strong random string)
JWT_SECRET=your_jwt_secret_key

# Client URL
CLIENT_URL=http://localhost:5173
```

4. Start the backend server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

Client will run on `http://localhost:5173`

## 🔐 Security Flow

### Login Flow
1. User enters email + password
2. System validates credentials
3. If valid, generates 6-digit OTP
4. OTP sent via Brevo email API
5. OTP expires in 5 minutes
6. User enters OTP
7. System verifies OTP
8. If correct, generates JWT tokens
9. Access token (15min) + Refresh token (7 days)
10. User logged in successfully

### Rate Limiting
- **Login attempts**: Max 5 attempts
- **Account lockout**: 5 minutes after max attempts
- **API requests**: 100 requests per 15 minutes
- **OTP verification**: 5 attempts per 5 minutes

### Protected Routes
All API routes are protected with:
- JWT authentication middleware
- Role-based authorization
- Input validation
- Rate limiting

## 👥 User Roles

### Customer
- Browse food menu
- Add items to cart
- Place orders
- View order history
- Manage profile

### Admin
- Dashboard with statistics
- Manage food items (CRUD)
- Manage orders (update status)
- Manage users
- View system analytics

## 🎨 Design

- **Minimalist** black and white theme
- **Responsive** design for all devices
- **shadcn-inspired** components
- **Clean** and modern UI
- **Smooth** hover effects and transitions

## 📧 Email Configuration

The system uses Brevo (formerly Sendinblue) for sending OTP emails:

1. Create a Brevo account at https://www.brevo.com
2. Get your API key from Settings > SMTP & API
3. Verify your sender email
4. Add credentials to `.env` file

## 🛡️ Security Best Practices Implemented

1. ✅ Password hashing with bcrypt (12 salt rounds)
2. ✅ JWT token-based authentication
3. ✅ OTP verification for login
4. ✅ Rate limiting on all endpoints
5. ✅ Input validation and sanitization
6. ✅ NoSQL injection prevention
7. ✅ XSS protection
8. ✅ CSRF protection
9. ✅ Secure HTTP headers (Helmet)
10. ✅ CORS configuration
11. ✅ Environment variable protection
12. ✅ Account lockout mechanism
13. ✅ Token expiration and refresh
14. ✅ Role-based access control
15. ✅ .htaccess security rules

## 🧪 Testing the System

### Create Admin User
You'll need to manually create an admin user in MongoDB:

```javascript
{
  name: "Admin",
  email: "admin@example.com",
  password: "$2b$12$hashedpassword", // Use bcrypt to hash
  role: "admin",
  loginAttempts: 0,
  createdAt: new Date()
}
```

Or register as a customer and manually change the role to "admin" in the database.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (sends OTP)
- `POST /api/auth/verify-otp` - Verify OTP and get tokens
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/profile` - Get user profile

### Foods
- `GET /api/foods` - Get all foods
- `GET /api/foods/:id` - Get food by ID
- `POST /api/foods` - Create food (Admin only)
- `PUT /api/foods/:id` - Update food (Admin only)
- `DELETE /api/foods/:id` - Delete food (Admin only)

### Orders
- `POST /api/orders` - Create order (Customer only)
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/all` - Get all orders (Admin only)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (Admin only)
- `PUT /api/orders/:id/cancel` - Cancel order (Customer only)

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/statistics` - Get system statistics (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

## 🌐 Service Area

This system is designed for **Polomolok only**. Delivery is restricted to this area.

## 📄 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

This is a demonstration project showcasing production-grade security practices.

---

**Built with security in mind** 🔒
