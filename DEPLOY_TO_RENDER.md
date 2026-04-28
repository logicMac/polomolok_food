Quick Deployment Guide for Render
Polomolok Food Ordering System

STEP 1: PUSH TO GITHUB
=======================

git add .
git commit -m "Add security features and pentest scripts"
git push origin main


STEP 2: CREATE BACKEND SERVICE
===============================

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:

   Name: polomolok-food-backend
   Root Directory: backend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start

5. Add Environment Variables:

   NODE_ENV=production
   MONGO_URL=<your-mongodb-atlas-connection-string>
   BREVO_API_KEY=<your-brevo-api-key>
   BREVO_EMAIL=<your-sender-email>
   JWT_SECRET=<generate-strong-random-string-min-32-chars>
   JWT_ACCESS_TOKEN_EXPIRY=15m
   JWT_REFRESH_TOKEN_EXPIRY=7d
   CLIENT_URL=<will-be-your-frontend-url>
   RECAPTCHA_SECRET_KEY=<your-recaptcha-secret-key>

6. Click "Create Web Service"


STEP 3: CREATE FRONTEND SERVICE
================================

1. Click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:

   Name: polomolok-food-client
   Root Directory: client
   Build Command: npm install && npm run build
   Publish Directory: client/dist

4. Add Rewrite Rule (for React Router):
   
   Source: /*
   Destination: /index.html
   Action: Rewrite

5. Click "Create Static Site"


STEP 4: UPDATE CLIENT_URL
==========================

After frontend deploys:

1. Copy your frontend URL (e.g., https://polomolok-food-client.onrender.com)
2. Go to backend service settings
3. Update CLIENT_URL environment variable with frontend URL
4. Backend will auto-redeploy


STEP 5: TEST DEPLOYMENT
========================

1. Visit your frontend URL
2. Test registration
3. Test login with OTP
4. Test admin features
5. Test rider features
6. Test order placement

Run production pentest:
node pentest-production.js https://your-backend-url.onrender.com


ENVIRONMENT VARIABLES REFERENCE
================================

Backend (.env on Render):
-------------------------
PORT                      # Auto-set by Render (usually 10000)
NODE_ENV=production
MONGO_URL                 # MongoDB Atlas connection string
BREVO_API_KEY            # From Brevo dashboard
BREVO_EMAIL              # Your verified sender email
JWT_SECRET               # Strong random string (min 32 chars)
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
CLIENT_URL               # Your frontend Render URL
RECAPTCHA_SECRET_KEY     # From Google reCAPTCHA admin

Client (.env - already configured):
------------------------------------
VITE_API_URL=/api
VITE_RECAPTCHA_SITE_KEY=6LfRCIMsAAAAADxvQPAYEIGuZxRvqfTyli_QmYId


GENERATE JWT SECRET
===================

Use one of these methods:

Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

Online:
https://generate-secret.vercel.app/32

PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})


MONGODB ATLAS SETUP
===================

1. Go to https://cloud.mongodb.com
2. Create free cluster (if not exists)
3. Database Access → Add user
4. Network Access → Add IP (0.0.0.0/0 for Render)
5. Connect → Drivers → Copy connection string
6. Replace <password> with your database user password


BREVO EMAIL SETUP
=================

1. Go to https://www.brevo.com
2. Sign up for free account
3. Settings → SMTP & API → API Keys
4. Create new API key
5. Copy API key to BREVO_API_KEY
6. Verify sender email in Brevo dashboard


RECAPTCHA SETUP
===============

Already configured with test keys.

For production (optional):
1. Go to https://www.google.com/recaptcha/admin
2. Register your domain
3. Get Site Key and Secret Key
4. Update VITE_RECAPTCHA_SITE_KEY in client
5. Update RECAPTCHA_SECRET_KEY in backend


TROUBLESHOOTING
===============

Build Fails:
- Check Node version (should be 18+)
- Verify package.json scripts
- Check build logs for errors

App Crashes:
- Verify all environment variables are set
- Check MongoDB connection string
- Review application logs in Render dashboard

CORS Errors:
- Ensure CLIENT_URL matches frontend URL exactly
- Check CORS configuration in backend

Can't Login:
- Verify Brevo API key is correct
- Check email is verified in Brevo
- Test OTP email delivery


MONITORING
==========

Render Dashboard:
- View logs in real-time
- Monitor CPU/memory usage
- Check deployment history

Application Logs:
- Security events logged to Winston
- Activity logs in MongoDB
- Failed login attempts tracked


POST-DEPLOYMENT CHECKLIST
==========================

□ Backend deployed successfully
□ Frontend deployed successfully
□ Can access frontend URL
□ Registration works
□ Login with OTP works
□ Email delivery works
□ Admin dashboard accessible
□ Rider features work
□ Order placement works
□ Real-time chat works
□ Security features active
□ Production pentest passed


USEFUL COMMANDS
===============

View Backend Logs:
Render Dashboard → Your Service → Logs

Restart Service:
Render Dashboard → Your Service → Manual Deploy → Deploy latest commit

Rollback:
Render Dashboard → Your Service → Deploys → Rollback to previous

Test Production:
node pentest-production.js https://your-backend-url.onrender.com


COST ESTIMATE
=============

Free Tier (Render):
- Backend: Free (spins down after 15 min inactivity)
- Frontend: Free (always on)
- MongoDB Atlas: Free (512 MB storage)
- Brevo: Free (300 emails/day)
- reCAPTCHA: Free

Note: Free tier backend spins down after inactivity.
First request after spin-down may take 30-60 seconds.

Paid Tier (Optional):
- Backend: $7/month (always on, no spin down)
- Frontend: Free
- MongoDB Atlas: $9/month (2GB storage, better performance)


SUPPORT
=======

Render Docs: https://render.com/docs
MongoDB Docs: https://docs.mongodb.com
Brevo Docs: https://developers.brevo.com

For issues with this application:
1. Check PRE_DEPLOYMENT_TEST_REPORT.md
2. Review application logs
3. Test locally first
4. Check environment variables


SECURITY NOTES
==============

✓ All passwords hashed with bcrypt
✓ JWT tokens in httpOnly cookies
✓ Rate limiting active
✓ CSRF protection enabled
✓ XSS protection enabled
✓ NoSQL injection protection
✓ Account lockout after failed attempts
✓ IP blocking for suspicious activity
✓ Security headers configured
✓ Activity logging enabled

Run production pentest after deployment to verify!


SUCCESS!
========

If everything works:
1. Your app is live! 🎉
2. Run production pentest
3. Monitor logs for first few days
4. Set up regular backups
5. Plan for scaling if needed

Congratulations on your deployment! 🚀
