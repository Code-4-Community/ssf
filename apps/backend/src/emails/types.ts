import {
  IsString,
  IsOptional,
  IsNotEmpty,
  Max,
  MaxLength,
} from 'class-validator';
import { EmailAttachment } from './awsSes.wrapper';

export class SendEmailDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  toEmail: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject: string;

  @IsString()
  @IsNotEmpty()
  bodyHtml: string;

  @IsOptional()
  attachments?: EmailAttachment[];
}
