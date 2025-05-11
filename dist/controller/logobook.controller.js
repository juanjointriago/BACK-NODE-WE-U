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
exports.getLogbookHistory = exports.updateLogbook = exports.getPhotosByPointId = exports.getMylastLogbook = exports.getLogbookById = exports.getAllLogbooks = exports.postCoordsLogbook = exports.postLogbook = void 0;
const customResponses_1 = require("../helpers/customResponses");
const zone_controller_1 = require("./zone.controller");
const sequelize_1 = require("sequelize");
const user_model_1 = __importDefault(require("../models/user.model"));
const PoliticaDivision_model_1 = __importDefault(require("../models/PoliticaDivision.model"));
const mediaCoordsLogbook_model_1 = __importDefault(require("../models/mediaCoordsLogbook.model"));
const moment_1 = __importDefault(require("moment"));
const logbook_model_1 = __importDefault(require("../models/logbook.model"));
const coordsLogbook_model_1 = __importDefault(require("../models/coordsLogbook.model"));
const utils_1 = require("../helpers/utils");
const user_enum_1 = require("../enums/user.enum");
const gc_storage_1 = require("../helpers/gc-storage");
const upload_file_1 = require("../helpers/upload-file");
const subzone_model_1 = __importDefault(require("../models/subzone.model"));
const postLogbook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, date_until, hour_until, zone_id, subzone_id } = req.body;
        if (data.role_id !== 4)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        const log = yield logbook_model_1.default.findOne({
            where: {
                user_id: data.id,
                status: { [sequelize_1.Op.in]: ['started', 'created'] },
            },
        });
        if (log) {
            return (0, customResponses_1.customResponse)(false, res, 400, `Ya tiene una solicitud creada o en curso`, null);
        }
        const newLogBook = yield logbook_model_1.default.create({ date_until, hour_until, zone_id, user_id: data.id, subzone_id });
        (0, customResponses_1.customResponse)(true, res, 200, 'Bitacora creada', newLogBook);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.postLogbook = postLogbook;
const postCoordsLogbook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { data, lat, lng, logbook_id, address } = req.body;
        if (data.role_id !== 4)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        const photos = (_a = req.files) === null || _a === void 0 ? void 0 : _a.photos;
        const logbook = yield logbook_model_1.default.findOne({
            where: {
                id: logbook_id,
                status: { [sequelize_1.Op.notIn]: ['cancel', 'completed'] },
            },
            attributes: ['id', 'date_until', 'hour_until'],
        });
        if (!logbook) {
            return (0, customResponses_1.customResponse)(false, res, 404, `No existe la bitacora`, null);
        }
        const datelog = (0, moment_1.default)(new Date()).isSameOrAfter(`${logbook.get().date_until} ${logbook.get().hour_until}`);
        if (datelog) {
            logbook.update({ status: 'completed' });
            return (0, customResponses_1.customResponse)(false, res, 400, `La fecha de registro de bitacora a caducado. Fecha hasta: ${logbook.get().date_until} ${logbook.get().hour_until}`, null);
        }
        const newCoordLogBook = yield coordsLogbook_model_1.default.create({ lat, lng, logbook_id, address });
        if (photos) {
            if (photos instanceof Array) {
                for (let p of photos) {
                    const extension = (0, upload_file_1.getExtension)(p);
                    const nameFile = `coordLog_${data.identification}_${(0, utils_1.generateFileName)()}`;
                    yield (0, gc_storage_1.uploadFileGCS)(p, nameFile, 'logbooks');
                    yield mediaCoordsLogbook_model_1.default.create({ coord_logbook_id: newCoordLogBook.get().id, url: `${nameFile}.${extension}` });
                }
            }
            else {
                const extension = (0, upload_file_1.getExtension)(photos);
                const nameFile = `coordLog_${data.identification}_${(0, utils_1.generateFileName)()}`;
                yield (0, gc_storage_1.uploadFileGCS)(photos, nameFile, 'logbooks');
                yield mediaCoordsLogbook_model_1.default.create({ coord_logbook_id: newCoordLogBook.get().id, url: `${nameFile}.${extension}` });
            }
        }
        (0, customResponses_1.customResponse)(true, res, 200, 'Bitacora creada', newCoordLogBook);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.postCoordsLogbook = postCoordsLogbook;
const getAllLogbooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        const { zone_id, offset, limit, searchName } = req.body;
        const zoneId = parseInt(zone_id);
        if (data.role_id !== user_enum_1.UserRoles.SubAdmin && data.role_id !== user_enum_1.UserRoles.Superadmin && data.role_id !== user_enum_1.UserRoles.Subscriber)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        let logbooks;
        if (data.role_id === user_enum_1.UserRoles.Superadmin) {
            logbooks = yield logbook_model_1.default.findAndCountAll({
                where: { is_deleted: 0, zone_id: zoneId === 0 ? { [sequelize_1.Op.ne]: null } : zoneId },
                attributes: ['id', 'date_until', 'hour_until', 'status'],
                include: [
                    {
                        model: user_model_1.default,
                        as: 'user',
                        attributes: ['id', 'full_name', 'phone', 'email', 'identification'],
                        where: { full_name: searchName ? { [sequelize_1.Op.substring]: searchName } : { [sequelize_1.Op.not]: null } },
                    },
                    {
                        model: PoliticaDivision_model_1.default,
                        as: 'zone',
                        attributes: ['id', 'name'],
                    },
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
            });
        }
        if (data.role_id === user_enum_1.UserRoles.SubAdmin) {
            const zonesAdmin = yield (0, zone_controller_1.getZonesByAdmin)(data.id);
            logbooks = yield logbook_model_1.default.findAndCountAll({
                where: { is_deleted: 0, zone_id: zoneId === 0 ? { [sequelize_1.Op.in]: zonesAdmin } : zoneId },
                attributes: ['id', 'date_until', 'hour_until', 'status'],
                include: [
                    {
                        model: user_model_1.default,
                        as: 'user',
                        attributes: ['id', 'full_name', 'phone', 'email', 'identification'],
                        where: { full_name: searchName ? { [sequelize_1.Op.substring]: searchName } : { [sequelize_1.Op.not]: null } },
                    },
                    {
                        model: PoliticaDivision_model_1.default,
                        as: 'zone',
                        attributes: ['id', 'name'],
                    },
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
            });
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
            logbooks = yield logbook_model_1.default.findAndCountAll({
                where: { is_deleted: 0, subzone_id: { [sequelize_1.Op.in]: subzones } },
                attributes: ['id', 'date_until', 'hour_until', 'status'],
                include: [
                    {
                        model: user_model_1.default,
                        as: 'user',
                        attributes: ['id', 'full_name', 'phone', 'email', 'identification'],
                        where: { full_name: searchName ? { [sequelize_1.Op.substring]: searchName } : { [sequelize_1.Op.not]: null } },
                    },
                    {
                        model: PoliticaDivision_model_1.default,
                        as: 'zone',
                        attributes: ['id', 'name'],
                    },
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
            });
        }
        if (!logbooks)
            return (0, customResponses_1.customResponse)(false, res, 404, `No se encontraron registros`, null);
        logbooks.rows.map((log, idx) => {
            log.get().rowNumber = parseInt(offset) + idx + 1;
        });
        (0, customResponses_1.customResponse)(true, res, 200, logbooks.count > 0 ? `Solicitudes encontradas` : 'No se encontraron registros', logbooks);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getAllLogbooks = getAllLogbooks;
const getLogbookById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        const { idLogbook } = req.params;
        if (data.role_id !== user_enum_1.UserRoles.SubAdmin && data.role_id !== user_enum_1.UserRoles.Superadmin && data.role_id !== user_enum_1.UserRoles.Subscriber)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        const logbook = yield logbook_model_1.default.findOne({
            where: { id: idLogbook, is_deleted: 0 },
            attributes: ['id', 'date_until', 'hour_until', 'status', 'created_at'],
            include: [
                {
                    model: user_model_1.default,
                    attributes: ['id', 'full_name', 'phone', 'email'],
                },
                {
                    model: coordsLogbook_model_1.default,
                    attributes: ['id', 'lat', 'lng', 'created_at', 'address'],
                    order: [['created_at', 'id']],
                },
            ],
        });
        (0, customResponses_1.customResponse)(true, res, 200, logbook ? `Solicitudes encontradas` : 'No se encontraron registros', logbook);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getLogbookById = getLogbookById;
const getMylastLogbook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        if (data.role_id !== user_enum_1.UserRoles.User)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        const logbook = yield logbook_model_1.default.findAll({
            where: { is_deleted: 0, user_id: data.id, status: { [sequelize_1.Op.notIn]: ['completed', 'cancel'] } },
            attributes: ['id', 'date_until', 'hour_until', 'status', 'created_at'],
            include: [
                {
                    model: PoliticaDivision_model_1.default,
                    attributes: ['id', 'name'],
                    as: 'zone',
                },
                {
                    model: coordsLogbook_model_1.default,
                    attributes: ['id', 'lat', 'lng', 'created_at', 'address'],
                    include: [
                        {
                            model: mediaCoordsLogbook_model_1.default,
                            attributes: ['url'],
                            as: 'photos',
                        },
                    ],
                },
            ],
            order: [['created_at', 'DESC']],
            limit: 1,
        });
        if (logbook.length === 0)
            return (0, customResponses_1.customResponse)(false, res, 401, `No existen registros`, logbook);
        for (const coord of logbook[0].get().coords_logbooks) {
            for (const media of coord.photos) {
                media.url = yield (0, gc_storage_1.generateSignedUrlGCS)(media.url, 'logbooks');
            }
        }
        (0, customResponses_1.customResponse)(true, res, 200, `Solicitud encontrada`, logbook[0]);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getMylastLogbook = getMylastLogbook;
const getPhotosByPointId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        const { idCoord } = req.params;
        if (data.role_id !== user_enum_1.UserRoles.SubAdmin && data.role_id !== user_enum_1.UserRoles.User && data.role_id !== user_enum_1.UserRoles.Subscriber)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        const logbook = yield mediaCoordsLogbook_model_1.default.findAll({
            where: { coord_logbook_id: idCoord, is_deleted: 0 },
            attributes: ['id', 'url', 'created_at'],
        });
        for (let log of logbook) {
            log.get().url = yield (0, gc_storage_1.generateSignedUrlGCS)(log.get().url, 'logbooks');
        }
        (0, customResponses_1.customResponse)(true, res, 200, logbook.length > 0 ? `Fotos encontradas` : 'No se encontraron registros', logbook);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getPhotosByPointId = getPhotosByPointId;
const updateLogbook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, status } = req.body;
        const { id } = req.params;
        if (status !== 'cancel' && status !== 'completed')
            return (0, customResponses_1.customResponse)(false, res, 401, `Solo puede completar o cancelar`, null);
        if (data.role_id !== user_enum_1.UserRoles.User)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        const log = yield logbook_model_1.default.findOne({
            where: {
                id: parseInt(id),
            },
        });
        if (!log) {
            return (0, customResponses_1.customResponse)(false, res, 400, `No existe la bitocora`, null);
        }
        yield log.update({ status });
        (0, customResponses_1.customResponse)(true, res, 200, 'Bitacora actualizada', log);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.updateLogbook = updateLogbook;
const getLogbookHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        const { limit, offset } = req.params;
        if (data.role_id !== user_enum_1.UserRoles.User)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        const logbooks = yield logbook_model_1.default.findAndCountAll({
            where: {
                user_id: data.id,
                status: { [sequelize_1.Op.in]: ['completed'] },
                is_deleted: 0,
            },
            attributes: ['id', 'date_until', 'hour_until', 'status', 'created_at'],
            include: [
                {
                    model: PoliticaDivision_model_1.default,
                    attributes: ['id', 'name'],
                    as: 'zone',
                },
                {
                    model: coordsLogbook_model_1.default,
                    attributes: ['id', 'lat', 'lng', 'created_at', 'address'],
                    include: [
                        {
                            model: mediaCoordsLogbook_model_1.default,
                            attributes: ['url'],
                            as: 'photos',
                        },
                    ],
                },
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
        for (let log of logbooks.rows) {
            for (const coord of log.get().coords_logbooks) {
                for (const p of coord.photos) {
                    p.url = yield (0, gc_storage_1.generateSignedUrlGCS)(p.url, 'logbooks');
                }
            }
        }
        (0, customResponses_1.customResponse)(true, res, 200, logbooks.count > 0 ? 'Denuncias encontradas' : 'No existen denuncias', logbooks);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getLogbookHistory = getLogbookHistory;
//# sourceMappingURL=logobook.controller.js.map