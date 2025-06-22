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
exports.getHistoryHelpRequest = exports.updateAscHelpRequestById = exports.getHelpRequestById = exports.updateHelpRequest = exports.postHelpRequest = exports.getMyHelpRequestAssigned = exports.getHelpRequestByIdEnpoint = exports.getListHelpRequest = exports.getHelpRequest = void 0;
const sequelize_1 = require("sequelize");
const customResponses_1 = require("../helpers/customResponses");
const helpRequest_model_1 = __importDefault(require("../models/helpRequest.model"));
const PoliticaDivision_model_1 = __importDefault(require("../models/PoliticaDivision.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const user_controller_1 = require("./user.controller");
const notification_controller_1 = require("./notification.controller");
const zone_controller_1 = require("./zone.controller");
const validatorsDb_1 = require("../helpers/validatorsDb");
const user_enum_1 = require("../enums/user.enum");
const gc_storage_1 = require("../helpers/gc-storage");
const utils_1 = require("../helpers/utils");
const subzone_model_1 = __importDefault(require("../models/subzone.model"));
const getHelpRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        if (data.role_id === user_enum_1.UserRoles.User)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        let zonesAdmin = [];
        if (data.role_id === user_enum_1.UserRoles.SubAdmin) {
            zonesAdmin = yield (0, zone_controller_1.getZonesByAdmin)(data.id);
        }
        if (data.role_id === user_enum_1.UserRoles.Superadmin) {
            const helpRequest = yield helpRequest_model_1.default.findAndCountAll({
                where: {
                    zone_id: data.zone_id,
                    status: 'pending',
                    agent_id: null,
                },
                attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at'],
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
                ],
                order: [['created_at', 'DESC']],
            });
            if (helpRequest.count === 0)
                return (0, customResponses_1.customResponse)(false, res, 404, `No se encontraron solicitudes`, null);
            for (const help of helpRequest.rows) {
                if (help.get().user)
                    help.get().user.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().user.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().user.photo_profile));
                if (help.get().asc)
                    help.get().asc.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().asc.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().asc.photo_profile));
            }
            return (0, customResponses_1.customResponse)(true, res, 200, `Solicitudes encontradas`, helpRequest);
        }
        if (data.role_id === user_enum_1.UserRoles.SubAdmin) {
            const helpRequest = yield helpRequest_model_1.default.findAndCountAll({
                where: {
                    zone_id: { [sequelize_1.Op.in]: zonesAdmin },
                },
                attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at'],
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
                ],
                order: [['created_at', 'DESC']],
                limit: 20,
            });
            if (helpRequest.count === 0)
                return (0, customResponses_1.customResponse)(false, res, 404, `No se encontraron solicitudes`, null);
            for (const help of helpRequest.rows) {
                if (help.get().user)
                    help.get().user.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().user.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().user.photo_profile));
                if (help.get().asc)
                    help.get().asc.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().asc.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().asc.photo_profile));
            }
            return (0, customResponses_1.customResponse)(true, res, 200, `Solicitudes encontradas`, helpRequest);
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
            const helpRequest = yield helpRequest_model_1.default.findAndCountAll({
                where: {
                    subzone_id: { [sequelize_1.Op.in]: subzones },
                },
                attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at'],
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
                ],
                order: [['created_at', 'DESC']],
                limit: 20,
            });
            if (helpRequest.count === 0)
                return (0, customResponses_1.customResponse)(false, res, 404, `No se encontraron solicitudes`, null);
            for (const help of helpRequest.rows) {
                if (help.get().user)
                    help.get().user.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().user.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().user.photo_profile));
                if (help.get().asc)
                    help.get().asc.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().asc.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().asc.photo_profile));
            }
            return (0, customResponses_1.customResponse)(true, res, 200, `Solicitudes encontradas`, helpRequest);
        }
        if (data.role_id === user_enum_1.UserRoles.ASC) {
            if (data.subzone_id) {
                const helpRequest = yield helpRequest_model_1.default.findAndCountAll({
                    where: {
                        subzone_id: data.subzone_id,
                        status: 'pending',
                        agent_id: null,
                    },
                    attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at'],
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
                    ],
                    order: [['created_at', 'DESC']],
                });
                if (helpRequest.count === 0)
                    return (0, customResponses_1.customResponse)(false, res, 404, `No se encontraron solicitudes`, null);
                for (const help of helpRequest.rows) {
                    if (help.get().user)
                        help.get().user.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().user.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().user.photo_profile));
                    if (help.get().asc)
                        help.get().asc.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().asc.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().asc.photo_profile));
                }
                return (0, customResponses_1.customResponse)(true, res, 200, `Solicitudes encontradas`, helpRequest);
            }
            else {
                const helpRequest = yield helpRequest_model_1.default.findAndCountAll({
                    where: {
                        zone_id: data.zone_id,
                        status: 'pending',
                        agent_id: null,
                    },
                    attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at'],
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
                    ],
                    order: [['created_at', 'DESC']],
                });
                if (helpRequest.count === 0)
                    return (0, customResponses_1.customResponse)(false, res, 404, `No se encontraron solicitudes`, null);
                for (const help of helpRequest.rows) {
                    if (help.get().user)
                        help.get().user.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().user.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().user.photo_profile));
                    if (help.get().asc)
                        help.get().asc.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().asc.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().asc.photo_profile));
                }
                return (0, customResponses_1.customResponse)(true, res, 200, `Solicitudes encontradas`, helpRequest);
            }
        }
        const helpRequest = yield helpRequest_model_1.default.findAndCountAll({
            where: {
                zone_id: data.zone_id,
                status: 'pending',
                agent_id: null,
            },
            attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at'],
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
            ],
            order: [['created_at', 'DESC']],
        });
        if (helpRequest.count === 0)
            return (0, customResponses_1.customResponse)(false, res, 404, `No se encontraron solicitudes`, null);
        for (const help of helpRequest.rows) {
            if (help.get().user)
                help.get().user.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().user.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().user.photo_profile));
            if (help.get().asc)
                help.get().asc.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().asc.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().asc.photo_profile));
        }
        return (0, customResponses_1.customResponse)(true, res, 200, `Solicitudes encontradas`, helpRequest);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getHelpRequest = getHelpRequest;
const getListHelpRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, offset, limit, searchName, idZone, status } = req.body;
        if (data.role_id !== user_enum_1.UserRoles.SubAdmin && data.role_id !== user_enum_1.UserRoles.Subscriber)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        if (data.role_id === user_enum_1.UserRoles.SubAdmin) {
            const zonesAdmin = yield (0, zone_controller_1.getZonesByAdmin)(data.id);
            const helpRequest = yield helpRequest_model_1.default.findAndCountAll({
                where: {
                    zone_id: idZone ? parseInt(idZone) : { [sequelize_1.Op.in]: zonesAdmin },
                    status: status ? status : { [sequelize_1.Op.in]: ['pending', 'completed', 'cancel', 'accepted'] },
                },
                attributes: ['id', 'address', 'status', 'created_at'],
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
            for (let help of helpRequest.rows) {
                if (help.get().user)
                    help.get().user.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().user.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().user.photo_profile));
                if (help.get().asc)
                    help.get().asc.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().asc.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().asc.photo_profile));
            }
            helpRequest.rows.map((help, idx) => {
                help.get().rowNumber = offset + idx + 1;
            });
            return (0, customResponses_1.customResponse)(true, res, 200, helpRequest.count > 0 ? `Solicitudes encontradas` : 'No se encontraron registros', helpRequest);
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
            const helpRequest = yield helpRequest_model_1.default.findAndCountAll({
                where: {
                    subzone_id: { [sequelize_1.Op.in]: subzones },
                    status: status ? status : { [sequelize_1.Op.in]: ['pending', 'completed', 'cancel', 'accepted'] },
                },
                attributes: ['id', 'address', 'status', 'created_at'],
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
            helpRequest.rows.map((help, idx) => {
                help.get().rowNumber = offset + idx + 1;
            });
            return (0, customResponses_1.customResponse)(true, res, 200, helpRequest.count > 0 ? `Solicitudes encontradas` : 'No se encontraron registros', helpRequest);
        }
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getListHelpRequest = getListHelpRequest;
const getHelpRequestByIdEnpoint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const { data } = req.body;
        const { id } = req.params;
        const helpRequest = yield (0, exports.getHelpRequestById)(parseInt(id));
        if (!helpRequest)
            return (0, customResponses_1.customResponse)(false, res, 404, `No se encontraron solicitudes`, null);
        (0, customResponses_1.customResponse)(true, res, 200, `Solicitudes encontradas`, helpRequest);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getHelpRequestByIdEnpoint = getHelpRequestByIdEnpoint;
const getMyHelpRequestAssigned = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        if (data.role_id !== user_enum_1.UserRoles.ASC)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        const helpRequest = yield helpRequest_model_1.default.findAll({
            where: {
                status: 'pending',
                agent_id: data.id,
            },
            attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at'],
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
            ],
            order: [['created_at', 'DESC']],
            limit: 1,
        });
        if (helpRequest.length === 0)
            return (0, customResponses_1.customResponse)(false, res, 404, `No se encontraron solicitudes`, null);
        if (helpRequest[0].get().user)
            helpRequest[0].get().user.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(helpRequest[0].get().user.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(helpRequest[0].get().user.photo_profile));
        if (helpRequest[0].get().asc)
            helpRequest[0].get().asc.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(helpRequest[0].get().asc.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(helpRequest[0].get().asc.photo_profile));
        (0, customResponses_1.customResponse)(true, res, 200, `Solicitudes encontradas`, helpRequest[0]);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getMyHelpRequestAssigned = getMyHelpRequestAssigned;
const postHelpRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, address, lat, lng, zone_id, subzone_id } = req.body;
        if (data.role_id !== user_enum_1.UserRoles.User)
            return (0, customResponses_1.customResponse)(false, res, 404, `Acceso denegado`, null);
        const helpRequestALlDB = yield helpRequest_model_1.default.findAll({
            where: { user_id: data.id, status: { [sequelize_1.Op.in]: ['pending', 'accepted'] } },
            attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at', 'subzone_id'],
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
            ],
            order: [['created_at', 'DESC']],
        });
        if (helpRequestALlDB.length > 0) {
            for (const help of helpRequestALlDB) {
                if (help.get().user)
                    help.get().user.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().user.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().user.photo_profile));
                if (help.get().asc)
                    help.get().asc.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().asc.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().asc.photo_profile));
            }
            return (0, customResponses_1.customResponse)(false, res, 404, `Ya tiene un solicitud aceptada, no puede crear más`, helpRequestALlDB);
        }
        const newRequest = yield helpRequest_model_1.default.create({ address, lat, lng, user_id: data.id, zone_id, subzone_id });
        (0, customResponses_1.customResponse)(true, res, 200, `solicitud creada`, newRequest);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.postHelpRequest = postHelpRequest;
const updateHelpRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, id, status, agent_id } = req.body;
        const { ok, msg } = (0, validatorsDb_1.validTypeStatusEnd)(status);
        if (!ok) {
            return (0, customResponses_1.customResponse)(ok, res, 404, msg, null);
        }
        if (status === 'accepted') {
            if (data.role_id === user_enum_1.UserRoles.ASC) {
                const helpRequestALlDB = yield helpRequest_model_1.default.findAll({
                    where: { agent_id: data.id, status: 'accepted' },
                    attributes: ['id'],
                });
                if (helpRequestALlDB.length > 0) {
                    return (0, customResponses_1.customResponse)(false, res, 404, `Ya tiene un solicitud aceptada, no puede aceptar más`, null);
                }
            }
            if (data.role_id === user_enum_1.UserRoles.User) {
                return (0, customResponses_1.customResponse)(false, res, 404, `Solo un asc puede aceptar la solicitud`, null);
            }
        }
        const helpRequest = yield helpRequest_model_1.default.findOne({
            where: {
                id,
            },
            attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at', 'agent_id', 'user_id', 'zone_id'],
        });
        if (!helpRequest)
            return (0, customResponses_1.customResponse)(false, res, 404, `No se encontro la solicitud`, null);
        const helReq = helpRequest.toJSON();
        if (helReq.status === 'cancel') {
            return (0, customResponses_1.customResponse)(false, res, 404, `No puede cambiar el estado la solictud, ya fue cancelada`, null);
        }
        if (helReq.status === 'completed') {
            return (0, customResponses_1.customResponse)(false, res, 404, `No puede cambiar el estado, la solicitud ya ha sido completada`, null);
        }
        if (helReq.agent_id) {
            if (status === 'pending') {
                return (0, customResponses_1.customResponse)(false, res, 404, `No puede cambiar el estado, la solicitud ya ha sido aceptada`, null);
            }
        }
        if (helReq.status !== 'pending') {
            // console.log(data.id);
            if (data.id !== helReq.agent_id && data.id !== helReq.user_id) {
                return (0, customResponses_1.customResponse)(false, res, 404, `No puede cambiar el estado, no fue creador o asignado de la solicitud o`, null);
            }
        }
        if (data.role_id === user_enum_1.UserRoles.ASC) {
            const reqUpdated = yield helpRequest.update({ status, agent_id: data.id });
            const user = yield (0, user_controller_1.getUserByIdForExpoNotification)(helpRequest.get().user_id);
            if (user) {
                if (status === 'completed') {
                    (0, notification_controller_1.sendNotificationExpoUser)({
                        expoToken: user.get().expo_token,
                        title: 'Solicitud de auxilio',
                        message: 'Solicitud de auxilio completada',
                        data: { id: reqUpdated.get().id, status: reqUpdated.get().status },
                    });
                }
                if (status === 'accepted') {
                    (0, notification_controller_1.sendNotificationExpoUser)({
                        expoToken: user.get().expo_token,
                        title: 'Solicitud de auxilio',
                        message: 'Solicitud de auxilio aceptada',
                        data: { id: reqUpdated.get().id, status: reqUpdated.get().status },
                    });
                }
                if (status === 'cancel') {
                    yield helpRequest.update({ cancel_user_id: data.id });
                    (0, notification_controller_1.sendNotificationExpoUser)({
                        expoToken: user.get().expo_token,
                        title: 'Solicitud de auxilio',
                        message: 'Solicitud de auxilio cancelada',
                        data: { id: reqUpdated.get().id, status: reqUpdated.get().status },
                    });
                }
            }
        }
        else if (data.role_id === user_enum_1.UserRoles.SubAdmin || data.role_id === user_enum_1.UserRoles.Subscriber) {
            const helpAux = yield helpRequest_model_1.default.findAll({
                where: { agent_id, status: { [sequelize_1.Op.in]: ['pending', 'accepted'] } },
                attributes: ['id'],
            });
            if (helpAux.length > 0) {
                return (0, customResponses_1.customResponse)(false, res, 404, `El agente ya tiene una denuncia asignada, el agente solo puede atender una denuncia`, null);
            }
            const reqUpdated = yield helpRequest.update({ agent_id });
            const user = yield (0, user_controller_1.getUserByIdForExpoNotification)(agent_id);
            if (user)
                (0, notification_controller_1.sendNotificationExpoUser)({
                    expoToken: user.get().expo_token,
                    title: 'Solicitud de auxilio',
                    message: 'Asignación de solicitud de auxilio',
                    data: { id: reqUpdated.get().id, status: reqUpdated.get().status },
                });
        }
        else {
            const reqUpdated = yield helpRequest.update({ status });
            if (status === 'cancel') {
                yield helpRequest.update({ cancel_user_id: data.id });
                const user = yield (0, user_controller_1.getUserByIdForExpoNotification)(helpRequest.get().agent_id);
                if (user)
                    (0, notification_controller_1.sendNotificationExpoUser)({
                        expoToken: user.get().expo_token,
                        title: 'Solicitud de auxilio',
                        message: 'Solicitud de auxilio cancelada',
                        data: { id: reqUpdated.get().id, status: reqUpdated.get().status },
                    });
            }
        }
        (0, customResponses_1.customResponse)(true, res, 200, `solicitud actualizada`, helpRequest);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.updateHelpRequest = updateHelpRequest;
