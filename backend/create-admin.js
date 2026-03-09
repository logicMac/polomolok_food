const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Admin credentials
const ADMIN_EMAIL = 'agaling181@gmail.com';
const ADMIN_PASSWORD = 'dimahack123';
const ADMIN_NAME = 'Admin User';

// User Schema (simplified version)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Role:', existingAdmin.role);
      
      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated user role to admin');
      }
      
      await mongoose.connection.close();
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', ADMIN_PASSWORD);
    console.log('👤 Role:', admin.role);
    console.log('🆔 User ID:', admin._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

// Run the script
createAdmin();
