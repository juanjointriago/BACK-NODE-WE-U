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
exports.getFileURLS3 = exports.downloadFileS3 = exports.getFileS3 = exports.getListFilesS3 = exports.uploadFileS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const config_1 = require("../config/config");
const fs_1 = __importDefault(require("fs"));
const client = new client_s3_1.S3Client({
    region: config_1.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: config_1.AWS_PUBLIC_KEY,
        secretAccessKey: config_1.AWS_SECRET_KEY,
    },
});
const uploadFileS3 = (file, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stream = fs_1.default.createReadStream(file.tempFilePath);
        const upladParams = {
            Bucket: config_1.AWS_BUCKET_NAME,
            Key: fileName,
            Body: stream,
            ContentType: file.mimetype,
        };
        const command = new client_s3_1.PutObjectCommand(upladParams);
        return yield client.send(command);
    }
    catch (error) {
        throw new Error('' + error);
    }
});
exports.uploadFileS3 = uploadFileS3;
const getListFilesS3 = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const command = new client_s3_1.ListObjectsCommand({
            Bucket: config_1.AWS_BUCKET_NAME,
        });
        return yield client.send(command);
    }
    catch (error) {
        throw new Error('' + error);
    }
});
exports.getListFilesS3 = getListFilesS3;
const getFileS3 = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: config_1.AWS_BUCKET_NAME,
            Key: fileName,
        });
        return yield client.send(command);
    }
    catch (error) {
        throw new Error('' + error);
    }
});
exports.getFileS3 = getFileS3;
const downloadFileS3 = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: config_1.AWS_BUCKET_NAME,
            Key: fileName,
        });
        const result = yield client.send(command);
        // fs.createWriteStream('./images', result.Body);
    }
    catch (error) {
        throw new Error('' + error);
    }
});
exports.downloadFileS3 = downloadFileS3;
const getFileURLS3 = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: config_1.AWS_BUCKET_NAME,
            Key: fileName,
        });
        return yield (0, s3_request_presigner_1.getSignedUrl)(client, command, { expiresIn: 3600 });
    }
    catch (error) {
        console.error('' + error);
    }
});
exports.getFileURLS3 = getFileURLS3;
//# sourceMappingURL=s3.js.map