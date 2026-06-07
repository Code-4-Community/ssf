import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEmail,
  IsArray,
  Length,
} from 'class-validator';

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

export class SendEmailDTO {
  @IsEmail()
  @Length(1, 255)
  toEmail!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  subject!: string;

  @IsString()
  @IsNotEmpty()
  bodyHtml!: string;

  @IsArray()
  @IsOptional()
  @IsEmail({}, { each: true })
  @Length(1, 255, { each: true })
  ccEmails?: string[];

  @IsArray()
  @IsOptional()
  @IsEmail({}, { each: true })
  @Length(1, 255, { each: true })
  bccEmails?: string[];

  @IsArray()
  @IsOptional()
  attachments?: EmailAttachment[];
}
