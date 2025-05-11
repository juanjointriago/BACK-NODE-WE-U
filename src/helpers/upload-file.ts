import { UploadedFile } from 'express-fileupload';
import path from 'path';
import { v4 as uudiv4 } from 'uuid';

const VALID_FILE_EXTENSION = ['png', 'jpg', 'jpeg', 'gif'];

/**
 * Toma un archivo, valida su extensión y luego lo mueve a una nueva ubicación
 * @param {any} files - El objeto de archivos que se envió al servidor.
 * @param {string} [carpeta] - La carpeta donde desea guardar el archivo.
 * @param {string[]} extencionesvalida - Una matriz de extensiones de archivo válidas.
 * @returns Una promesa que se resuelve en el nombre del archivo.
 */
export const uploadFile = (files: any, carpeta: string = '', extencionesvalida: string[] = ['png', 'jpg', 'jpeg', 'gif']) => {
  //console.log('req.files >>>', req.files); // eslint-disable-line
  return new Promise((resolve, reject) => {
    const { file } = files;
    const nombreCortado = file.name.split('.');
    const extension = nombreCortado[nombreCortado.length - 1];

    //validar la extencion
    if (!extencionesvalida.includes(extension)) {
      return reject(`no include this extention ${extencionesvalida}`);
    }

    const nombreTemp = uudiv4() + '.' + extension;
    const uploadPath = path.join(__dirname, '../public/uploads/', carpeta, nombreTemp);

    file.mv(uploadPath, (err: any) => {
      if (err) {
        return reject(err);
      }
      resolve(nombreTemp);
    });
  });
};

export const validExtension = (file: any) => {
  const nameCut = file.name.split('.');
  const extension = nameCut[nameCut.length - 1];

  //validar la extencion
  if (!VALID_FILE_EXTENSION.includes(extension)) {
    return true;
  }
};

export const getExtension = (file: any) => {
  const nameCut = file.name.split('.');
  const extension = nameCut[nameCut.length - 1];
  return extension;
};
