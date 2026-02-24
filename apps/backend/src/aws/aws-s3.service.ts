import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class AWSS3Service {
  private client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-2';
    this.bucket = process.env.AWS_BUCKET_NAME;
    if (!this.bucket) {
      throw new Error('AWS_BUCKET_NAME is not defined');
    }
    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
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
