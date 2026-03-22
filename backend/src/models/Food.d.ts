import mongoose, { Document } from 'mongoose';
import { IFood } from '../types';
interface IFoodDocument extends Omit<IFood, '_id'>, Document {
}
declare const _default: mongoose.Model<IFoodDocument, {}, {}, {}, mongoose.Document<unknown, {}, IFoodDocument, {}, mongoose.DefaultSchemaOptions> & IFoodDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IFoodDocument>;
export default _default;
//# sourceMappingURL=Food.d.ts.map