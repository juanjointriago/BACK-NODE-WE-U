"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFolderUserPhotoProfile = exports.generateSerialNumber = exports.generatorCode = exports.savePhotosCreateUser = exports.generateFileName = exports.getMonthName = exports.getNameTyService = exports.getNameTypePayment = exports.verifylanguages = void 0;
const crypto_1 = __importDefault(require("crypto"));
const gc_storage_1 = require("./gc-storage");
/**
 * Toma una cadena como argumento y devuelve un booleano
 * @param {string} language - El idioma al que desea traducir.
 * @returns Un valor booleano
 */
const verifylanguages = (language) => {
    switch (language) {
        case 'en':
            return true;
        case 'esp':
            return true;
        default:
            return false;
    }
};
exports.verifylanguages = verifylanguages;
/**
 * Toma un número y devuelve una cadena.
 * @param {number} idPayment - número
 * @param {boolean} [en] - booleano
 * @returns Una cuerda
 */
const getNameTypePayment = (idPayment, en) => {
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
exports.getNameTypePayment = getNameTypePayment;
/**
 * Toma un número y devuelve una cadena.
 * @param {number} idTypeService - número
 * @returns Una cuerda
 */
const getNameTyService = (idTypeService) => {
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
exports.getNameTyService = getNameTyService;
/**
 * Toma un número y devuelve el nombre del mes.
 * @param {number} month - número
 * @returns el nombre del mes
 */
const getMonthName = (month) => {
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
    return (mes === null || mes === void 0 ? void 0 : mes.mes) || '';
};
exports.getMonthName = getMonthName;
const generateFileName = (bytes = 32) => crypto_1.default.randomBytes(bytes).toString('hex');
exports.generateFileName = generateFileName;
/**
 * Saves the photos of a user to an S3 bucket.
 * @param identification - The identification of the user.
 * @param photo_home - The home photo of the user.
 * @param photo_id_back - The ID back photo of the user.
 * @param photo_id_front - The ID front photo of the user.
 * @param photo_profile - The profile photo of the user.
 * @param photo_ticket - The ticket photo of the user.
 */
const savePhotosCreateUser = (_a) => __awaiter(void 0, [_a], void 0, function* ({ identification, photo_home, photo_id_back, photo_id_front, photo_profile, photo_ticket }) {
    // Upload the home photo if it exists
    photo_home && (yield (0, gc_storage_1.uploadFileGCS)(photo_home, `photo_home_${identification}`, 'users'));
    // Upload the ID back photo if it exists
    photo_id_back && (yield (0, gc_storage_1.uploadFileGCS)(photo_id_back, `photo_id_back_${identification}`, 'users'));
    // Upload the ID front photo if it exists
    photo_id_front && (yield (0, gc_storage_1.uploadFileGCS)(photo_id_front, `photo_id_front_${identification}`, 'users'));
    // Upload the profile photo if it exists
    photo_profile && (yield (0, gc_storage_1.uploadFileGCS)(photo_profile, `photo_profile_${identification}`, 'users'));
    // Upload the ticket photo if it exists
    photo_ticket && (yield (0, gc_storage_1.uploadFileGCS)(photo_ticket, `photo_ticket_${identification}`, 'users'));
});
exports.savePhotosCreateUser = savePhotosCreateUser;
/**
 * Generates a random code consisting of four digits.
 *
 * @return {string} The generated code.
 */
const generatorCode = () => {
    const min = Math.ceil(0);
    const max = Math.floor(9);
    let resp = '';
    let code = [];
    for (let i = 0; i < 6; i++) {
        code[i] = Math.floor(Math.random() * (1 + max - min) + min);
    }
    resp = `${code[0]}${code[1]}${code[2]}${code[3]}${code[4]}${code[5]}`;
    return resp;
};
exports.generatorCode = generatorCode;
/**
 * Generates a serial number by incrementing the given serial number or starting from 0.
 * Serial number format: # followed by 9 digits.
 *
 * @param serialNumber - The current serial number.
 * @returns The generated serial number.
 * @throws An error if the serial number does not match the expected format.
 */
const generateSerialNumber = (serialNumber) => {
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
    }
    else {
        console.error('The serial number does not match the expected format.');
        return null;
    }
};
exports.generateSerialNumber = generateSerialNumber;
/**
 * Given a filename, determines the folder where the photo should be stored.
 * If the filename is longer than 15 characters, it will be stored in the 'users' folder,
 * otherwise it will be stored in the 'avatars' folder.
 * @param nameFile - The filename of the photo.
 * @returns The folder name where the photo should be stored.
 */
const getFolderUserPhotoProfile = (nameFile) => (nameFile.length > 15 ? 'users' : 'avatars');
exports.getFolderUserPhotoProfile = getFolderUserPhotoProfile;
//# sourceMappingURL=utils.js.map