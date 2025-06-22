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
exports.uploadFileGCS = uploadFileGCS;
exports.deleteFileGCS = deleteFileGCS;
exports.downloadFileGCS = downloadFileGCS;
exports.generateSignedUrlGCS = generateSignedUrlGCS;
exports.getFilesNameFromFolder = getFilesNameFromFolder;
const storage_1 = require("@google-cloud/storage");
const config_1 = require("../config/config");
const node_fs_1 = __importDefault(require("node:fs"));
const bucket = new storage_1.Storage({
    projectId: config_1.PROJECT_ID,
    keyFilename: config_1.KEYFILENAME,
}).bucket(config_1.BUCKET_NAME);
/**
 * Uploads a file to Google Cloud Storage (GCS).
 *
 * @param {any} file - The file to upload.
 * @param {string} fileName - The desired name of the file in GCS.
 * @param {string} [folder] - The folder in GCS where the file should be stored.
 * @returns {Promise<any>} - A promise that resolves when the file is uploaded successfully.
 */
function uploadFileGCS(file, fileName, folder) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the real path of the file
        const data = node_fs_1.default.realpathSync(file.tempFilePath);
        // Split the file name by dot to get the extension
        const nameCut = file.name.split('.');
        const extension = nameCut[nameCut.length - 1];
        // Upload the file to GCS
        return yield bucket.upload(data, {
            destination: `${folder ? `${folder}/` : ''}${fileName}.${extension}`,
        });
    });
}
/**
 * Deletes a file from Google Cloud Storage.
 * @param fileName - The name of the file to be deleted.
 * @param folder - (Optional) The folder where the file is located.
 */
function deleteFileGCS(fileName, folder) {
    return __awaiter(this, void 0, void 0, function* () {
        // Construct the file path
        const filePath = `${folder ? `${folder}/` : ''}${fileName}`;
        // Delete the file with generation match check
        return yield bucket.file(filePath).delete({ ifGenerationMatch: 0 });
    });
}
/**
 * Downloads a file from Google Cloud Storage (GCS).
 *
 * @param fileName - The name of the file to download.
 * @param folder - The optional folder in GCS where the file is located.
 * @returns A promise that resolves to the downloaded file.
 */
function downloadFileGCS(fileName, folder) {
    return __awaiter(this, void 0, void 0, function* () {
        // Construct the path to the file in GCS
        const filePath = folder ? `${folder}/${fileName}` : fileName;
        // Download the file from GCS
        return yield bucket.file(filePath).download();
    });
}
/**
 * Generates a signed URL for reading a file in a Google Cloud Storage bucket.
 * @param fileName - The name of the file to generate the signed URL for.
 * @param folder - The optional folder in the bucket where the file is located.
 * @returns The signed URL for reading the file.
 */
function generateSignedUrlGCS(fileName, folder) {
    return __awaiter(this, void 0, void 0, function* () {
        // Generate a signed URL with temporary read access to the file
        const [url] = yield bucket.file(`${folder ? `${folder}/` : ''}${fileName}`).getSignedUrl({
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000, // 60 minutes
        });
        return url;
    });
}
/**
 * Gets a list of file names in a Google Cloud Storage bucket folder.
 *
 * @param folder - The name of the folder to get the list of files from.
 * @returns A promise that resolves to a list of file names in the folder.
 */
function getFilesNameFromFolder(folder) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get a list of files from the specified folder in the bucket
        const [files] = yield bucket.getFiles({ prefix: folder });
        // Map the list of files to just the file names (e.g. remove the folder path)
        return files.map((file) => file.metadata.name && file.metadata.name.split('/').pop());
    });
}
//# sourceMappingURL=gc-storage.js.map