const getHelpRequestById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const help = yield helpRequest_model_1.default.findOne({
        where: { id },
        attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at', 'subzone_id'],
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
        ],
    });
    if (help) {
        if (help.get().user)
            help.get().user.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().user.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().user.photo_profile));
        if (help.get().asc)
            help.get().asc.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().asc.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().asc.photo_profile));
    }
    return help;
});
exports.getHelpRequestById = getHelpRequestById;
const updateAscHelpRequestById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const helpRequest = yield helpRequest_model_1.default.findOne({
            where: { id, is_deleted: 0 },
        });
        yield (helpRequest === null || helpRequest === void 0 ? void 0 : helpRequest.update({ agent_id: null }));
    }
    catch (error) {
        console.error('error->', error);
    }
});
exports.updateAscHelpRequestById = updateAscHelpRequestById;
const getHistoryHelpRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        const { limit, offset } = req.params;
        if (data.role_id !== user_enum_1.UserRoles.ASC && data.role_id !== user_enum_1.UserRoles.User)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        const helpHistory = data.role_id === user_enum_1.UserRoles.ASC
            ? yield helpRequest_model_1.default.findAndCountAll({
                where: {
                    agent_id: data.id,
                    status: { [sequelize_1.Op.in]: ['completed'] },
                },
                attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at'],
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
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
            })
            : yield helpRequest_model_1.default.findAndCountAll({
                where: {
                    user_id: data.id,
                    status: { [sequelize_1.Op.in]: ['completed'] },
                },
                attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at'],
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
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
            });
        for (let help of helpHistory.rows) {
            if (help.get().user)
                help.get().user.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().user.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().user.photo_profile));
            if (help.get().asc)
                help.get().asc.photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(help.get().asc.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(help.get().asc.photo_profile));
        }
        (0, customResponses_1.customResponse)(true, res, 200, helpHistory.count > 0 ? 'Denuncias encontradas' : 'No existen denuncias', helpHistory);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getHistoryHelpRequest = getHistoryHelpRequest;
//# sourceMappingURL=helpRequest.controller.js.map