import { Injectable, Logger } from '@nestjs/common';
import Bottleneck from 'bottleneck';
import { AmazonSESWrapper } from './awsSes.wrapper';
import { SendEmailDTO } from './dto/send-email.dto';

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
   * @param email the {@link SendEmailDTO} describing the message to send
   * @resolves if the email was sent successfully
   * @rejects if the email was not sent successfully
   */
  public async sendEmails(email: SendEmailDTO): Promise<unknown> {
    if (!email.toEmail) {
      this.logger.warn(`Skipping email, recipient address is empty.`);
      return Promise.resolve();
    }
    if (process.env.SEND_AUTOMATED_EMAILS !== 'true') {
      this.logger.warn('Automated emails are disabled. Email not sent.');
      return Promise.resolve();
    }
    return this.amazonSESWrapper.sendEmails(email);
  }
}
