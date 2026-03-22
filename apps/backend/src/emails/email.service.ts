import { Injectable, Logger } from '@nestjs/common';
import Bottleneck from 'bottleneck';
import { AmazonSESWrapper, EmailAttachment } from './awsSes.wrapper';

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
   * @param recipientEmail the email address of the recipients
   * @param subject the subject of the email
   * @param bodyHtml the HTML body of the email
   * @param attachments any base64 encoded attachments to include in the email
   * @resolves if the email was sent successfully
   * @rejects if the email was not sent successfully
   */
  public async sendEmails(
    recipientEmails: string[],
    subject: string,
    bodyHTML: string,
    attachments?: EmailAttachment[],
  ): Promise<unknown> {
    if (
      process.env.SEND_AUTOMATED_EMAILS &&
      process.env.SEND_AUTOMATED_EMAILS === 'true' &&
      recipientEmails.length > 0
    ) {
      return this.amazonSESWrapper.sendEmails(
        recipientEmails,
        subject,
        bodyHTML,
        attachments,
      );
    }
    this.logger.warn('Automated emails are disabled. Email not sent.');
    return Promise.resolve();
  }
}
