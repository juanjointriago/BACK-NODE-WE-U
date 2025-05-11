"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtension = exports.validExtension = exports.uploadFile = void 0;
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const VALID_FILE_EXTENSION = ['png', 'jpg', 'jpeg', 'gif'];
/**
 * Toma un archivo, valida su extensión y luego lo mueve a una nueva ubicación
 * @param {any} files - El objeto de archivos que se envió al servidor.
 * @param {string} [carpeta] - La carpeta donde desea guardar el archivo.
 * @param {string[]} extencionesvalida - Una matriz de extensiones de archivo válidas.
 * @returns Una promesa que se resuelve en el nombre del archivo.
 */
const uploadFile = (files, carpeta = '', extencionesvalida = ['png', 'jpg', 'jpeg', 'gif']) => {
    //console.log('req.files >>>', req.files); // eslint-disable-line
    return new Promise((resolve, reject) => {
        const { file } = files;
        const nombreCortado = file.name.split('.');
        const extension = nombreCortado[nombreCortado.length - 1];
        //validar la extencion
        if (!extencionesvalida.includes(extension)) {
            return reject(`no include this extention ${extencionesvalida}`);
        }
        const nombreTemp = (0, uuid_1.v4)() + '.' + extension;
        const uploadPath = path_1.default.join(__dirname, '../public/uploads/', carpeta, nombreTemp);
        file.mv(uploadPath, (err) => {
            if (err) {
                return reject(err);
            }
            resolve(nombreTemp);
        });
    });
};
exports.uploadFile = uploadFile;
const validExtension = (file) => {
    const nameCut = file.name.split('.');
    const extension = nameCut[nameCut.length - 1];
    //validar la extencion
    if (!VALID_FILE_EXTENSION.includes(extension)) {
        return true;
    }
};
exports.validExtension = validExtension;
const getExtension = (file) => {
    const nameCut = file.name.split('.');
    const extension = nameCut[nameCut.length - 1];
    return extension;
};
exports.getExtension = getExtension;
//# sourceMappingURL=upload-file.js.map