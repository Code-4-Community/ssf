import { Provider } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { assert } from 'console';
import * as dotenv from 'dotenv';
dotenv.config();

export const AMAZON_SES_CLIENT = 'AMAZON_SES_CLIENT';

/**
 * Factory that produces a new instance of the Amazon SES client.
 * Used to send emails via Amazon SES and actually set it up with credentials.
 */
export const AmazonSESClientFactory: Provider<AWS.SES> = {
  provide: AMAZON_SES_CLIENT,
  useFactory: () => {
    assert(
      process.env.AWS_SES_ACCESS_KEY_ID !== undefined,
      'AWS_SES_ACCESS_KEY_ID is not defined',
    );
    assert(
      process.env.AWS_SES_SECRET_ACCESS_KEY !== undefined,
      'AWS_SES_SECRET_ACCESS_KEY is not defined',
    );
    assert(
      process.env.AWS_SES_REGION !== undefined,
      'AWS_SES_REGION is not defined',
    );

    const SES_CONFIG: AWS.SES.ClientConfiguration = {
      accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
      region: process.env.AWS_SES_REGION,
    };

    return new AWS.SES(SES_CONFIG);
  },
};
