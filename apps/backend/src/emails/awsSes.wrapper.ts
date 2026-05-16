import { Inject, Injectable } from '@nestjs/common';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import MailComposer from 'nodemailer/lib/mail-composer';
import * as dotenv from 'dotenv';
import Mail from 'nodemailer/lib/mailer';
import { AMAZON_SES_CLIENT } from './awsSesClient.factory';
import { SendEmailDTO } from './dto/send-email.dto';
dotenv.config();

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
   * @param email the {@link SendEmailDTO} describing the message to send
   * @resolves if the email was sent successfully
   * @rejects if the email was not sent successfully
   */
  async sendEmails(email: SendEmailDTO) {
    const { toEmail, subject, bodyHtml, ccEmails, bccEmails, attachments } =
      email;

    const mailOptions: Mail.Options = {
      from: process.env.AWS_SES_SENDER_EMAIL,
      to: toEmail,
      subject: subject,
      html: bodyHtml,
    };

    if (ccEmails && ccEmails.length > 0) {
      mailOptions.cc = ccEmails;
    }

    if (bccEmails && bccEmails.length > 0) {
      mailOptions.bcc = bccEmails;
    }

    if (attachments) {
      mailOptions.attachments = attachments.map((a) => ({
        filename: a.filename,
        content: a.content,
        encoding: 'base64',
      }));
    }

    const messageData = await new MailComposer(mailOptions).compile().build();

    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [toEmail],
        CcAddresses: ccEmails,
        BccAddresses: bccEmails,
      },
      Content: {
        Raw: {
          Data: messageData,
        },
      },
    });

    return this.client.send(command);
  }
}
