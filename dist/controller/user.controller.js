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
exports.getAvatars = exports.getPaymentsByUserId = exports.updateAvailableAsc = exports.updateSubzoneByUserId = exports.getUserStatusAssignedById = exports.getUserByIdAndIsActive = exports.getUserSuperAdmin = exports.getUserByIdForExpoNotification = exports.getASCBySubZoneId = exports.getASCByZoneId = exports.getASCOnline = exports.getAscBySubzone = exports.getAscByZone = exports.getUsersFiveKmAround = exports.updateAddressAndCoords = exports.updateOfflineUser = exports.updateOnlineUser = exports.updateInfoUser = exports.deleteUser = exports.changeStatusUserById = exports.getUsers = exports.geInfotUserLogged = exports.getUserById = void 0;
const rol_model_1 = __importDefault(require("../models/rol.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const customResponses_1 = require("../helpers/customResponses");
const typeASC_model_1 = __importDefault(require("../models/typeASC.model"));
const sequelize_1 = require("sequelize");
const sendEmail_1 = require("../helpers/sendEmail");
const userEmails_1 = require("../templates/userEmails");
const PoliticaDivision_model_1 = __importDefault(require("../models/PoliticaDivision.model"));
const detailZonesSubAdmin_model_1 = __importDefault(require("../models/detailZonesSubAdmin.model"));
const findCity_1 = require("../helpers/findCity");
const geoLibMethods_1 = require("../helpers/geoLibMethods");
const complaint_model_1 = __importDefault(require("../models/complaint.model"));
const helpRequest_model_1 = __importDefault(require("../models/helpRequest.model"));
const logbook_model_1 = __importDefault(require("../models/logbook.model"));
const user_enum_1 = require("../enums/user.enum");
const utils_1 = require("../helpers/utils");
const ascSubscriber_model_1 = __importDefault(require("../models/ascSubscriber.model"));
const subzone_model_1 = __importDefault(require("../models/subzone.model"));
const subscription_model_1 = __importDefault(require("../models/subscription.model"));
const gc_storage_1 = require("../helpers/gc-storage");
const upload_file_1 = require("../helpers/upload-file");
const payment_model_1 = __importDefault(require("../models/payment.model"));
const polygon_model_1 = __importDefault(require("../models/polygon.model"));
/**
 * Obtiene un usuario por id y devuelve el usuario con el rol, la zona y el tipo ASC asociado
 */
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield user_model_1.default.findOne({
            where: { id, is_active: 1, is_deleted: 0 },
            attributes: ['id', 'address', 'email', 'full_name', 'identification', 'online', 'phone', 'photo_home', 'photo_id_back', 'photo_id_front', 'photo_profile', 'whatsapp_group'],
            include: [
                {
                    model: rol_model_1.default,
                    attributes: ['id', 'rol_name'],
                },
                {
                    model: PoliticaDivision_model_1.default,
                    attributes: ['id', 'name', 'code'],
                    as: 'zone',
                },
                {
                    model: typeASC_model_1.default,
                    attributes: ['id', 'asc_name'],
                },
            ],
        });
        if (!user) {
            return (0, customResponses_1.customResponse)(false, res, 401, 'no existe el usuario', null);
        }
        (0, customResponses_1.customResponse)(true, res, 200, `Usuario encontrado`, user);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getUserById = getUserById;
/**
 * Recibe una solicitud y una respuesta, y devuelve una respuesta personalizada con los datos recibidos
 * en el cuerpo de la solicitud.
 */
const geInfotUserLogged = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        if (!data) {
            return (0, customResponses_1.customResponse)(false, res, 401, 'Email o contraseña incorrectos', null);
        }
        if (data.role_id === user_enum_1.UserRoles.ASC) {
        }
        data.photo_home = data.photo_home ? yield (0, gc_storage_1.generateSignedUrlGCS)(data.photo_home, 'users') : data.photo_home;
        data.photo_id_back = data.photo_id_back ? yield (0, gc_storage_1.generateSignedUrlGCS)(data.photo_id_back, 'users') : data.photo_id_back;
        data.photo_id_front = data.photo_id_front ? yield (0, gc_storage_1.generateSignedUrlGCS)(data.photo_id_front, 'users') : data.photo_id_front;
        data.photo_profile = data.photo_profile ? yield (0, gc_storage_1.generateSignedUrlGCS)(data.photo_profile, (0, utils_1.getFolderUserPhotoProfile)(data.photo_profile)) : data.photo_profile;
        const subscription = data.role_id === user_enum_1.UserRoles.Subscriber
            ? yield subscription_model_1.default.findOne({
                attributes: ['id', 'num_asc', `num_subzones`, `total`, 'date_expiration'],
                where: { user_id: data.id, state: 1, is_deleted: 0 },
            })
            : null;
        (0, customResponses_1.customResponse)(true, res, 200, `Usuario encontrado`, Object.assign(Object.assign({}, data), { subscription }));
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.geInfotUserLogged = geInfotUserLogged;
/**
 * Estoy tratando de obtener todos los usuarios de una base de datos, pero quiero filtrarlos por
 * zoneId, roleId, isActive, searchName, limit, offset y data
 */
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { zoneId, subzoneId, roleId, isActive, searchName, limit, offset, data } = req.body;
        if (data.role_id !== user_enum_1.UserRoles.Superadmin && data.role_id !== user_enum_1.UserRoles.SubAdmin && data.role_id !== user_enum_1.UserRoles.Subscriber)
            return (0, customResponses_1.customResponse)(false, res, 404, 'No tiene autorización para esta petición', null);
        let users;
        if (data.role_id === user_enum_1.UserRoles.Subscriber) {
            const subzones = [];
            if (subzoneId) {
                const subzone = yield subzone_model_1.default.findOne({
                    where: {
                        id: subzoneId,
                        subs_id: data.subscription.id,
                    },
                });
                if (!subzone)
                    return (0, customResponses_1.customResponse)(false, res, 404, 'No existe la subzona', null);
                subzones.push(subzone.get().id);
            }
            else {
                const subzonesDB = yield subzone_model_1.default.findAll({
                    where: {
                        subs_id: data.subscription.id,
                    },
                });
                if (subzonesDB.length > 0) {
                    subzonesDB.forEach((subzone) => {
                        subzones.push(subzone.get().id);
                    });
                }
            }
            users = yield user_model_1.default.findAndCountAll({
                where: {
                    id: { [sequelize_1.Op.ne]: data.id },
                    role_id: {
                        [sequelize_1.Op.and]: [
                            //
                            { [sequelize_1.Op.ne]: user_enum_1.UserRoles.Subscriber },
                            roleId ? { [sequelize_1.Op.in]: roleId } : { [sequelize_1.Op.ne]: null },
                        ],
                    },
                    is_active: isActive !== null ? isActive : { [sequelize_1.Op.not]: null },
                    is_deleted: 0,
                    subzone_id: { [sequelize_1.Op.in]: subzones },
                    full_name: searchName ? { [sequelize_1.Op.substring]: searchName } : { [sequelize_1.Op.not]: null },
                },
                attributes: ['id', 'full_name', 'email', 'is_active', 'phone', 'photo_home', 'photo_id_back', 'photo_id_front', 'photo_profile', 'lat', 'lng', 'created_at'],
                include: [
                    {
                        model: rol_model_1.default,
                        attributes: ['id', 'rol_name'],
                    },
                    {
                        model: PoliticaDivision_model_1.default,
                        as: 'zone',
                        attributes: ['id', 'name', 'code'],
                    },
                    {
                        model: subzone_model_1.default,
                        as: 'subzone',
                        attributes: ['id', 'name'],
                    },
                    {
                        model: detailZonesSubAdmin_model_1.default,
                        attributes: ['id', 'is_active'],
                        include: [
                            {
                                model: PoliticaDivision_model_1.default,
                                as: 'city',
                                attributes: ['id', 'name', 'code'],
                                include: [
                                    {
                                        model: PoliticaDivision_model_1.default,
                                        as: 'province',
                                        attributes: ['id', 'name', 'code'],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        model: complaint_model_1.default,
                        attributes: ['id'],
                    },
                ],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['created_at', 'DESC']],
            });
        }
        if (data.role_id === user_enum_1.UserRoles.Superadmin) {
            if (zoneId) {
                if (subzoneId) {
                    users = yield user_model_1.default.findAndCountAll({
                        where: {
                            id: { [sequelize_1.Op.ne]: data.id },
                            role_id: { [sequelize_1.Op.and]: [{ [sequelize_1.Op.ne]: data.role_id }, roleId ? { [sequelize_1.Op.in]: roleId } : { [sequelize_1.Op.ne]: null }] },
                            is_active: isActive !== null ? isActive : { [sequelize_1.Op.not]: null },
                            is_deleted: 0,
                            zone_id: zoneId,
                            subzone_id: subzoneId,
                            full_name: searchName ? { [sequelize_1.Op.substring]: searchName } : { [sequelize_1.Op.not]: null },
                        },
                        attributes: ['id', 'full_name', 'email', 'is_active', 'phone', 'photo_home', 'photo_id_back', 'photo_id_front', 'photo_profile', 'lat', 'lng', 'created_at'],
                        include: [
                            {
                                model: rol_model_1.default,
                                attributes: ['id', 'rol_name'],
                            },
                            {
                                model: PoliticaDivision_model_1.default,
                                as: 'zone',
                                attributes: ['id', 'name', 'code'],
                            },
                            {
                                model: subzone_model_1.default,
                                as: 'subzone',
                                attributes: ['id', 'name'],
                            },
                            {
                                model: detailZonesSubAdmin_model_1.default,
                                attributes: ['id', 'is_active'],
                                include: [
                                    {
                                        model: PoliticaDivision_model_1.default,
                                        as: 'city',
                                        attributes: ['id', 'name', 'code'],
                                        include: [
                                            {
                                                model: PoliticaDivision_model_1.default,
                                                as: 'province',
                                                attributes: ['id', 'name', 'code'],
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                model: complaint_model_1.default,
                                attributes: ['id'],
                            },
                            {
                                model: subscription_model_1.default,
                                as: 'subscription',
                                attributes: ['id', 'state', 'photo_ticket'],
                            },
                        ],
                        limit: parseInt(limit),
                        offset: parseInt(offset),
                        order: [['created_at', 'DESC']],
                    });
                }
                else {
                    users = yield user_model_1.default.findAndCountAll({
                        where: {
                            id: { [sequelize_1.Op.ne]: data.id },
                            role_id: { [sequelize_1.Op.and]: [{ [sequelize_1.Op.ne]: data.role_id }, roleId ? { [sequelize_1.Op.in]: roleId } : { [sequelize_1.Op.ne]: null }] },
                            is_active: isActive !== null ? isActive : { [sequelize_1.Op.not]: null },
                            is_deleted: 0,
                            zone_id: zoneId,
                            full_name: searchName ? { [sequelize_1.Op.substring]: searchName } : { [sequelize_1.Op.not]: null },
                        },
                        attributes: ['id', 'full_name', 'email', 'is_active', 'phone', 'photo_home', 'photo_id_back', 'photo_id_front', 'photo_profile', 'lat', 'lng', 'created_at'],
                        include: [
                            {
                                model: rol_model_1.default,
                                attributes: ['id', 'rol_name'],
                            },
                            {
                                model: PoliticaDivision_model_1.default,
                                as: 'zone',
                                attributes: ['id', 'name', 'code'],
                            },
                            {
                                model: subzone_model_1.default,
                                as: 'subzone',
                                attributes: ['id', 'name'],
                            },
                            {
                                model: detailZonesSubAdmin_model_1.default,
                                attributes: ['id', 'is_active'],
                                include: [
                                    {
                                        model: PoliticaDivision_model_1.default,
                                        as: 'city',
                                        attributes: ['id', 'name', 'code'],
                                        include: [
                                            {
                                                model: PoliticaDivision_model_1.default,
                                                as: 'province',
                                                attributes: ['id', 'name', 'code'],
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                model: complaint_model_1.default,
                                attributes: ['id'],
                            },
                            {
                                model: subscription_model_1.default,
                                as: 'subscription',
                                attributes: ['id', 'state', 'photo_ticket'],
                            },
                        ],
                        limit: parseInt(limit),
                        offset: parseInt(offset),
                        order: [['created_at', 'DESC']],
                    });
                }
            }
            else {
                users = yield user_model_1.default.findAndCountAll({
                    where: {
                        id: { [sequelize_1.Op.ne]: data.id },
                        role_id: { [sequelize_1.Op.and]: [{ [sequelize_1.Op.ne]: data.role_id === 1 ? 1 : data.role_id === 2 ? [1, 2] : null }, roleId ? { [sequelize_1.Op.in]: roleId } : { [sequelize_1.Op.ne]: null }] },
                        is_active: isActive !== null ? isActive : { [sequelize_1.Op.not]: null },
                        is_deleted: 0,
                        full_name: searchName ? { [sequelize_1.Op.substring]: searchName } : { [sequelize_1.Op.not]: null },
                    },
                    attributes: ['id', 'full_name', 'email', 'is_active', 'phone', 'photo_home', 'photo_id_back', 'photo_id_front', 'photo_profile', 'lat', 'lng', 'created_at'],
                    include: [
                        {
                            model: rol_model_1.default,
                            attributes: ['id', 'rol_name'],
                        },
                        {
                            model: PoliticaDivision_model_1.default,
                            as: 'zone',
                            attributes: ['id', 'name', 'code'],
                        },
                        {
                            model: subzone_model_1.default,
                            as: 'subzone',
                            attributes: ['id', 'name'],
                        },
                        {
                            model: detailZonesSubAdmin_model_1.default,
                            attributes: ['id', 'is_active'],
                            include: [
                                {
                                    model: PoliticaDivision_model_1.default,
                                    as: 'city',
                                    attributes: ['id', 'name', 'code'],
                                    include: [
                                        {
                                            model: PoliticaDivision_model_1.default,
                                            as: 'province',
                                            attributes: ['id', 'name', 'code'],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            model: complaint_model_1.default,
                            attributes: ['id'],
                        },
                        {
                            model: helpRequest_model_1.default,
                            attributes: ['id'],
                        },
                        {
                            model: subscription_model_1.default,
                            as: 'subscription',
                            attributes: ['id', 'state', 'photo_ticket'],
                        },
                    ],
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    order: [['created_at', 'DESC']],
                });
            }
        }
        if (data.role_id === user_enum_1.UserRoles.SubAdmin) {
            users = zoneId
                ? yield user_model_1.default.findAndCountAll({
                    where: {
                        id: { [sequelize_1.Op.ne]: data.id },
                        role_id: { [sequelize_1.Op.and]: [{ [sequelize_1.Op.ne]: data.role_id }, roleId ? { [sequelize_1.Op.in]: roleId } : { [sequelize_1.Op.ne]: null }] },
                        is_active: isActive !== null ? isActive : { [sequelize_1.Op.not]: null },
                        is_deleted: 0,
                        zone_id: zoneId,
                        full_name: searchName ? { [sequelize_1.Op.substring]: searchName } : { [sequelize_1.Op.not]: null },
                    },
                    attributes: ['id', 'full_name', 'email', 'is_active', 'phone', 'photo_home', 'photo_id_back', 'photo_id_front', 'photo_profile', 'lat', 'lng', 'created_at'],
                    include: [
                        {
                            model: rol_model_1.default,
                            attributes: ['id', 'rol_name'],
                        },
                        {
                            model: PoliticaDivision_model_1.default,
                            as: 'zone',
                            attributes: ['id', 'name', 'code'],
                        },
                        {
                            model: subzone_model_1.default,
                            as: 'subzone',
                            attributes: ['id', 'name'],
                        },
                        {
                            model: detailZonesSubAdmin_model_1.default,
                            attributes: ['id', 'is_active'],
                            include: [
                                {
                                    model: PoliticaDivision_model_1.default,
                                    as: 'city',
                                    attributes: ['id', 'name', 'code'],
                                    include: [
                                        {
                                            model: PoliticaDivision_model_1.default,
                                            as: 'province',
                                            attributes: ['id', 'name', 'code'],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            model: complaint_model_1.default,
                            attributes: ['id'],
                        },
                    ],
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    order: [['created_at', 'DESC']],
                })
                : yield user_model_1.default.findAndCountAll({
                    where: {
                        id: { [sequelize_1.Op.ne]: data.id },
                        role_id: { [sequelize_1.Op.and]: [{ [sequelize_1.Op.ne]: data.role_id === 1 ? 1 : data.role_id === 2 ? [1, 2] : null }, roleId ? { [sequelize_1.Op.in]: roleId } : { [sequelize_1.Op.ne]: null }] },
                        is_active: isActive !== null ? isActive : { [sequelize_1.Op.not]: null },
                        is_deleted: 0,
                        full_name: searchName ? { [sequelize_1.Op.substring]: searchName } : { [sequelize_1.Op.not]: null },
                    },
                    attributes: ['id', 'full_name', 'email', 'is_active', 'phone', 'photo_home', 'photo_id_back', 'photo_id_front', 'photo_profile', 'lat', 'lng', 'created_at'],
                    include: [
                        {
                            model: rol_model_1.default,
                            attributes: ['id', 'rol_name'],
                        },
                        {
                            model: PoliticaDivision_model_1.default,
                            as: 'zone',
                            attributes: ['id', 'name', 'code'],
                        },
                        {
                            model: subzone_model_1.default,
                            as: 'subzone',
                            attributes: ['id', 'name'],
                        },
                        {
                            model: detailZonesSubAdmin_model_1.default,
                            attributes: ['id', 'is_active'],
                            include: [
                                {
                                    model: PoliticaDivision_model_1.default,
                                    as: 'city',
                                    attributes: ['id', 'name', 'code'],
                                    include: [
                                        {
                                            model: PoliticaDivision_model_1.default,
                                            as: 'province',
                                            attributes: ['id', 'name', 'code'],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            model: complaint_model_1.default,
                            attributes: ['id'],
                        },
                        {
                            model: helpRequest_model_1.default,
                            attributes: ['id'],
                        },
                    ],
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    order: [['created_at', 'DESC']],
                });
        }
        if (users.count === 0)
            return (0, customResponses_1.customResponse)(false, res, 404, 'No existen registro de usuarios', null);
        users.rows.map((user, idx) => {
            user.get().rowNumber = offset + idx + 1;
        });
        for (const user of users.rows) {
            const countCancelLogBook = yield logbook_model_1.default.count({
                where: {
                    user_id: user.get().id,
                    status: 'cancel',
                },
            });
            const countCancelHelp = yield helpRequest_model_1.default.count({
                where: {
                    cancel_user_id: user.get().id,
                    status: 'cancel',
                },
            });
            const countCancelComplaint = yield complaint_model_1.default.count({
                where: {
                    cancel_user_id: user.get().id,
                    status: 'cancel',
                },
            });
            user.get().countCancel = countCancelLogBook + countCancelHelp + countCancelComplaint;
            user.get().photo_home = user.get().photo_home ? yield (0, gc_storage_1.generateSignedUrlGCS)(user.get().photo_home, 'users') : '';
            user.get().photo_id_back = user.get().photo_id_back ? yield (0, gc_storage_1.generateSignedUrlGCS)(user.get().photo_id_back, 'users') : '';
            user.get().photo_id_front = user.get().photo_id_front ? yield (0, gc_storage_1.generateSignedUrlGCS)(user.get().photo_id_front, 'users') : '';
            user.get().photo_profile = user.get().photo_profile ? yield (0, gc_storage_1.generateSignedUrlGCS)(user.get().photo_profile, (0, utils_1.getFolderUserPhotoProfile)(user.get().photo_profile)) : '';
            if (user.get().subscription)
                user.get().subscription.photo_ticket = user.get().subscription.photo_ticket ? yield (0, gc_storage_1.generateSignedUrlGCS)(user.get().subscription.photo_ticket, 'vouchers') : '';
        }
        (0, customResponses_1.customResponse)(true, res, 200, `Usuarios encontrados`, users);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getUsers = getUsers;
/**
 * Cambia el estado de un usuario (activo o inactivo) y envía un correo electrónico al usuario
 * @param {Request} req - Solicitud, res: Respuesta
 * @param {Response} res - Respuesta
 * @returns id del usuario
 */
const changeStatusUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, status, data } = req.body;
        if (data.role_id !== user_enum_1.UserRoles.Superadmin && data.role_id !== user_enum_1.UserRoles.SubAdmin && data.role_id !== user_enum_1.UserRoles.Subscriber)
            return (0, customResponses_1.customResponse)(false, res, 404, 'No tiene autorización para esta petición', null);
        const user = yield user_model_1.default.findOne({
            where: {
                id,
                is_deleted: 0,
            },
            attributes: ['id', 'email', 'full_name', 'role_id', 'is_active', 'role_id', 'subzone_id'],
        });
        if (!user)
            return (0, customResponses_1.customResponse)(false, res, 404, 'No existe el usuario', null);
        if (user.get().role_id === user_enum_1.UserRoles.Subscriber) {
            const subscription = yield subscription_model_1.default.findOne({
                where: {
                    user_id: user.get().id,
                },
            });
            if (!subscription)
                return (0, customResponses_1.customResponse)(false, res, 404, 'No existe la suscripción', null);
            subscription.update({ state: 1 });
        }
        yield user.update({ is_active: status });
        if (user.get().is_active) {
            yield (0, sendEmail_1.sendEmail)(
            //
            'We-u', [user.get().email], 'Su cuenta ha sido activada', `Hola ${user.get().full_name}, su cuenta ha sido activada`, (0, userEmails_1.emailConfirmation)(user.get().full_name, user.get().role_id));
        }
        (0, customResponses_1.customResponse)(true, res, 200, `Usuario actualizado`, user.get().id);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.changeStatusUserById = changeStatusUserById;
/**
 * Elimina un usuario de la base de datos.
 * @param {Request} req - Solicitud
 * @param {Response} res - Respuesta
 * @returns El objeto de usuario
 */
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = req.body;
    try {
        const user = yield user_model_1.default.findOne({
            where: { id: data.id, is_deleted: 0 },
            attributes: ['id', 'role_id'],
        });
        if (!user)
            return (0, customResponses_1.customResponse)(false, res, 404, `No existe el usuario`, null);
        yield user.update({ is_deleted: 1, is_active: 0, subzone_id: null });
        if (user.get().role_id === user_enum_1.UserRoles.Subscriber) {
            const subscription = yield subscription_model_1.default.findOne({
                where: {
                    user_id: user.get().id,
                    is_deleted: 0,
                },
            });
            if (subscription) {
                yield subscription.update({ state: 0, is_deleted: 1 });
                const subzone = yield subzone_model_1.default.findOne({
                    where: {
                        subs_id: subscription.get().id,
                    },
                });
                if (subzone) {
                    yield subzone.update({ is_deleted: 1, state: 0 });
                    yield user_model_1.default.update({ is_active: 0, is_deleted: 1 }, { where: { role_id: user_enum_1.UserRoles.ASC, subzone_id: subzone.get().id } });
                    yield user_model_1.default.update({ subzone_id: null }, { where: { role_id: user_enum_1.UserRoles.User, subzone_id: subzone.get().id } });
                    yield ascSubscriber_model_1.default.destroy({ where: { subscriber_id: subscription.get().id, subzone_id: subzone.get().id } });
                    yield polygon_model_1.default.destroy({ where: { subzone_id: subzone.get().id } });
                }
            }
        }
        (0, customResponses_1.customResponse)(true, res, 200, 'Usuario eliminado', { id: user.get().id, zone_name: user.get().full_name });
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.deleteUser = deleteUser;
const updateInfoUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { data, avatar, expo_token, full_name, phone, whatsapp_group, lat, lng } = req.body;
        const user = yield user_model_1.default.findOne({
            where: { id: data.id, is_deleted: 0, is_active: 1 },
            attributes: ['id'],
        });
        if (!user)
            return (0, customResponses_1.customResponse)(false, res, 404, `No existe el usuario`, null);
        const photo_profile = (_a = req.files) === null || _a === void 0 ? void 0 : _a.photo_profile;
        if (photo_profile) {
            if (photo_profile instanceof Array === true) {
                return (0, customResponses_1.customResponse)(false, res, 400, 'Solo puede subir un archivo', null);
            }
        }
        if (phone) {
            const userPhone = yield user_model_1.default.findOne({
                where: { phone },
                attributes: ['id'],
            });
            if (userPhone) {
                if (userPhone.get().id === data.id) {
                    yield user.update({ phone });
                }
                else {
                    return (0, customResponses_1.customResponse)(false, res, 404, `Ya existe ese numero de teléfono`, null);
                }
            }
        }
        if (photo_profile) {
            // await deleteFileGCS(user.get().photo_profile, 'users');
            const nameFile = `photo_profile_${data.identification}_${(0, utils_1.generateFileName)()}`;
            yield (0, gc_storage_1.uploadFileGCS)(photo_profile, nameFile, 'users');
            const extension = (0, upload_file_1.getExtension)(photo_profile);
            yield user.update({ photo_profile: photo_profile ? `${nameFile}.${extension}` : null });
        }
        else {
            if (avatar)
                yield user.update({ photo_profile: avatar });
        }
        yield user.update({ expo_token, full_name, phone, whatsapp_group, lat, lng });
        return (0, customResponses_1.customResponse)(true, res, 200, `Usuario actualizado`, user);
    }
    catch (error) {
        console.error('---->', error);
        return null;
    }
});
exports.updateInfoUser = updateInfoUser;
const updateOnlineUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findOne({
            where: { id, is_deleted: 0 },
            attributes: ['id', 'full_name', 'role_id'],
        });
        if (!user)
            return null;
        yield user.update({ online: 1 });
        return user;
    }
    catch (error) {
        console.error('---->', error);
        return null;
    }
});
exports.updateOnlineUser = updateOnlineUser;
const updateOfflineUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findOne({
            where: { id, is_deleted: 0 },
            attributes: ['id', 'full_name', 'role_id'],
        });
        if (!user)
            return null;
        yield user.update({ online: 0 });
        return user;
    }
    catch (error) {
        console.error('---->', error);
        return null;
    }
});
exports.updateOfflineUser = updateOfflineUser;
const updateAddressAndCoords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, lat, lng, address, codeCity } = req.body;
        const { idCity } = req.params;
        if (idCity) {
            const city = yield PoliticaDivision_model_1.default.findOne({
                where: { id: parseInt(idCity), id_parent: { [sequelize_1.Op.ne]: null } },
            });
            if (!city)
                return (0, customResponses_1.customResponse)(false, res, 404, 'No existe la zona o ciudad', null);
        }
        const codes = yield (0, findCity_1.findCities)(codeCity);
        const zone_id = codes.length > 0 ? codes[0].id : undefined;
        const user = yield user_model_1.default.findOne({
            where: { id: data.id, is_deleted: 0, is_active: 1 },
            attributes: ['id', 'full_name'],
        });
        if (!user)
            return (0, customResponses_1.customResponse)(false, res, 404, `No existe el usuario`, null);
        yield user.update({ lat, lng, address, zone_id: idCity ? parseInt(idCity) : zone_id, subzone_id: null });
        return (0, customResponses_1.customResponse)(true, res, 200, 'Ubicacion actualizada', user);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.updateAddressAndCoords = updateAddressAndCoords;
const getUsersFiveKmAround = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, lat, lng } = req.body;
        const users = yield user_model_1.default.findAll({
            where: {
                id: { [sequelize_1.Op.ne]: data.id },
                is_active: 1,
                is_deleted: 0,
                role_id: { [sequelize_1.Op.in]: [user_enum_1.UserRoles.ASC, user_enum_1.UserRoles.User] },
            },
            attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile', 'lat', 'lng', 'role_id'],
        });
        if (users.length === 0)
            return (0, customResponses_1.customResponse)(false, res, 404, `No existen usuarios`, null);
        const usersFiltered = users.filter((user) => (0, geoLibMethods_1.verifyDistanceUser)(user.get(), { lat, lng }, 5));
        const asc = usersFiltered.filter((asc) => asc.role_id === 3);
        const citizens = usersFiltered.filter((user) => user.role_id === 4);
        return (0, customResponses_1.customResponse)(true, res, 200, 'Usuarios encontrados', { asc, citizens });
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getUsersFiveKmAround = getUsersFiveKmAround;
/**
 * Retrieves the ASCs by zone ID.
 *
 * This function handles a request to find all ASCs associated with a given zone,
 * identified by its ID. It checks if the user has the correct role to access this information.
 * If the user has the correct role and the zone exists, it retrieves and returns the ASCs.
 * Otherwise, it responds with the appropriate error message.
 *
 * @param req - The incoming request object containing the zone ID in the params and user data in the body.
 * @param res - The outgoing response object used to send back the custom response.
 */
const getAscByZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract user data and zone ID from the request
    const { data } = req.body;
    const { zone_id } = req.params;
    // Check if the user has the role of 'User'
    if (data.role_id !== user_enum_1.UserRoles.User) {
        // If not, deny access and return a 401 response
        return (0, customResponses_1.customResponse)(false, res, 401, 'Acceso denegado', null);
    }
    // Find the zone by ID
    const zone = yield PoliticaDivision_model_1.default.findOne({ where: { id: parseInt(zone_id) } });
    // If the zone does not exist, return a 404 response
    if (!zone) {
        return (0, customResponses_1.customResponse)(false, res, 404, 'No existe la zona', null);
    }
    // Retrieve ASCs by the zone ID
    const ascs = yield yield user_model_1.default.findAll({
        where: {
            zone_id: parseInt(zone_id),
            role_id: 3,
            is_active: 1,
            is_deleted: 0,
        },
        attributes: ['id', 'full_name', 'zone_id', 'identification', 'phone', 'expo_token', 'lat', 'lng'],
    });
    // Return the ASCs found with a 200 response
    return (0, customResponses_1.customResponse)(true, res, 200, 'ASC encontrados por zona', ascs);
});
exports.getAscByZone = getAscByZone;
/**
 * Retrieves ASCs (Agentes de Soporte Comunitario) by a given subzone ID.
 *
 * This function handles the incoming HTTP request to find all ASCs associated
 * with a specified subzone. It first checks if the requesting user has the
 * appropriate role, then it queries the database for the subzone and its ASCs.
 * If the subzone exists and ASCs are found, they are returned in the response.
 *
 * @param req - The incoming request object containing the subzone ID in the params and user data in the body.
 * @param res - The outgoing response object used to send back the custom response.
 */
const getAscBySubzone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract user data and subzone ID from the request
    const { data } = req.body;
    const { subzone_id } = req.params;
    // Check if the user has the role of 'User'
    if (data.role_id !== user_enum_1.UserRoles.User) {
        // If not, deny access and return a 401 response
        return (0, customResponses_1.customResponse)(false, res, 401, 'Acceso denegado', null);
    }
    // Find the subzone by ID and check it's active and not deleted
    const subzone = yield subzone_model_1.default.findOne({
        where: {
            id: parseInt(subzone_id),
            state: 1,
            is_deleted: 0,
        },
    });
    // If the subzone does not exist, return a 404 response
    if (!subzone) {
        return (0, customResponses_1.customResponse)(false, res, 404, 'No existe la subzona', null);
    }
    // Retrieve ASCs by the subzone ID
    const ascs = yield (0, exports.getASCBySubZoneId)(parseInt(subzone_id));
    // Return the ASCs found with a 200 response
    return (0, customResponses_1.customResponse)(true, res, 200, 'ASC encontrados por subzona', ascs);
});
exports.getAscBySubzone = getAscBySubzone;
const getASCOnline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        if (data.role_id !== user_enum_1.UserRoles.SubAdmin && data.role_id !== user_enum_1.UserRoles.Superadmin && data.role_id !== user_enum_1.UserRoles.Subscriber) {
            return (0, customResponses_1.customResponse)(false, res, 401, 'Acceso denegado', null);
        }
        if (data.role_id === user_enum_1.UserRoles.Superadmin) {
            const usersASCOnline = yield user_model_1.default.findAndCountAll({
                where: {
                    is_active: 1,
                    is_deleted: 0,
                    online: 1,
                    role_id: 3,
                },
                attributes: ['id', 'full_name', 'zone_id', 'lat', 'lng', 'email', 'phone', 'photo_profile'],
            });
            for (const user of usersASCOnline.rows) {
                if (user.get().photo_profile)
                    user.get().photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(user.get().photo_profile, (0, utils_1.getFolderUserPhotoProfile)(user.get().photo_profile));
            }
            if (usersASCOnline.rows.length > 0) {
                for (const user of usersASCOnline.rows) {
                    const u = yield (0, exports.getUserStatusAssignedById)(user.get().id);
                    user.get().assigned = u ? u.get().assigned : false;
                }
            }
            return (0, customResponses_1.customResponse)(true, res, 200, `Agentes de control`, usersASCOnline);
        }
        if (data.role_id === user_enum_1.UserRoles.SubAdmin) {
            const zonesAdminstrated = yield detailZonesSubAdmin_model_1.default.findAll({
                where: {
                    user_id: data.id,
                    is_active: 1,
                    is_deleted: 0,
                },
                attributes: ['zone_id'],
            });
            const zones = zonesAdminstrated.map((item) => item.get().zone_id);
            const usersASCOnline = yield user_model_1.default.findAndCountAll({
                where: {
                    is_active: 1,
                    is_deleted: 0,
                    online: 1,
                    role_id: 3,
                    zone_id: { [sequelize_1.Op.in]: zones },
                },
                attributes: ['id', 'full_name', 'zone_id', 'lat', 'lng', 'email', 'phone', 'photo_profile'],
            });
            for (const user of usersASCOnline.rows) {
                if (user.get().photo_profile)
                    user.get().photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(user.get().photo_profile, (0, utils_1.getFolderUserPhotoProfile)(user.get().photo_profile));
            }
            if (usersASCOnline.rows.length > 0) {
                for (const user of usersASCOnline.rows) {
                    const u = yield (0, exports.getUserStatusAssignedById)(user.get().id);
                    user.get().assigned = u ? u.get().assigned : false;
                }
            }
            return (0, customResponses_1.customResponse)(true, res, 200, `Agentes de control`, usersASCOnline);
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
            const usersASCOnline = yield user_model_1.default.findAndCountAll({
                where: {
                    is_active: 1,
                    is_deleted: 0,
                    online: 1,
                    role_id: 3,
                    subzone_id: { [sequelize_1.Op.in]: subzones },
                },
                attributes: ['id', 'full_name', 'zone_id', 'lat', 'lng', 'email', 'phone', 'photo_profile'],
            });
            for (const user of usersASCOnline.rows) {
                if (user.get().photo_profile)
                    user.get().photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(user.get().photo_profile, (0, utils_1.getFolderUserPhotoProfile)(user.get().photo_profile));
            }
            if (usersASCOnline.rows.length > 0) {
                for (const user of usersASCOnline.rows) {
                    const u = yield (0, exports.getUserStatusAssignedById)(user.get().id);
                    user.get().assigned = u ? u.get().assigned : false;
                }
            }
            return (0, customResponses_1.customResponse)(true, res, 200, `Agentes de control`, usersASCOnline);
        }
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getASCOnline = getASCOnline;
const getASCByZoneId = (zone_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.findAll({
        where: {
            zone_id,
            subzone_id: null,
            role_id: 3,
            is_active: 1,
            is_deleted: 0,
        },
        attributes: ['id', 'full_name', 'zone_id', 'identification', 'phone', 'expo_token', 'lat', 'lng'],
    });
});
exports.getASCByZoneId = getASCByZoneId;
const getASCBySubZoneId = (subzone_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.findAll({
        where: {
            subzone_id,
            role_id: 3,
            is_active: 1,
            is_deleted: 0,
        },
        attributes: ['id', 'full_name', 'zone_id', 'identification', 'phone', 'expo_token', 'lat', 'lng'],
    });
});
exports.getASCBySubZoneId = getASCBySubZoneId;
const getUserByIdForExpoNotification = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.findOne({
        where: { id, is_active: 1, is_deleted: 0 },
        attributes: ['id', 'full_name', 'expo_token'],
    });
});
exports.getUserByIdForExpoNotification = getUserByIdForExpoNotification;
const getUserSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.findOne({
        where: { role_id: 1, is_active: 1, is_deleted: 0 },
        attributes: ['id'],
    });
});
exports.getUserSuperAdmin = getUserSuperAdmin;
const getUserByIdAndIsActive = (id, is_active) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.findOne({
        where: { id, is_active, is_deleted: 0 },
        attributes: ['id', 'full_name', 'role_id', 'identification'],
    });
});
exports.getUserByIdAndIsActive = getUserByIdAndIsActive;
const getUserStatusAssignedById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findOne({
        where: {
            id,
            is_active: 1,
            is_deleted: 0,
        },
        attributes: ['id', 'full_name', 'zone_id', 'lat', 'lng', 'email', 'phone', 'photo_profile'],
    });
    if (!user)
        return null;
    if (user.get().photo_profile)
        user.get().photo_profile = yield (0, gc_storage_1.generateSignedUrlGCS)(user.get().photo_profile, (0, utils_1.getFolderUserPhotoProfile)(user.get().photo_profile));
    const helpRequest = yield helpRequest_model_1.default.findOne({
        where: {
            agent_id: id,
            status: 'pending',
        },
        attributes: ['id'],
    });
    const complaint = yield complaint_model_1.default.findOne({
        where: {
            agent_id: id,
            status: 'pending',
        },
        attributes: ['id'],
    });
    const assigned = helpRequest || complaint;
    user.get().assigned = assigned ? true : false;
    return user;
});
exports.getUserStatusAssignedById = getUserStatusAssignedById;
const updateSubzoneByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, zone_id, subzone_id } = req.body;
    if (data.role_id !== user_enum_1.UserRoles.User)
        return (0, customResponses_1.customResponse)(false, res, 401, 'No tiene permisos para realizar esta petición', null);
    const user = yield user_model_1.default.findOne({
        where: { id: data.id, is_deleted: 0, is_active: 1 },
        attributes: ['id'],
    });
    if (!user)
        return (0, customResponses_1.customResponse)(false, res, 404, `No existe el usuario`, null);
    const zone = yield PoliticaDivision_model_1.default.findOne({
        where: { id: zone_id },
        attributes: ['id'],
    });
    if (!zone)
        return (0, customResponses_1.customResponse)(false, res, 404, `No existe la zona`, null);
    const subzone = yield subzone_model_1.default.findOne({
        where: { id: subzone_id, is_deleted: 0, state: 1 },
        attributes: ['id'],
    });
    if (!subzone)
        return (0, customResponses_1.customResponse)(false, res, 404, `No existe la subzona`, null);
    yield user.update({ zone_id: zone.get().id, subzone_id: subzone.get().id });
    (0, customResponses_1.customResponse)(true, res, 200, 'Subzona actualizada', user);
});
exports.updateSubzoneByUserId = updateSubzoneByUserId;
const updateAvailableAsc = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = req.body;
    if (data.role_id !== user_enum_1.UserRoles.ASC)
        return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
    const user = yield user_model_1.default.findOne({
        where: { id: data.id, is_deleted: 0, is_active: 1 },
        attributes: ['id', 'is_available'],
    });
    if (!user)
        return (0, customResponses_1.customResponse)(false, res, 404, `No existe el usuario`, null);
    yield user.update({ state: !user.get().is_available });
    return (0, customResponses_1.customResponse)(true, res, 200, `Usuario actualizado`, user);
});
exports.updateAvailableAsc = updateAvailableAsc;
/**
 * Retrieves payments made by a specific user
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
const getPaymentsByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idUser } = req.params;
    const { data } = req.body;
    // Check if the user has the subscriber role
    if (data.role_id !== user_enum_1.UserRoles.Superadmin) {
        return (0, customResponses_1.customResponse)(false, res, 401, 'No tiene permisos para realizar esta petición', null);
    }
    // Find the user
    const user = yield user_model_1.default.findOne({
        where: { id: idUser, is_deleted: 0 },
        attributes: ['id', 'address', 'email', 'full_name', 'identification', 'phone'],
        include: [
            {
                model: rol_model_1.default,
                attributes: ['id', 'rol_name'],
            },
            {
                model: PoliticaDivision_model_1.default,
                attributes: ['id', 'name', 'code'],
                as: 'zone',
            },
        ],
    });
    // If the user is not found, return an error response
    if (!user) {
        return (0, customResponses_1.customResponse)(false, res, 401, 'no existe el usuario', null);
    }
    // Find the user's subscription
    const subscription = yield subscription_model_1.default.findOne({
        attributes: { exclude: ['created_at', 'is_deleted', 'updated_at'] },
        where: { user_id: user.get().id, is_deleted: 0 },
    });
    // If the subscription is not found, return an error response
    if (!subscription) {
        return (0, customResponses_1.customResponse)(false, res, 401, 'Suscripción no encontrada', null);
    }
    // Find the payments related to the subscription
    const payments = yield payment_model_1.default.findAll({
        where: { subscription_id: subscription.get().id },
        order: [['created_at', 'DESC']],
    });
    subscription.get().photo_ticket = subscription.get().photo_ticket ? yield (0, gc_storage_1.generateSignedUrlGCS)(subscription.get().photo_ticket, 'vouchers') : '';
    for (const payment of payments) {
        payment.get().voucher = payment.get().voucher ? yield (0, gc_storage_1.generateSignedUrlGCS)(payment.get().voucher, 'vouchers') : '';
    }
    // Return a success response with the subscription and payments
    return (0, customResponses_1.customResponse)(true, res, 200, 'Usuario', { user, subscription, payments });
});
exports.getPaymentsByUserId = getPaymentsByUserId;
const getAvatars = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const avatares = yield (0, gc_storage_1.getFilesNameFromFolder)('avatars');
    if (avatares.length === 0)
        return (0, customResponses_1.customResponse)(false, res, 404, 'No existen avatares', null);
    const urlsAndNameFiles = yield Promise.all(avatares
        .filter((avatar) => avatar !== '')
        .map((avatar) => __awaiter(void 0, void 0, void 0, function* () {
        if (avatar) {
            return { url: yield (0, gc_storage_1.generateSignedUrlGCS)(avatar, 'avatars'), name: avatar };
        }
    })));
    return (0, customResponses_1.customResponse)(true, res, 200, 'Avatares', urlsAndNameFiles);
});
exports.getAvatars = getAvatars;
//# sourceMappingURL=user.controller.js.map