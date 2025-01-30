import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class AWSS3Service {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: 'us-east-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async upload(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    // Ensure files are iterable and properly formatted
    if (!Array.isArray(files)) {
      throw new Error('Files must be an array');
    }

    const uploadedPhotoUrls: string[] = [];

    for (const file of files) {
      try {
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: file.originalname,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(params);
        await this.client.send(command);

        // Manually constructing the file URL
        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${params.Key}`;
        uploadedPhotoUrls.push(fileUrl);
      } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw new Error('File upload to AWS failed');
      }
    }

    return uploadedPhotoUrls;
  }
}
