import mongoose, { Document } from 'mongoose';
import { IUser } from '../types';
interface IUserDocument extends Omit<IUser, '_id'>, Document {
}
declare const _default: mongoose.Model<IUserDocument, {}, {}, {}, mongoose.Document<unknown, {}, IUserDocument, {}, mongoose.DefaultSchemaOptions> & IUserDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUserDocument>;
export default _default;
//# sourceMappingURL=User.d.ts.map