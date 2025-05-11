import { Storage } from '@google-cloud/storage';
import { BUCKET_NAME, KEYFILENAME, PROJECT_ID } from '../config/config';
import fs from 'node:fs';

const bucket = new Storage({
  projectId: PROJECT_ID,
  keyFilename: KEYFILENAME,
}).bucket(BUCKET_NAME);

/**
 * Uploads a file to Google Cloud Storage (GCS).
 *
 * @param {any} file - The file to upload.
 * @param {string} fileName - The desired name of the file in GCS.
 * @param {string} [folder] - The folder in GCS where the file should be stored.
 * @returns {Promise<any>} - A promise that resolves when the file is uploaded successfully.
 */
async function uploadFileGCS(file: any, fileName: string, folder?: string): Promise<any> {
  // Get the real path of the file
  const data = fs.realpathSync(file.tempFilePath);

  // Split the file name by dot to get the extension
  const nameCut = file.name.split('.');
  const extension = nameCut[nameCut.length - 1];

  // Upload the file to GCS
  return await bucket.upload(data, {
    destination: `${folder ? `${folder}/` : ''}${fileName}.${extension}`,
  });
}

/**
 * Deletes a file from Google Cloud Storage.
 * @param fileName - The name of the file to be deleted.
 * @param folder - (Optional) The folder where the file is located.
 */
async function deleteFileGCS(fileName: string, folder?: string) {
  // Construct the file path
  const filePath = `${folder ? `${folder}/` : ''}${fileName}`;

  // Delete the file with generation match check
  return await bucket.file(filePath).delete({ ifGenerationMatch: 0 });
}

/**
 * Downloads a file from Google Cloud Storage (GCS).
 *
 * @param fileName - The name of the file to download.
 * @param folder - The optional folder in GCS where the file is located.
 * @returns A promise that resolves to the downloaded file.
 */
async function downloadFileGCS(fileName: string, folder?: string) {
  // Construct the path to the file in GCS
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  // Download the file from GCS
  return await bucket.file(filePath).download();
}

/**
 * Generates a signed URL for reading a file in a Google Cloud Storage bucket.
 * @param fileName - The name of the file to generate the signed URL for.
 * @param folder - The optional folder in the bucket where the file is located.
 * @returns The signed URL for reading the file.
 */
async function generateSignedUrlGCS(fileName: string, folder?: string) {
  // Generate a signed URL with temporary read access to the file
  const [url] = await bucket.file(`${folder ? `${folder}/` : ''}${fileName}`).getSignedUrl({
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000, // 60 minutes
  });

  return url;
}

/**
 * Gets a list of file names in a Google Cloud Storage bucket folder.
 *
 * @param folder - The name of the folder to get the list of files from.
 * @returns A promise that resolves to a list of file names in the folder.
 */
async function getFilesNameFromFolder(folder: string): Promise<(string | undefined)[]> {
  // Get a list of files from the specified folder in the bucket
  const [files] = await bucket.getFiles({ prefix: folder });

  // Map the list of files to just the file names (e.g. remove the folder path)
  return files.map((file) => file.metadata.name && file.metadata.name.split('/').pop());
}

export { uploadFileGCS, deleteFileGCS, downloadFileGCS, generateSignedUrlGCS, getFilesNameFromFolder };
