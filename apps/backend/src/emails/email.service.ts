import { Injectable, Logger } from '@nestjs/common';
import Bottleneck from 'bottleneck';
import { AmazonSESWrapper, SendEmailOptions } from './awsSes.wrapper';

@Injectable()
export class EmailsService {
  private readonly EMAILS_SENT_PER_SECOND = 14;
  private readonly logger = new Logger(EmailsService.name);
  private readonly limiter: Bottleneck;

  constructor(private amazonSESWrapper: AmazonSESWrapper) {
    this.limiter = new Bottleneck({
      minTime: Math.ceil(1000 / this.EMAILS_SENT_PER_SECOND),
      maxConcurrent: 1,
    });
  }

  /**
   * Sends an email.
   *
   * @param recipientEmail the email address of the primary recipient
   * @param subject the subject of the email
   * @param bodyHtml the HTML body of the email
   * @param options optional cc/bcc recipients and attachments
   * @resolves if the email was sent successfully
   * @rejects if the email was not sent successfully
   */
  public async sendEmails(
    recipientEmail: string,
    subject: string,
    bodyHTML: string,
    options: SendEmailOptions = {},
  ): Promise<unknown> {
    if (
      process.env.SEND_AUTOMATED_EMAILS &&
      process.env.SEND_AUTOMATED_EMAILS === 'true' &&
      recipientEmail
    ) {
      return this.amazonSESWrapper.sendEmails(
        recipientEmail,
        subject,
        bodyHTML,
        options,
      );
    }
    this.logger.warn('Automated emails are disabled. Email not sent.');
    return Promise.resolve();
  }
}
