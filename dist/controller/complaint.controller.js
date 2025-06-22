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
exports.getComplaintHistory = exports.updateComplaintAscById = exports.getAssignedComplaint = exports.getComplaintById = exports.updateComplaint = exports.createComplaint = exports.getComplaintByIdEndpoint = exports.getPointsComplaints = exports.getPhotosByComplaintId = exports.getListComplaint = exports.getComplaints = void 0;
const sequelize_1 = require("sequelize");
const customResponses_1 = require("../helpers/customResponses");
const validatorsDb_1 = require("../helpers/validatorsDb");
const complaint_model_1 = __importDefault(require("../models/complaint.model"));
const PoliticaDivision_model_1 = __importDefault(require("../models/PoliticaDivision.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const notification_controller_1 = require("./notification.controller");
const user_controller_1 = require("./user.controller");
const zone_controller_1 = require("./zone.controller");
const utils_1 = require("../helpers/utils");
const mediaComplaints_model_1 = __importDefault(require("../models/mediaComplaints.model"));
const user_enum_1 = require("../enums/user.enum");
const gc_storage_1 = require("../helpers/gc-storage");
const upload_file_1 = require("../helpers/upload-file");
const subzone_model_1 = __importDefault(require("../models/subzone.model"));
const getComplaints = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        const { limit, offset } = req.params;
        if (data.role_id === user_enum_1.UserRoles.Superadmin)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        let zonesAdmin = [];
        if (data.role_id === user_enum_1.UserRoles.SubAdmin) {
            zonesAdmin = yield (0, zone_controller_1.getZonesByAdmin)(data.id);
        }
        if (data.role_id === user_enum_1.UserRoles.SubAdmin) {
            const complaints = yield complaint_model_1.default.findAndCountAll({
                where: {
                    //   status: { [Op.in]: ['pending', 'accepted'] },
                    zone_id: { [sequelize_1.Op.in]: zonesAdmin },
                },
                attributes: ['id', 'address', 'created_at', 'description', 'lat', 'lng', 'status', 'title', 'updated_at'],
                include: [
                    {
                        model: PoliticaDivision_model_1.default,
                        attributes: ['id', 'name'],
                        as: 'zone',
                    },
                    {
                        model: user_model_1.default,
                        attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
                        as: 'asc',
                    },
                    {
                        model: user_model_1.default,
                        attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
                        as: 'user',
                    },
                    {
                        model: mediaComplaints_model_1.default,
                        attributes: ['url'],
                    },
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
            });
            for (let complaint of complaints.rows) {
                if (complaint.get().user)
                    complaint.get().user.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(complaint.get().user.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(complaint.get().user.photo_profile));
                if (complaint.get().asc)
                    complaint.get().asc.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(complaint.get().asc.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(complaint.get().asc.photo_profile));
                for (const media of complaint.get().media_complaints) {
                    media.url = yield (0, gc_storage_1.generateSignedUrlGCS)(media.url, 'complaints');
                }
            }
            complaints.rows = complaints.rows.filter((complaint) => (complaint.get().status === 'completed' ? complaint.get().updated_at.setHours(complaint.get().updated_at.getHours() + 2) >= new Date() : complaint));
            return (0, customResponses_1.customResponse)(true, res, 200, complaints.count > 0 ? 'Denuncias encontradas' : 'No existen denuncias', complaints);
        }
        if (data.role_id === user_enum_1.UserRoles.Subscriber) {
            const subzones = [];
            const subzonesDB = yield subzone_model_1.default.findAll({
                where: {
                    subs_id: data.subscription.id,
                },
            });
            if (subzonesDB.length === 0) {
                return (0, customResponses_1.customResponse)(false, res, 404, 'No tiene subzonas', null);
            }
            subzonesDB.forEach((subzone) => {
                subzones.push(subzone.get().id);
            });
            const complaints = yield complaint_model_1.default.findAndCountAll({
                where: {
                    status: { [sequelize_1.Op.in]: ['pending', 'accepted', 'completed'] },
                    subzone_id: { [sequelize_1.Op.in]: subzones },
                },
                attributes: ['id', 'address', 'created_at', 'description', 'lat', 'lng', 'status', 'title', 'updated_at'],
                include: [
                    {
                        model: PoliticaDivision_model_1.default,
                        attributes: ['id', 'name'],
                        as: 'zone',
                    },
                    {
                        model: user_model_1.default,
                        attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
                        as: 'asc',
                    },
                    {
                        model: user_model_1.default,
                        attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
                        as: 'user',
                    },
                    {
                        model: mediaComplaints_model_1.default,
                        attributes: ['url'],
                    },
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
            });
            for (let complaint of complaints.rows) {
                if (complaint.get().user)
                    complaint.get().user.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(complaint.get().user.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(complaint.get().user.photo_profile));
                if (complaint.get().asc)
                    complaint.get().asc.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(complaint.get().asc.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(complaint.get().asc.photo_profile));
                for (const media of complaint.get().media_complaints) {
                    media.url = yield (0, gc_storage_1.generateSignedUrlGCS)(media.url, 'complaints');
                }
            }
            complaints.rows = complaints.rows.filter((complaint) => (complaint.get().status === 'completed' ? complaint.get().updated_at.setHours(complaint.get().updated_at.getHours() + 2) >= new Date() : complaint));
            return (0, customResponses_1.customResponse)(true, res, 200, complaints.count > 0 ? 'Denuncias encontradas' : 'No existen denuncias', complaints);
        }
        if (data.role_id === user_enum_1.UserRoles.ASC) {
            if (data.subzone_id) {
                const complaints = yield complaint_model_1.default.findAndCountAll({
                    where: {
                        status: { [sequelize_1.Op.in]: ['pending', 'accepted', 'completed'] },
                        subzone_id: data.subzone_id,
                    },
                    attributes: ['id', 'address', 'created_at', 'description', 'lat', 'lng', 'status', 'title', 'updated_at'],
                    include: [
                        {
                            model: PoliticaDivision_model_1.default,
                            attributes: ['id', 'name'],
                            as: 'zone',
                        },
                        {
                            model: user_model_1.default,
                            attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
                            as: 'asc',
                        },
                        {
                            model: user_model_1.default,
                            attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
                            as: 'user',
                        },
                        {
                            model: mediaComplaints_model_1.default,
                            attributes: ['url'],
                        },
                    ],
                    order: [['created_at', 'DESC']],
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                });
                for (let complaint of complaints.rows) {
                    if (complaint.get().user)
                        complaint.get().user.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(complaint.get().user.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(complaint.get().user.photo_profile));
                    if (complaint.get().asc)
                        complaint.get().asc.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(complaint.get().asc.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(complaint.get().asc.photo_profile));
                    for (const media of complaint.get().media_complaints) {
                        media.url = yield (0, gc_storage_1.generateSignedUrlGCS)(media.url, 'complaints');
                    }
                }
                complaints.rows = complaints.rows.filter((complaint) => (complaint.get().status === 'completed' ? complaint.get().updated_at.setHours(complaint.get().updated_at.getHours() + 2) >= new Date() : complaint));
                return (0, customResponses_1.customResponse)(true, res, 200, complaints.count > 0 ? 'Denuncias encontradas' : 'No existen denuncias', complaints);
            }
            else {
                const complaints = yield complaint_model_1.default.findAndCountAll({
                    where: {
                        status: { [sequelize_1.Op.in]: ['pending', 'accepted', 'completed'] },
                        zone_id: data.zone_id,
                    },
                    attributes: ['id', 'address', 'created_at', 'description', 'lat', 'lng', 'status', 'title', 'updated_at'],
                    include: [
                        {
                            model: PoliticaDivision_model_1.default,
                            attributes: ['id', 'name'],
                            as: 'zone',
                        },
                        {
                            model: user_model_1.default,
                            attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
                            as: 'asc',
                        },
                        {
                            model: user_model_1.default,
                            attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
                            as: 'user',
                        },
                        {
                            model: mediaComplaints_model_1.default,
                            attributes: ['url'],
                        },
                    ],
                    order: [['created_at', 'DESC']],
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                });
                for (let complaint of complaints.rows) {
                    if (complaint.get().user)
                        complaint.get().user.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(complaint.get().user.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(complaint.get().user.photo_profile));
                    if (complaint.get().asc)
                        complaint.get().asc.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(complaint.get().asc.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(complaint.get().asc.photo_profile));
                    for (const media of complaint.get().media_complaints) {
                        media.url = yield (0, gc_storage_1.generateSignedUrlGCS)(media.url, 'complaints');
                    }
                }
                complaints.rows = complaints.rows.filter((complaint) => (complaint.get().status === 'completed' ? complaint.get().updated_at.setHours(complaint.get().updated_at.getHours() + 2) >= new Date() : complaint));
                return (0, customResponses_1.customResponse)(true, res, 200, complaints.count > 0 ? 'Denuncias encontradas' : 'No existen denuncias', complaints);
            }
        }
        const complaints = yield complaint_model_1.default.findAndCountAll({
            where: {
                status: { [sequelize_1.Op.in]: ['pending', 'accepted', 'completed'] },
                zone_id: data.zone_id,
            },
            attributes: ['id', 'address', 'created_at', 'description', 'lat', 'lng', 'status', 'title', 'updated_at'],
            include: [
                {
                    model: PoliticaDivision_model_1.default,
                    attributes: ['id', 'name'],
                    as: 'zone',
                },
                {
                    model: user_model_1.default,
                    attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
                    as: 'asc',
                },
                {
                    model: user_model_1.default,
                    attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
                    as: 'user',
                },
                {
                    model: mediaComplaints_model_1.default,
                    attributes: ['url'],
                },
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
        for (let complaint of complaints.rows) {
            if (complaint.get().user)
                complaint.get().user.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(complaint.get().user.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(complaint.get().user.photo_profile));
            if (complaint.get().asc)
                complaint.get().asc.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(complaint.get().asc.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(complaint.get().asc.photo_profile));
            for (const media of complaint.get().media_complaints) {
                media.url = yield (0, gc_storage_1.generateSignedUrlGCS)(media.url, 'complaints');
            }
        }
        complaints.rows = complaints.rows.filter((complaint) => (complaint.get().status === 'completed' ? complaint.get().updated_at.setHours(complaint.get().updated_at.getHours() + 2) >= new Date() : complaint));
        return (0, customResponses_1.customResponse)(true, res, 200, complaints.count > 0 ? 'Denuncias encontradas' : 'No existen denuncias', complaints);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getComplaints = getComplaints;
const getListComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, offset, limit, searchName, idZone, status } = req.body;
        if (data.role_id !== user_enum_1.UserRoles.SubAdmin && data.role_id !== user_enum_1.UserRoles.Superadmin && data.role_id !== user_enum_1.UserRoles.Subscriber)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        if (data.role_id === user_enum_1.UserRoles.SubAdmin) {
            const zonesAdmin = yield (0, zone_controller_1.getZonesByAdmin)(data.id);
            const complaints = yield complaint_model_1.default.findAndCountAll({
                where: {
                    zone_id: idZone ? parseInt(idZone) : { [sequelize_1.Op.ne]: zonesAdmin },
                    status: status ? status : { [sequelize_1.Op.in]: ['pending', 'completed', 'cancel', 'accepted'] },
                },
                attributes: ['id', 'address', 'created_at', 'description', 'status', 'title'],
                include: [
                    {
                        model: user_model_1.default,
                        as: 'asc',
                        attributes: ['id', 'full_name'],
                    },
                    {
                        model: user_model_1.default,
                        as: 'user',
                        attributes: ['id', 'full_name'],
                        where: { full_name: searchName ? { [sequelize_1.Op.substring]: searchName } : { [sequelize_1.Op.not]: null } },
                    },
                    {
                        model: PoliticaDivision_model_1.default,
                        as: 'zone',
                        attributes: ['id', 'name'],
                    },
                ],
                order: [['created_at', 'ASC']],
                offset: parseInt(offset),
                limit: parseInt(limit),
            });
            complaints.rows.map((item, idx) => {
                item.get().rowNumber = offset + idx + 1;
            });
            return (0, customResponses_1.customResponse)(true, res, 200, complaints.count > 0 ? `Solicitudes encontradas` : 'No se encontraron registros', complaints);
        }
        if (data.role_id === user_enum_1.UserRoles.Subscriber) {
            const subzones = [];
            const subzonesDB = yield subzone_model_1.default.findAll({
                where: {
                    subs_id: data.subscription.id,
                },
            });
            if (subzonesDB.length === 0) {
                return (0, customResponses_1.customResponse)(false, res, 404, 'No tiene subzonas', null);
            }
            subzonesDB.forEach((subzone) => {
                subzones.push(subzone.get().id);
            });
            const complaints = yield complaint_model_1.default.findAndCountAll({
                where: {
                    subzone_id: { [sequelize_1.Op.in]: subzones },
                    status: status ? status : { [sequelize_1.Op.in]: ['pending', 'completed', 'cancel', 'accepted'] },
                },
                attributes: ['id', 'address', 'created_at', 'description', 'status', 'title'],
                include: [
                    {
                        model: user_model_1.default,
                        as: 'asc',
                        attributes: ['id', 'full_name'],
                    },
                    {
                        model: user_model_1.default,
                        as: 'user',
                        attributes: ['id', 'full_name'],
                        where: { full_name: searchName ? { [sequelize_1.Op.substring]: searchName } : { [sequelize_1.Op.not]: null } },
                    },
                    {
                        model: PoliticaDivision_model_1.default,
                        as: 'zone',
                        attributes: ['id', 'name'],
                    },
                ],
                order: [['created_at', 'ASC']],
                offset: parseInt(offset),
                limit: parseInt(limit),
            });
            complaints.rows.map((item, idx) => {
                item.get().rowNumber = offset + idx + 1;
            });
            (0, customResponses_1.customResponse)(true, res, 200, complaints.count > 0 ? `Solicitudes encontradas` : 'No se encontraron registros', complaints);
        }
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getListComplaint = getListComplaint;
const getPhotosByComplaintId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        const { complaint_id } = req.params;
        // if (data.role_id !== UserRoles.ASC) return customResponse(false, res, 401, `Acceso denegado`, null);
        const photos = yield mediaComplaints_model_1.default.findAll({
            where: { complaint_id, is_deleted: 0 },
            attributes: ['id', 'url', 'created_at'],
        });
        for (let p of photos) {
            p.get().url = yield (0, gc_storage_1.generateSignedUrlGCS)(p.get().url, 'complaints');
        }
        (0, customResponses_1.customResponse)(true, res, 200, photos.length > 0 ? `Fotos encontradas` : 'No se encontraron registros', photos);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getPhotosByComplaintId = getPhotosByComplaintId;
const getPointsComplaints = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        if (data.role_id !== user_enum_1.UserRoles.ASC)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        const complaints = yield complaint_model_1.default.findAndCountAll({
            where: {
                status: { [sequelize_1.Op.in]: ['pending'] },
                zone_id: data.zone_id,
            },
            attributes: ['id', 'lat', 'lng'],
            order: [['created_at', 'DESC']],
        });
        (0, customResponses_1.customResponse)(true, res, 200, complaints.count > 0 ? 'Denuncias encontradas' : 'No existen denuncias', complaints);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getPointsComplaints = getPointsComplaints;
const getComplaintByIdEndpoint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        const { idComplaint } = req.params;
        if (data.role_id === user_enum_1.UserRoles.Superadmin)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        const complaint = yield (0, exports.getComplaintById)(parseInt(idComplaint));
        (0, customResponses_1.customResponse)(true, res, 200, complaint ? 'Denuncia encontrada' : 'la denuncia no existe', complaint);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getComplaintByIdEndpoint = getComplaintByIdEndpoint;
const createComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { data, address, description, lat, lng, title, zone_id, subzone_id } = req.body;
        if (data.role_id !== user_enum_1.UserRoles.User)
            return (0, customResponses_1.customResponse)(false, res, 401, 'No pude realizar esta petición', null);
        if (!req.files || Object.keys(req.files).length === 0 || !req.files.photos) {
            return (0, customResponses_1.customResponse)(false, res, 400, 'No hay fotos que subir', null);
        }
        const photos = (_a = req.files) === null || _a === void 0 ? void 0 : _a.photos;
        if (photos instanceof Array) {
            if (photos.length > 10)
                return (0, customResponses_1.customResponse)(false, res, 401, 'Solo puede subir máximo 10 fotos', null);
        }
        const newComplaint = yield complaint_model_1.default.create({ address, description, lat: parseFloat(lat), lng: parseFloat(lng), title, zone_id: parseInt(zone_id), user_id: data.id, subzone_id: subzone_id ? parseInt(subzone_id) : null });
        if (photos instanceof Array) {
            for (let p of photos) {
                const extension = (0, upload_file_1.getExtension)(p);
                const nameFile = `complaint_${data.identification}_${(0, utils_1.generateFileName)()}`;
                yield (0, gc_storage_1.uploadFileGCS)(p, nameFile, 'complaints');
                yield mediaComplaints_model_1.default.create({ complaint_id: newComplaint.get().id, url: `${nameFile}.${extension}` });
            }
        }
        else {
            const extension = (0, upload_file_1.getExtension)(photos);
            const nameFile = `complaint_${data.identification}_${(0, utils_1.generateFileName)()}`;
            yield (0, gc_storage_1.uploadFileGCS)(photos, nameFile, 'complaints');
            yield mediaComplaints_model_1.default.create({ complaint_id: newComplaint.get().id, url: `${nameFile}.${extension}` });
        }
        return (0, customResponses_1.customResponse)(true, res, 200, 'Denuncia creada', newComplaint);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.createComplaint = createComplaint;
const updateComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, idComplaint, idAsc, status } = req.body;
        const { ok, msg } = (0, validatorsDb_1.validTypeStatusEnd)(status);
        if (!ok) {
            return (0, customResponses_1.customResponse)(ok, res, 404, msg, null);
        }
        if (status === 'accepted') {
            if (data.role_id === user_enum_1.UserRoles.ASC) {
                const complaintsDB = yield complaint_model_1.default.findAll({
                    where: { agent_id: data.id, status: 'accepted' },
                    attributes: ['id'],
                });
                if (complaintsDB.length > 0) {
                    return (0, customResponses_1.customResponse)(false, res, 404, `Ya tiene un solicitud aceptada, no puede aceptar más`, null);
                }
            }
            if (data.role_id === 4) {
                return (0, customResponses_1.customResponse)(false, res, 404, `Solo un asc puede aceptar la solicitud`, null);
            }
        }
        const complaint = yield complaint_model_1.default.findOne({
            where: {
                id: idComplaint,
            },
            attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at', 'agent_id', 'user_id', 'zone_id'],
        });
        if (!complaint)
            return (0, customResponses_1.customResponse)(false, res, 404, `No se encontro la solicitud`, null);
        const complaintAux = complaint.toJSON();
        if (complaintAux.status === 'cancel') {
            return (0, customResponses_1.customResponse)(false, res, 404, `No puede cambiar el estado la solictud, ya fue cancelada`, null);
        }
        if (complaintAux.status === 'completed') {
            return (0, customResponses_1.customResponse)(false, res, 404, `No puede cambiar el estado, la solicitud ya ha sido completada`, null);
        }
        if (complaintAux.agent_id) {
            if (status === 'pending') {
                return (0, customResponses_1.customResponse)(false, res, 404, `No puede cambiar el estado, la solicitud ya ha sido aceptada`, null);
            }
        }
        if (complaintAux.status !== 'pending') {
            // console.log(data.id);
            if (data.id !== complaintAux.agent_id && data.id !== complaintAux.user_id) {
                return (0, customResponses_1.customResponse)(false, res, 404, `No puede cambiar el estado, no fue creador o asignado de la solicitud`, null);
            }
        }
        if (data.role_id === user_enum_1.UserRoles.ASC) {
            const complaintUpdated = yield complaint.update({ status, agent_id: data.id });
            const user = yield (0, user_controller_1.getUserByIdForExpoNotification)(complaint.get().user_id);
            if (user) {
                if (status === 'completed') {
                    (0, notification_controller_1.sendNotificationExpoUser)({
                        expoToken: user.get().expo_token,
                        title: 'Denuncia de la comunidad',
                        message: 'La denuncia ha sido compledata',
                        data: { id: complaintUpdated.get().id, status: complaintUpdated.get().status },
                    });
                }
                if (status === 'accepted') {
                    (0, notification_controller_1.sendNotificationExpoUser)({
                        expoToken: user.get().expo_token,
                        title: 'Denuncia de la comunidad',
                        message: 'La denuncia ha sido aceptada',
                        data: { id: complaintUpdated.get().id, status: complaintUpdated.get().status },
                    });
                }
                if (status === 'cancel') {
                    yield complaint.update({ cancel_user_id: data.id });
                    (0, notification_controller_1.sendNotificationExpoUser)({
                        expoToken: user.get().expo_token,
                        title: 'Denuncia de la comunidad',
                        message: 'La denuncia ha sido cancelada',
                        data: { id: complaintUpdated.get().id, status: complaintUpdated.get().status },
                    });
                }
            }
        }
        else if (data.role_id === user_enum_1.UserRoles.SubAdmin || data.role_id === user_enum_1.UserRoles.Subscriber) {
            const complaintsDB = yield complaint_model_1.default.findAll({
                where: { agent_id: idAsc, status: { [sequelize_1.Op.in]: ['pending', 'accepted'] } },
                attributes: ['id'],
            });
            if (complaintsDB.length > 0) {
                return (0, customResponses_1.customResponse)(false, res, 404, `El agente ya tiene una denuncia asignada o en curso, el agente solo puede atender una denuncia`, null);
            }
            const complaintUpdated = yield complaint.update({ agent_id: idAsc });
            const user = yield (0, user_controller_1.getUserByIdForExpoNotification)(idAsc);
            if (user)
                (0, notification_controller_1.sendNotificationExpoUser)({
                    expoToken: user.get().expo_token,
                    title: 'Denuncia de la comunidad',
                    message: 'Se te ha asignado una denuncia',
                    data: { id: complaintUpdated.get().id, status: complaintUpdated.get().status },
                });
        }
        else {
            const reqUpdated = yield complaint.update({ status });
            if (status === 'cancel') {
                const user = yield (0, user_controller_1.getUserByIdForExpoNotification)(complaint.get().agent_id);
                yield complaint.update({ cancel_user_id: data.id });
                if (user)
                    (0, notification_controller_1.sendNotificationExpoUser)({
                        expoToken: user.get().expo_token,
                        title: 'Denuncia de la comunidad',
                        message: 'La denuncia ha sido cancelada',
                        data: { id: reqUpdated.get().id, status: reqUpdated.get().status },
                    });
            }
        }
        (0, customResponses_1.customResponse)(true, res, 200, `solicitud actualizada`, complaint);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.updateComplaint = updateComplaint;
const getComplaintById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const complaint = yield complaint_model_1.default.findOne({
        where: { id },
        attributes: ['id', 'address', 'created_at', 'description', 'lat', 'lng', 'status', 'title', 'subzone_id'],
        include: [
            {
                model: user_model_1.default,
                as: 'asc',
                attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
            },
            {
                model: user_model_1.default,
                as: 'user',
                attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
            },
            {
                model: PoliticaDivision_model_1.default,
                as: 'zone',
                attributes: ['id', 'name'],
            },
            {
                model: mediaComplaints_model_1.default,
                attributes: ['url'],
            },
        ],
    });
    if (complaint) {
        if (complaint.get().user)
            complaint.get().user.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(complaint.get().user.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(complaint.get().user.photo_profile));
        if (complaint.get().asc)
            complaint.get().asc.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(complaint.get().asc.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(complaint.get().asc.photo_profile));
        for (const media of complaint.get().media_complaints) {
            media.url = yield (0, gc_storage_1.generateSignedUrlGCS)(media.url, 'complaints');
        }
    }
    return complaint;
});
exports.getComplaintById = getComplaintById;
const getAssignedComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        if (data.role_id !== user_enum_1.UserRoles.ASC)
            return (0, customResponses_1.customResponse)(false, res, 401, 'No pude realizar esta petición', null);
        const complaint = yield complaint_model_1.default.findAll({
            where: {
                agent_id: data.id,
                status: { [sequelize_1.Op.in]: ['pending'] },
            },
            attributes: ['id', 'status', 'updated_at'],
        });
        if (complaint.length === 0) {
            return (0, customResponses_1.customResponse)(false, res, 200, 'No tienes asignado una denuncia', complaint);
        }
        return (0, customResponses_1.customResponse)(true, res, 200, 'Tienes una denuncia asignada', complaint);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getAssignedComplaint = getAssignedComplaint;
const updateComplaintAscById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const complaint = yield complaint_model_1.default.findOne({
        where: { id, is_deleted: 0 },
    });
    complaint === null || complaint === void 0 ? void 0 : complaint.update({ agent_id: null });
});
exports.updateComplaintAscById = updateComplaintAscById;
const getComplaintHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        const { limit, offset } = req.params;
        if (data.role_id !== user_enum_1.UserRoles.ASC && data.role_id !== user_enum_1.UserRoles.User)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        const complaints = data.role_id === user_enum_1.UserRoles.ASC
            ? yield complaint_model_1.default.findAndCountAll({
                where: {
                    agent_id: data.id,
                    status: { [sequelize_1.Op.in]: ['completed'] },
                },
                attributes: ['id', 'address', 'created_at', 'description', 'lat', 'lng', 'status', 'title', 'updated_at'],
                include: [
                    {
                        model: PoliticaDivision_model_1.default,
                        attributes: ['id', 'name'],
                        as: 'zone',
                    },
                    {
                        model: user_model_1.default,
                        attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
                        as: 'user',
                    },
                    {
                        model: mediaComplaints_model_1.default,
                        attributes: ['url'],
                    },
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
            })
            : yield complaint_model_1.default.findAndCountAll({
                where: {
                    user_id: data.id,
                    status: { [sequelize_1.Op.in]: ['completed'] },
                },
                attributes: ['id', 'address', 'created_at', 'description', 'lat', 'lng', 'status', 'title', 'updated_at'],
                include: [
                    {
                        model: PoliticaDivision_model_1.default,
                        attributes: ['id', 'name'],
                        as: 'zone',
                    },
                    {
                        model: user_model_1.default,
                        attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
                        as: 'asc',
                    },
                    {
                        model: mediaComplaints_model_1.default,
                        attributes: ['url'],
                    },
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
            });
        for (let complaint of complaints.rows) {
            if (complaint.get().user)
                complaint.get().user.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(complaint.get().user.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(complaint.get().user.photo_profile));
            if (complaint.get().asc)
                complaint.get().asc.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(complaint.get().asc.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(complaint.get().asc.photo_profile));
            for (const media of complaint.get().media_complaints) {
                media.url = yield (0, gc_storage_1.generateSignedUrlGCS)(media.url, 'complaints');
            }
        }
        (0, customResponses_1.customResponse)(true, res, 200, complaints.count > 0 ? 'Denuncias encontradas' : 'No existen denuncias', complaints);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getComplaintHistory = getComplaintHistory;
//# sourceMappingURL=complaint.controller.js.map