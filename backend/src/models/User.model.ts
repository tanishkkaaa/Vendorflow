import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Role } from '@constants/roles';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  organizationId: Types.ObjectId;
  department?: string;
  isActive: boolean;
  vendorId?: Types.ObjectId; // set when role === VENDOR, links to Vendor profile
  lastLoginAt?: Date;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: Object.values(Role), required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    department: { type: String },
    isActive: { type: Boolean, default: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.index({ organizationId: 1, role: 1 });

export const User = model<IUser>('User', userSchema);
