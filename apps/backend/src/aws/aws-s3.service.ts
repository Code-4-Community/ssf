import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AWSS3Service {
  private client: S3;

  constructor() {
    this.client = new S3({
      region: 'us-east-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async upload(files: string[]): Promise<string[]> {
    const uploadedFileUrls: string[] = [];
    try {
      for (const file of files) {
        const fileName = `${uuidv4()}-${file}`;
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileName,
          Body: Buffer.from(''),
        };
        const uploadResponse = await this.client.upload(params).promise();
        const url = uploadResponse.Location;
        uploadedFileUrls.push(url);
      }
      return uploadedFileUrls;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error('File upload to AWS failed');
    }
  }
}
