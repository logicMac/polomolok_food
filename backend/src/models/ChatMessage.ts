import mongoose, { Schema, Document } from 'mongoose';

interface IChatMessage extends Document {
  orderId?: string;
  userId: string;
  userName: string;
  message: string;
  sender: 'user' | 'admin' | 'system';
  isRead: boolean;
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
  orderId: {
    type: String,
    ref: 'Order'
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  userName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  sender: {
    type: String,
    enum: ['user', 'admin', 'system'],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

chatMessageSchema.index({ userId: 1, createdAt: -1 });
chatMessageSchema.index({ orderId: 1, createdAt: -1 });

export default mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
