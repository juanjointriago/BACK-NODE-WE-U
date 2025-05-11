import fs from 'fs';
import { Request, Response } from 'express';
import { uploadFile } from '../helpers/upload-file';
import path from 'path';
import { customResponse, badResponse } from '../helpers/customResponses';
import { getFileURLS3, uploadFileS3 } from '../helpers/s3';
import { generateFileName } from '../helpers/utils';
import { generateSignedUrlGCS, uploadFileGCS } from '../helpers/gc-storage';

/**
 * Carga un archivo al servidor y devuelve la URL del archivo cargado
 * @param {Request} req - Solicitud: El objeto de la solicitud.
 * @param {Response} res - El objeto de respuesta.
 * @returns La url del archivo subido
 */
export const uploadFiles = async (req: Request, res: Response) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
      return customResponse(false, res, 400, 'No hay archivos que subir', null);
    }

    const { folder } = req.params;
    const { urldelete } = req.body;

    if (urldelete) {
      const [, , , , location, filedelete] = urldelete.split('/', urldelete.length);
      const pathfile = path.join(__dirname, '../public/uploads/', location, '/', filedelete);
      if (fs.existsSync(pathfile)) {
        fs.unlinkSync(pathfile);
      }
    }

    const fileUpload = (await uploadFile(req.files, folder)) + '';
    const url = `${process.env.HOSTNAME}/uploads/${folder}/${fileUpload}`;
    res.json({ url });
  } catch (error) {
    res.status(401).json({ error });
  }
};

export const uploadFilesAWSS3 = async (req: Request, res: Response) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
      return customResponse(false, res, 400, 'No hay archivos que subir', null);
    }
    const file: any = req.files.file;
    const imageName = generateFileName();
    await uploadFileS3(file, imageName);

    const result = await getFileURLS3(imageName);

    customResponse(true, res, 200, 'files', result);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

/**
 * Uploads files to Google Cloud Storage.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */
export const uploadFilesGCS = async (req: Request, res: Response): Promise<void> => {
  const { folder } = req.params;

  // Check if there are no files or if the 'file' property is missing
  if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
    return customResponse(false, res, 400, 'No hay archivos que subir', null);
  }

  const file: any = req.files.file;
  const nameCut = file.name.split('.');
  const extension = nameCut[nameCut.length - 1];
  const imageName = generateFileName();

  // Upload the file to Google Cloud Storage
  await uploadFileGCS(file, imageName, folder);

  // Generate a signed URL for the uploaded file
  const url = await generateSignedUrlGCS(`${imageName}.${extension}`, folder);

  // Send a custom response with the uploaded URL
  customResponse(true, res, 200, 'Subido exitosamente', url);
};
