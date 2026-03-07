import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEmail,
  IsArray,
  Length,
} from 'class-validator';
import { EmailAttachment } from '../awsSes.wrapper';

export class SendEmailDTO {
  @IsArray()
  @IsEmail({}, { each: true })
  @Length(1, 255, { each: true })
  toEmails!: string[];

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  subject!: string;

  @IsString()
  @IsNotEmpty()
  bodyHtml!: string;

  @IsArray()
  @IsOptional()
  attachments?: EmailAttachment[];
}
