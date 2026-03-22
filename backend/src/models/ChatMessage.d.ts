import mongoose, { Document } from 'mongoose';
interface IChatMessage extends Document {
    orderId?: string;
    userId: string;
    userName: string;
    message: string;
    sender: 'user' | 'admin' | 'system';
    isRead: boolean;
    createdAt: Date;
}
declare const _default: mongoose.Model<IChatMessage, {}, {}, {}, mongoose.Document<unknown, {}, IChatMessage, {}, mongoose.DefaultSchemaOptions> & IChatMessage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IChatMessage>;
export default _default;
//# sourceMappingURL=ChatMessage.d.ts.map