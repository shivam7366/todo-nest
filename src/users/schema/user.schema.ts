import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Query } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc: any, ret: any) => {
      if ('otp' in ret) {
        delete ret.otp;
      }
      if ('otpExpiry' in ret) {
        delete ret.otpExpiry;
      }
      if ('password' in ret) {
        delete ret.password;
      }
      return ret;
    },
  },
})
export class User extends Document {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  dateOfBirth: Date;
  @Prop()
  avtar: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: false })
  otpVerified: boolean;

  @Prop()
  otp: string;

  @Prop()
  otpExpiry: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre(/^find/, function (this: Query<any, any>, next) {
  (this as any).where({ isDeleted: false });
  if (typeof next === 'function') {
    next();
  }
});
