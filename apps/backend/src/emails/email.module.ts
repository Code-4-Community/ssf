import { Module } from '@nestjs/common';
import { EmailsService } from './email.service';
import { AmazonSESWrapper } from './awsSes.wrapper';
import { AmazonSESClientFactory } from './awsSesClient.factory';

@Module({
  providers: [AmazonSESWrapper, AmazonSESClientFactory, EmailsService],
  exports: [EmailsService],
})
export class EmailsModule {}
