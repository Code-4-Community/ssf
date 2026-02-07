import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class AWSS3Service {
  private client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-2';
    this.bucket = this.validateEnv('AWS_BUCKET_NAME');
    if (!this.bucket) {
      throw new Error('AWS_BUCKET_NAME is not defined');
    }
    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.validateEnv('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.validateEnv('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  validateEnv(name: string): string {
    const v = process.env[name];
  
    if (!v) {
      throw new InternalServerErrorException(`Missing env var: ${name}`);
    }
  
    return v;
  }

  async upload(files: Express.Multer.File[]): Promise<string[]> {
    const uploadedFileUrls: string[] = [];
    try {
      for (const file of files) {
        const fileName = file.originalname;

        const command = new PutObjectCommand({
          Bucket: this.bucket,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype || 'application/octet-stream',
        });

        await this.client.send(command);

        const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileName}`;
        uploadedFileUrls.push(url);
      }
      return uploadedFileUrls;
    } catch (error) {
      console.error('Detailed AWS upload error:', error);
      throw new Error('File upload to AWS failed');
    }
  }
}
