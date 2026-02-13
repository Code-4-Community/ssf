import { Provider } from '@nestjs/common';
import { SESv2Client } from '@aws-sdk/client-sesv2';
import { assert } from 'console';
import * as dotenv from 'dotenv';
dotenv.config();

export const AMAZON_SES_CLIENT = 'AMAZON_SES_CLIENT';

/**
 * Factory that produces a new instance of the Amazon SES v2 client.
 * Used to send emails via Amazon SES and actually set it up with credentials.
 */
export const AmazonSESClientFactory: Provider<SESv2Client> = {
  provide: AMAZON_SES_CLIENT,
  useFactory: () => {
    assert(
      process.env.AWS_ACCESS_KEY_ID !== undefined,
      'AWS_ACCESS_KEY_ID is not defined',
    );
    assert(
      process.env.AWS_SECRET_ACCESS_KEY !== undefined,
      'AWS_SECRET_ACCESS_KEY is not defined',
    );
    assert(process.env.AWS_REGION !== undefined, 'AWS_REGION is not defined');

    return new SESv2Client({ region: process.env.AWS_REGION });
  },
};
