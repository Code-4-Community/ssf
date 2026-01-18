import { Inject, Injectable } from '@nestjs/common';
import { SES as AmazonSESClient } from 'aws-sdk';
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
  private client: AmazonSESClient;

  /**
   * @param client injected from `amazon-ses-client.factory.ts`
   * builds our Amazon SES client with credentials from environment variables
   */
  constructor(@Inject(AMAZON_SES_CLIENT) client: AmazonSESClient) {
    this.client = client;
  }

  /**
   * Sends an email via Amazon SES.
   *
   * @param recipientEmails the email addresses of the recipients
   * @param subject the subject of the email
   * @param bodyHtml the HTML body of the email
   * @param attachments any base64 encoded attachments to inlude in the email
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

    const params: AmazonSESClient.SendRawEmailRequest = {
      Destinations: recipientEmails,
      Source: process.env.AWS_SES_SENDER_EMAIL,
      RawMessage: { Data: messageData },
    };

    return await this.client.sendRawEmail(params).promise();
  }
}
