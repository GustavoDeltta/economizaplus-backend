import nodemailer from 'nodemailer';
import { InterfaceMailProvider } from '../../domain/repositories/InterfaceMailProvider';

export class NodemailerMailProvider implements InterfaceMailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, body: string): Promise<void> {
    await this.transporter.sendMail({
      from: 'Economiza+ <noreply@economizaplus.com>',
      to,
      subject,
      html: body,
    });
  }
}
