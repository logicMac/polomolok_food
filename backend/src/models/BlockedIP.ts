import mongoose, { Schema, Document } from 'mongoose';

export interface IBlockedIP extends Document {
  ipAddress: string;
  reason: string;
  blockedBy: mongoose.Types.ObjectId;
  blockedByUsername: string;
  failedAttempts?: number;
  autoBlocked: boolean;
  isActive: boolean;
  blockedAt: Date;
  expiresAt?: Date;
  lastAttempt?: Date;
  metadata?: Record<string, any>;
}

const blockedIPSchema = new Schema<IBlockedIP>({
  ipAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  reason: {
    type: String,
    required: true
  },
  blockedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blockedByUsername: {
    type: String,
    required: true
  },
  failedAttempts: {
    type: Number,
    default: 0
  },
  autoBlocked: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  blockedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  lastAttempt: {
    type: Date
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for checking active blocks
blockedIPSchema.index({ ipAddress: 1, isActive: 1 });

export default mongoose.model<IBlockedIP>('BlockedIP', blockedIPSchema);
