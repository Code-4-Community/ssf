import { Inject, Injectable } from '@nestjs/common';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import MailComposer from 'nodemailer/lib/mail-composer';
import * as dotenv from 'dotenv';
import Mail from 'nodemailer/lib/mailer';
import { AMAZON_SES_CLIENT } from './awsSesClient.factory';
dotenv.config();

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

@Injectable()
export class AmazonSESWrapper {
  private client: SESv2Client;

  /**
   * @param client injected from `awsSesClient.factory.ts`
   * builds our Amazon SES v2 client with credentials from environment variables
   */
  constructor(@Inject(AMAZON_SES_CLIENT) client: SESv2Client) {
    this.client = client;
  }

  /**
   * Sends an email via Amazon SES.
   *
   * @param recipientEmails the email addresses of the recipients
   * @param subject the subject of the email
   * @param bodyHtml the HTML body of the email
   * @param attachments any attachments to include in the email
   * @resolves if the email was sent successfully
   * @rejects if the email was not sent successfully
   */
  async sendEmails(
    recipientEmails: string[],
    subject: string,
    bodyHtml: string,
    attachments?: EmailAttachment[],
  ) {
    const mailOptions: Mail.Options = {
      from: process.env.AWS_SES_SENDER_EMAIL,
      to: recipientEmails,
      subject: subject,
      html: bodyHtml,
    };

    if (attachments) {
      mailOptions.attachments = attachments.map((a) => ({
        filename: a.filename,
        content: a.content,
        encoding: 'base64',
      }));
    }

    const messageData = await new MailComposer(mailOptions).compile().build();

    const command = new SendEmailCommand({
      Content: {
        Raw: {
          Data: messageData,
        },
      },
    });

    return await this.client.send(command);
  }
}
