import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

// this model contains mail logs which sent to users email content, type and status

@Schema({ timestamps: true })
export class MailLog extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  emailType: string;

  @Prop({ required: true })
  status: string;

  @Prop()
  errorDetails?: string;
}

export const MailLogSchema = SchemaFactory.createForClass(MailLog);
