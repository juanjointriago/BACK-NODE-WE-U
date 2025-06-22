import * as fs from 'fs';
import { bucket } from '../config/firebase';

export async function uploadFileFirebase(file: any, fileName: string, folder?: string): Promise<string> {
  const filePath = fs.realpathSync(file.tempFilePath);
  const extension = file.name.split('.').pop();
  const destination = `${folder ? folder + '/' : ''}${fileName}.${extension}`;

  await bucket.upload(filePath, {
    destination,
    public: true,
    metadata: {
      contentType: file.mimetype,
    },
  });
  return `https://storage.googleapis.com/${bucket.name}/${destination}`;
}
