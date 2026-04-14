import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  userId?: mongoose.Types.ObjectId;
  username?: string;
  email?: string;
  ipAddress: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  action: string;
  actionType: 'auth' | 'crud' | 'system' | 'security' | 'permission';
  resource?: string;
  resourceId?: string;
  status: 'success' | 'failure' | 'warning';
  method?: string;
  endpoint?: string;
  statusCode?: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  username: {
    type: String,
    index: true
  },
  email: {
    type: String,
    index: true
  },
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  userAgent: {
    type: String
  },
  device: {
    type: String
  },
  browser: {
    type: String
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  actionType: {
    type: String,
    enum: ['auth', 'crud', 'system', 'security', 'permission'],
    required: true,
    index: true
  },
  resource: {
    type: String,
    index: true
  },
  resourceId: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    required: true,
    index: true
  },
  method: {
    type: String
  },
  endpoint: {
    type: String
  },
  statusCode: {
    type: Number
  },
  errorMessage: {
    type: String
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});

// Compound indexes for common queries
activityLogSchema.index({ timestamp: -1, actionType: 1 });
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ ipAddress: 1, timestamp: -1 });
activityLogSchema.index({ status: 1, timestamp: -1 });

// TTL index - automatically delete logs older than 90 days (optional)
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
