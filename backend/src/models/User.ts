import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from '../types';

const LOCK_TIME = 5 * 60 * 1000; // 5 minutes
const MAX_LOGIN_ATTEMPTS = 5;

interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const userSchema = new Schema<IUserDocument>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'customer', 'rider'],
    default: 'customer'
  },
  // Rider-specific fields
  phoneNumber: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['motorcycle', 'bicycle', 'car', 'scooter'],
    required: function(this: any) {
      return this.role === 'rider';
    }
  },
  vehicleNumber: {
    type: String,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    lastUpdated: Date
  },
  image: {
    type: String
  },
  otp: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  lockUntil: {
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
    return;
  }

  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // Lock account after max attempts
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.lockUntil) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME) };
  }

  await this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

export default mongoose.model<IUserDocument>('User', userSchema);
