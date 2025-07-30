import * as fs from 'fs';
import { bucket } from '../config/firebase';

export async function uploadFileFirebase(file: any, fileName: string, folder?: string): Promise<string> {
  try {
    const filePath = fs.realpathSync(file.tempFilePath);
    const extension = file.name.split('.').pop();
    const destination = `${folder ? folder + '/' : ''}${fileName}.${extension}`;

    const [uploadedFile] = await bucket.upload(filePath, {
      destination,
      public: true,
      metadata: {
        contentType: file.mimetype,
      },
    });

    return `https://storage.googleapis.com/${bucket.name}/${destination}`;
  } catch (error: any) {
    console.error('Error al subir a Firebase:', {
      message: error.message,
      code: error.code,
      errors: error.errors,
      stack: error.stack,
      response: error.response?.data,
    });

    throw new Error(`Error al subir archivo a Firebase: ${error.message}`);
  }
}
