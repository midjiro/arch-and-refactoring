import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser {
  username: string;
  password?: string;
  googleId?: string;
}

export interface IUserDocument extends IUser, Document {
  comparePassword?(candidate: string): Promise<boolean>;
  id: string;
}

interface IUserModel extends Model<IUserDocument> {}

const UserSchema = new mongoose.Schema<IUserDocument>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  googleId: { type: String, unique: true, sparse: true },
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

export const User = mongoose.model<IUserDocument, IUserModel>(
  'User',
  UserSchema,
);
