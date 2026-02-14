import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectModel } from '@nestjs/mongoose';
import { MailLog } from './schema/mail-log.schema';
import { Model } from 'mongoose';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    @InjectModel(MailLog.name) private mailLogModel: Model<MailLog>,
  ) {}

  async sendOtpMail(email: string, otp: string, firstName: string) {
    return this.sendMailWrapper(
      email,
      'Your Verification Code',
      'otp',
      { firstName, otp, year: new Date().getFullYear() },
      'OTP',
    );
  }

  async sendWelcomeMail(email: string, name: string, dashboardUrl: string) {
    return this.sendMailWrapper(
      email,
      'Welcome to TodoApp',
      'welcome',
      { name, dashboardUrl },
      'Welcome',
    );
  }

  private async sendMailWrapper(
    email: string,
    subject: string,
    template: string,
    context: any,
    type: string,
  ) {
    try {
      const mail = await this.mailerService.sendMail({
        to: email,
        subject,
        template,
        context,
      });
      await new this.mailLogModel({
        email: email,
        emailType: type,
        status: 'SENT',
      }).save();
      return true;
    } catch (error) {
      await new this.mailLogModel({
        email: email,
        emailType: type,
        status: 'FAILED',
        error: error.message,
      }).save();

      console.error(`Mail failed to ${email}:`, error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
