import { S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AWS_BUCKET_REGION, AWS_PUBLIC_KEY, AWS_SECRET_KEY, AWS_BUCKET_NAME } from '../config/config';
import fs from 'fs';

const client = new S3Client({
  region: AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: AWS_PUBLIC_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

export const uploadFileS3 = async (file: any, fileName: string) => {
  try {
    const stream = fs.createReadStream(file.tempFilePath);

    const upladParams = {
      Bucket: AWS_BUCKET_NAME,
      Key: fileName,
      Body: stream,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(upladParams);

    return await client.send(command);
  } catch (error) {
    throw new Error('' + error);
  }
};

export const getListFilesS3 = async () => {
  try {
    const command = new ListObjectsCommand({
      Bucket: AWS_BUCKET_NAME,
    });

    return await client.send(command);
  } catch (error) {
    throw new Error('' + error);
  }
};

export const getFileS3 = async (fileName: string) => {
  try {
    const command = new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: fileName,
    });

    return await client.send(command);
  } catch (error) {
    throw new Error('' + error);
  }
};

export const downloadFileS3 = async (fileName: string) => {
  try {
    const command = new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: fileName,
    });

    const result = await client.send(command);

    // fs.createWriteStream('./images', result.Body);
  } catch (error) {
    throw new Error('' + error);
  }
};

export const getFileURLS3 = async (fileName: string) => {
  try {
    const command = new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: fileName,
    });

    return await getSignedUrl(client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error('' + error);
  }
};
