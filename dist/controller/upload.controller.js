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
exports.uploadFilesGCS = exports.uploadFilesAWSS3 = exports.uploadFiles = void 0;
const fs_1 = __importDefault(require("fs"));
const upload_file_1 = require("../helpers/upload-file");
const path_1 = __importDefault(require("path"));
const customResponses_1 = require("../helpers/customResponses");
const s3_1 = require("../helpers/s3");
const utils_1 = require("../helpers/utils");
const gc_storage_1 = require("../helpers/gc-storage");
/**
 * Carga un archivo al servidor y devuelve la URL del archivo cargado
 * @param {Request} req - Solicitud: El objeto de la solicitud.
 * @param {Response} res - El objeto de respuesta.
 * @returns La url del archivo subido
 */
const uploadFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
            return (0, customResponses_1.customResponse)(false, res, 400, 'No hay archivos que subir', null);
        }
        const { folder } = req.params;
        const { urldelete } = req.body;
        if (urldelete) {
            const [, , , , location, filedelete] = urldelete.split('/', urldelete.length);
            const pathfile = path_1.default.join(__dirname, '../public/uploads/', location, '/', filedelete);
            if (fs_1.default.existsSync(pathfile)) {
                fs_1.default.unlinkSync(pathfile);
            }
        }
        const fileUpload = (yield (0, upload_file_1.uploadFile)(req.files, folder)) + '';
        const url = `${process.env.HOSTNAME}/uploads/${folder}/${fileUpload}`;
        res.json({ url });
    }
    catch (error) {
        res.status(401).json({ error });
    }
});
exports.uploadFiles = uploadFiles;
const uploadFilesAWSS3 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
            return (0, customResponses_1.customResponse)(false, res, 400, 'No hay archivos que subir', null);
        }
        const file = req.files.file;
        const imageName = (0, utils_1.generateFileName)();
        yield (0, s3_1.uploadFileS3)(file, imageName);
        const result = yield (0, s3_1.getFileURLS3)(imageName);
        (0, customResponses_1.customResponse)(true, res, 200, 'files', result);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.uploadFilesAWSS3 = uploadFilesAWSS3;
/**
 * Uploads files to Google Cloud Storage.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */
const uploadFilesGCS = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { folder } = req.params;
    // Check if there are no files or if the 'file' property is missing
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
        return (0, customResponses_1.customResponse)(false, res, 400, 'No hay archivos que subir', null);
    }
    const file = req.files.file;
    const nameCut = file.name.split('.');
    const extension = nameCut[nameCut.length - 1];
    const imageName = (0, utils_1.generateFileName)();
    // Upload the file to Google Cloud Storage
    yield (0, gc_storage_1.uploadFileGCS)(file, imageName, folder);
    // Generate a signed URL for the uploaded file
    const url = yield (0, gc_storage_1.generateSignedUrlGCS)(`${imageName}.${extension}`, folder);
    // Send a custom response with the uploaded URL
    (0, customResponses_1.customResponse)(true, res, 200, 'Subido exitosamente', url);
});
exports.uploadFilesGCS = uploadFilesGCS;
//# sourceMappingURL=upload.controller.js.map