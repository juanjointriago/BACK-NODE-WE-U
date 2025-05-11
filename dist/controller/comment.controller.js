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
exports.deleteComment = exports.getCommentsById = exports.getCommentsByIdComplaint = exports.postComment = void 0;
const customResponses_1 = require("../helpers/customResponses");
const comments_model_1 = __importDefault(require("../models/comments.model"));
const complaint_model_1 = __importDefault(require("../models/complaint.model"));
const utils_1 = require("../helpers/utils");
const mediaComment_model_1 = __importDefault(require("../models/mediaComment.model"));
const sequelize_1 = require("sequelize");
const gc_storage_1 = require("../helpers/gc-storage");
const upload_file_1 = require("../helpers/upload-file");
const postComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { data, address, complaint_id, description, lat, lng, zone_id } = req.body;
        if (data.role_id !== 4)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        const photos = (_a = req.files) === null || _a === void 0 ? void 0 : _a.photos;
        if (photos instanceof Array) {
            if (photos.length > 10)
                return (0, customResponses_1.customResponse)(false, res, 401, 'Solo puede subir máximo 10 fotos', null);
        }
        const complaint = yield complaint_model_1.default.findOne({
            where: { id: parseInt(complaint_id), status: { [sequelize_1.Op.notIn]: ['cancel', 'completed'] } },
            attributes: ['id'],
        });
        if (!complaint)
            return (0, customResponses_1.customResponse)(false, res, 404, 'No se encontro la denuncia', null);
        const newComment = yield comments_model_1.default.create({ address, complaint_id: parseInt(complaint_id), description, lat, lng, zone_id, user_id: data.id });
        if (photos) {
            if (photos instanceof Array) {
                for (let p of photos) {
                    const extension = (0, upload_file_1.getExtension)(p);
                    const nameFile = `comment_${data.identification}_${(0, utils_1.generateFileName)()}`;
                    yield (0, gc_storage_1.uploadFileGCS)(p, nameFile, 'comments');
                    yield mediaComment_model_1.default.create({ comment_id: newComment.get().id, url: `${nameFile}.${extension}` });
                }
            }
            else {
                const extension = (0, upload_file_1.getExtension)(photos);
                const nameFile = `comment_${data.identification}_${(0, utils_1.generateFileName)()}`;
                yield (0, gc_storage_1.uploadFileGCS)(photos, nameFile, 'comments');
                yield mediaComment_model_1.default.create({ comment_id: newComment.get().id, url: `${nameFile}.${extension}` });
            }
        }
        const comment = yield (0, exports.getCommentsById)(newComment.get().id);
        (0, customResponses_1.customResponse)(true, res, 200, 'Comentario creado', comment);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.postComment = postComment;
const getCommentsByIdComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idComplaint } = req.params;
        const comments = yield comments_model_1.default.findAndCountAll({
            where: {
                complaint_id: idComplaint,
                is_deleted: 0,
            },
            attributes: ['id', 'address', 'created_at', 'description'],
            include: [
                {
                    model: mediaComment_model_1.default,
                    attributes: ['url'],
                },
            ],
        });
        for (const comment of comments.rows) {
            for (const media of comment.get().media_comments) {
                media.url = yield (0, gc_storage_1.generateSignedUrlGCS)(media.url, 'comments');
            }
        }
        (0, customResponses_1.customResponse)(true, res, 200, comments.count > 0 ? 'Comentarios encontrados' : 'No existen comentarios', comments);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getCommentsByIdComplaint = getCommentsByIdComplaint;
const getCommentsById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield comments_model_1.default.findOne({
            where: {
                id,
                is_deleted: 0,
            },
            attributes: ['id', 'complaint_id', 'address', 'created_at', 'description', 'lat', 'lng', 'zone_id', 'user_id'],
            include: [
                {
                    model: mediaComment_model_1.default,
                    attributes: ['url'],
                },
            ],
        });
        if (!comment)
            return {};
        for (const media of comment.get().media_comments) {
            media.url = yield (0, gc_storage_1.generateSignedUrlGCS)(media.url, 'comments');
        }
        return comment;
    }
    catch (error) {
        console.error('---->', error);
        return {};
    }
});
exports.getCommentsById = getCommentsById;
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idComment } = req.params;
        const comment = yield comments_model_1.default.findOne({
            where: {
                id: idComment,
                is_deleted: 0,
            },
            attributes: ['id'],
        });
        yield (comment === null || comment === void 0 ? void 0 : comment.update({ is_deleted: 1 }));
        (0, customResponses_1.customResponse)(true, res, 200, 'Comentarios eliminado', comment);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.deleteComment = deleteComment;
//# sourceMappingURL=comment.controller.js.map