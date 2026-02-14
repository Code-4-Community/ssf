import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsEmail,
  IsArray,
} from 'class-validator';
import { EmailAttachment } from './awsSes.wrapper';

export class SendEmailDTO {
  @IsArray()
  @IsEmail({}, { each: true })
  @MaxLength(255, { each: true })
  toEmails!: string[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject!: string;

  @IsString()
  @IsNotEmpty()
  bodyHtml!: string;

  @IsArray()
  @IsOptional()
  attachments?: EmailAttachment[];
}
