import crypto from 'crypto';
import { IPhotosUser } from '../interfaces/auth.interfaces';
import { uploadFileGCS } from './gc-storage';

/**
 * Toma una cadena como argumento y devuelve un booleano
 * @param {string} language - El idioma al que desea traducir.
 * @returns Un valor booleano
 */
export const verifylanguages = (language: string): boolean => {
  switch (language) {
    case 'en':
      return true;
    case 'esp':
      return true;

    default:
      return false;
  }
};

/**
 * Toma un número y devuelve una cadena.
 * @param {number} idPayment - número
 * @param {boolean} [en] - booleano
 * @returns Una cuerda
 */
export const getNameTypePayment = (idPayment: number, en?: boolean): string => {
  switch (idPayment) {
    case 1:
      return !en ? 'Efectivo' : 'Cash';
    case 2:
      return !en ? 'Transferencia' : 'Transfer';
    case 3:
      return !en ? 'Tarjeto de crédito' : 'Credit Card';
    case 4:
      return !en ? 'Diferido' : 'Deferred';

    default:
      return '-';
  }
};

/**
 * Toma un número y devuelve una cadena.
 * @param {number} idTypeService - número
 * @returns Una cuerda
 */
export const getNameTyService = (idTypeService: number): string => {
  switch (idTypeService) {
    case 1:
      return 'Delivery';
    case 2:
      return 'Transporte';
    case 3:
      return 'Tour';

    default:
      return '-';
  }
};

/**
 * Toma un número y devuelve el nombre del mes.
 * @param {number} month - número
 * @returns el nombre del mes
 */
export const getMonthName = (month: number) => {
  const meses = [
    { id: 1, mes: 'Enero' },
    { id: 2, mes: 'Febrero' },
    { id: 3, mes: 'Marzo' },
    { id: 4, mes: 'Abril' },
    { id: 5, mes: 'Mayo' },
    { id: 6, mes: 'Junio' },
    { id: 7, mes: 'Julio' },
    { id: 8, mes: 'Agosto' },
    { id: 9, mes: 'Septiembre' },
    { id: 10, mes: 'Octubre' },
    { id: 11, mes: 'Noviembre' },
    { id: 12, mes: 'Diciembre' },
  ];

  const mes = meses.find((item) => item.id === month);
  return mes?.mes || '';
};

export const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

/**
 * Saves the photos of a user to an S3 bucket.
 * @param identification - The identification of the user.
 * @param photo_home - The home photo of the user.
 * @param photo_id_back - The ID back photo of the user.
 * @param photo_id_front - The ID front photo of the user.
 * @param photo_profile - The profile photo of the user.
 * @param photo_ticket - The ticket photo of the user.
 */
export const savePhotosCreateUser = async ({ identification, photo_home, photo_id_back, photo_id_front, photo_profile, photo_ticket }: IPhotosUser) => {
  // Upload the home photo if it exists
  photo_home && (await uploadFileGCS(photo_home, `photo_home_${identification}`, 'users'));

  // Upload the ID back photo if it exists
  photo_id_back && (await uploadFileGCS(photo_id_back, `photo_id_back_${identification}`, 'users'));

  // Upload the ID front photo if it exists
  photo_id_front && (await uploadFileGCS(photo_id_front, `photo_id_front_${identification}`, 'users'));

  // Upload the profile photo if it exists
  photo_profile && (await uploadFileGCS(photo_profile, `photo_profile_${identification}`, 'users'));

  // Upload the ticket photo if it exists
  photo_ticket && (await uploadFileGCS(photo_ticket, `photo_ticket_${identification}`, 'users'));
};

/**
 * Generates a random code consisting of four digits.
 *
 * @return {string} The generated code.
 */
export const generatorCode = (): string => {
  const min = Math.ceil(0);
  const max = Math.floor(9);

  let resp: string = '';

  let code: Number[] = [];

  for (let i = 0; i < 6; i++) {
    code[i] = Math.floor(Math.random() * (1 + max - min) + min);
  }
  resp = `${code[0]}${code[1]}${code[2]}${code[3]}${code[4]}${code[5]}`;
  return resp;
};

/**
 * Generates a serial number by incrementing the given serial number or starting from 0.
 * Serial number format: # followed by 9 digits.
 *
 * @param serialNumber - The current serial number.
 * @returns The generated serial number.
 * @throws An error if the serial number does not match the expected format.
 */
export const generateSerialNumber = (serialNumber: string): string | null => {
  // If no serial number is provided, start from 0.
  if (!serialNumber) {
    const num = 0;
    const nextNum = num + 1;
    const serialNum = `#${String(nextNum).padStart(9, '0')}`;
    return serialNum;
  }

  const regex = /^#(\d{9})$/;
  const match = serialNumber.match(regex);

  if (match) {
    const num = parseInt(match[1], 10);
    const nextNum = num + 1;
    const serialNum = `#${String(nextNum).padStart(9, '0')}`;
    return serialNum;
  } else {
    console.error('The serial number does not match the expected format.');
    return null;
  }
};

/**
 * Given a filename, determines the folder where the photo should be stored.
 * If the filename is longer than 15 characters, it will be stored in the 'users' folder,
 * otherwise it will be stored in the 'avatars' folder.
 * @param nameFile - The filename of the photo.
 * @returns The folder name where the photo should be stored.
 */
export const getFolderUserPhotoProfile = (nameFile: string) => 
  (!nameFile || nameFile.length > 15 ? 'users' : 'avatars');
