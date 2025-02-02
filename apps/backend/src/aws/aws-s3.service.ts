// import { Injectable } from '@nestjs/common';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { Multer } from 'multer';

// @Injectable()
// export class AWSS3Service {
//   private client: S3Client;

//   constructor() {
//     this.client = new S3Client({
//       region: 'us-east-2',
//       credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//       },
//     });
//   }

//   async upload(files: Express.Multer.File[]): Promise<string[]> {
//     if (!files || files.length === 0) {
//       throw new Error('No files provided');
//     }

//     // Ensure files are iterable and properly formatted
//     if (!Array.isArray(files)) {
//       throw new Error('Files must be an array');
//     }

//     const uploadedPhotoUrls: string[] = [];

//     for (const file of files) {
//       try {
//         const params = {
//           Bucket: process.env.AWS_BUCKET_NAME,
//           Key: file.originalname,
//           Body: file.buffer,
//           ContentType: file.mimetype,
//         };

//         const command = new PutObjectCommand(params);
//         await this.client.send(command);

//         // Manually constructing the file URL
//         const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${params.Key}`;
//         uploadedPhotoUrls.push(fileUrl);
//       } catch (error) {
//         console.error('Error uploading file to S3:', error);
//         throw new Error('File upload to AWS failed');
//       }
//     }

//     return uploadedPhotoUrls;
//   }
// }

import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class AWSS3Service {
  private client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor() {
    // Use your AWS_REGION or default to 'us-east-2'
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
      Logger.error('Error uploading files:', error);
      throw new Error('File upload to AWS failed');
    }
  }
}
