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
exports.validatorOnlyJWT = exports.validatorJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const customResponses_1 = require("../helpers/customResponses");
const rol_model_1 = __importDefault(require("../models/rol.model"));
const typeASC_model_1 = __importDefault(require("../models/typeASC.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const PoliticaDivision_model_1 = __importDefault(require("../models/PoliticaDivision.model"));
const subzone_model_1 = __importDefault(require("../models/subzone.model"));
const user_enum_1 = require("../enums/user.enum");
const subscription_model_1 = __importDefault(require("../models/subscription.model"));
/**
 * Comprueba si el token está presente en la solicitud, si lo está, lo verifica y si es válido, agrega
 * los datos del usuario al cuerpo de la solicitud.
 * @param {Request} req - Solicitud: el objeto de la solicitud.
 * @param {Response} res - El objeto de respuesta.
 * @param {NextFunction} next - Esta es una función a la que llamamos cuando queremos pasar al
 * siguiente middleware.
 * @returns una función que se está utilizando como middleware.
 */
const validatorJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Authorization = req.header('Authorization');
        if (!Authorization) {
            return res.status(401).json({
                msg: 'No hay el token en la petición',
            });
        }
        const { object } = jsonwebtoken_1.default.verify(Authorization, `${process.env.SECRETORPRIVATEKEY}`);
        const { id } = object;
        const user = yield user_model_1.default.findOne({
            where: { id, is_active: 1, is_deleted: 0 },
            attributes: { exclude: ['accessed_at', 'is_deleted', 'password', 'updated_at'] },
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
                    model: subzone_model_1.default,
                    attributes: ['id', 'name'],
                    as: 'subzone',
                },
                {
                    model: typeASC_model_1.default,
                    attributes: ['id', 'asc_name'],
                },
                {
                    model: subscription_model_1.default,
                    attributes: ['id', 'num_asc', 'num_subzones', 'total', 'date_expiration', 'state'],
                },
            ],
        });
        if (!user) {
            return (0, customResponses_1.customResponse)(false, res, 401, 'Acceso denegado', null);
        }
        if (req.originalUrl === '/api/subscription/payment') {
            req.body.data = user.toJSON();
            return next();
        }
        if (user.get().role_id === user_enum_1.UserRoles.Subscriber) {
            if (user.get().subscription.state === false) {
                return (0, customResponses_1.customResponse)(false, res, 402, 'Tu suscripción ha expirado, renuevala', user.toJSON());
            }
            const dateExpiration = new Date(user.get().subscription.date_expiration);
            const now = new Date();
            if (dateExpiration < now) {
                yield subscription_model_1.default.update({ state: false }, { where: { user_id: id } });
                return (0, customResponses_1.customResponse)(false, res, 402, 'Tu suscripción ha expirado, renuevala', user.toJSON());
            }
        }
        req.body.data = user.toJSON();
        next();
    }
    catch (error) {
        console.log(error);
        return (0, customResponses_1.customResponse)(false, res, 401, 'Acceso denegado', null);
    }
});
exports.validatorJWT = validatorJWT;
const validatorOnlyJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Authorization = req.header('Authorization');
        if (!Authorization) {
            return res.status(401).json({
                msg: 'No hay el token en la petición',
            });
        }
        const { object } = jsonwebtoken_1.default.verify(Authorization, `${process.env.SECRETORPRIVATEKEY}`);
        const { id } = object;
        const user = yield user_model_1.default.findOne({
            where: { id, is_active: 1, is_deleted: 0 },
            attributes: { exclude: ['accessed_at', 'is_deleted', 'password', 'updated_at'] },
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
                    model: subzone_model_1.default,
                    attributes: ['id', 'name'],
                    as: 'subzone',
                },
                {
                    model: typeASC_model_1.default,
                    attributes: ['id', 'asc_name'],
                },
                {
                    model: subscription_model_1.default,
                    attributes: ['id', 'num_asc', 'num_subzones', 'total', 'date_expiration', 'state'],
                },
            ],
        });
        if (!user) {
            return (0, customResponses_1.customResponse)(false, res, 401, 'Acceso denegado', null);
        }
        if (req.originalUrl === '/api/subscription/payment') {
            req.body.data = user.toJSON();
            return next();
        }
        req.body.data = user.toJSON();
        next();
    }
    catch (error) {
        console.log(error);
        return (0, customResponses_1.customResponse)(false, res, 401, 'Acceso denegado', null);
    }
});
exports.validatorOnlyJWT = validatorOnlyJWT;
//# sourceMappingURL=validator-jwt.middlewares.js.map