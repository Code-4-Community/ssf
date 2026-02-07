import { Provider } from '@nestjs/common';
import { SESClient } from '@aws-sdk/client-ses';
import { assert } from 'console';
import * as dotenv from 'dotenv';
dotenv.config();

export const AMAZON_SES_CLIENT = 'AMAZON_SES_CLIENT';

/**
 * Factory that produces a new instance of the Amazon SES client.
 * Used to send emails via Amazon SES and actually set it up with credentials.
 */
export const AmazonSESClientFactory: Provider<SESClient> = {
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

    return new SESClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  },
};