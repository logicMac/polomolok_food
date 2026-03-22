import mongoose, { Document } from 'mongoose';
import { IOrder } from '../types';
interface IOrderDocument extends Omit<IOrder, '_id'>, Document {
}
declare const _default: mongoose.Model<IOrderDocument, {}, {}, {}, mongoose.Document<unknown, {}, IOrderDocument, {}, mongoose.DefaultSchemaOptions> & IOrderDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrderDocument>;
export default _default;
//# sourceMappingURL=Order.d.ts.map