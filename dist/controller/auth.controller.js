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
exports.decodeToken = exports.generaToken = exports.sendEmailExample = exports.sendEmailResetPassword = exports.resetPassword = exports.confirmAccount = exports.renewToken = exports.loginAdmin = exports.registerUsers = exports.loginSMS = exports.login = void 0;
const generate_jwt_1 = require("./../helpers/generate-jwt");
const sendEmail_1 = require("./../helpers/sendEmail");
const customResponses_1 = require("../helpers/customResponses");
const password_1 = require("../helpers/password");
const user_model_1 = __importDefault(require("../models/user.model"));
const authEmails_1 = require("../templates/authEmails");
const sequelize_1 = require("sequelize");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utils_1 = require("../helpers/utils");
const user_enum_1 = require("../enums/user.enum");
const code_model_1 = __importDefault(require("../models/code.model"));
const twillio_1 = require("../helpers/twillio");
const upload_file_1 = require("../helpers/upload-file");
/**
 * Inicia sesión en un usuario
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield user_model_1.default.findOne({
            where: { email, is_deleted: 0, role_id: { [sequelize_1.Op.not]: [user_enum_1.UserRoles.Superadmin, user_enum_1.UserRoles.SubAdmin, user_enum_1.UserRoles.Subscriber] } },
        });
        if (!user) {
            return (0, customResponses_1.customResponse)(false, res, 401, 'Email o contraseña incorrectos', null);
        }
        const validate = (0, password_1.ValidadPassword)(password, user.getDataValue('password'));
        if (!validate) {
            return (0, customResponses_1.customResponse)(false, res, 401, 'Email o contraseña incorrectos', null);
        }
        if (!user.get().is_active) {
            if (user.get().role_id === 4) {
                return (0, customResponses_1.customResponse)(false, res, 401, 'Te enviamos un correo electrónico para confirmar y activar la cuenta, por favor revise su bandeja de entrada', null);
            }
            if (user.get().role_id === 3) {
                return (0, customResponses_1.customResponse)(false, res, 401, 'Tu cuenta esta inactiva. Espera que el adiministrador active tu cuenta.', null);
            }
        }
        yield user.update({ accessed_at: new Date() });
        const token = yield (0, generate_jwt_1.generateJWTObjectWhiteTime)({ id: user.get().id, full_name: user.get().full_name }, '1d');
        (0, customResponses_1.customResponse)(true, res, 200, `Bienvenido`, { token });
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.login = login;
const loginSMS = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone } = req.body;
    const user = yield user_model_1.default.findOne({
        where: { phone, is_deleted: 0, role_id: { [sequelize_1.Op.not]: [1, 2] } },
    });
    if (!user) {
        return (0, customResponses_1.customResponse)(false, res, 401, 'No se encuentro el usuario', null);
    }
    if (!user.get().is_active) {
        if (user.get().role_id === user_enum_1.UserRoles.User) {
            return (0, customResponses_1.customResponse)(false, res, 401, 'Te enviamos un correo electrónico para confirmar y activar la cuenta, por favor revise su bandeja de entrada', null);
        }
        if (user.get().role_id === user_enum_1.UserRoles.ASC) {
            return (0, customResponses_1.customResponse)(false, res, 401, 'Tu cuenta esta inactiva. Espera que el administrador active tu cuenta.', null);
        }
    }
    // await user.update({ accessed_at: new Date() });
    const codeGenerated = (0, utils_1.generatorCode)();
    yield code_model_1.default.create({
        code: codeGenerated,
        user_id: user.get().id,
    });
    yield (0, twillio_1.sendSMS)({ msg: codeGenerated, to: user.get().phone });
    (0, customResponses_1.customResponse)(true, res, 200, `Le enviamos un mensaje de con un código para iniciar sesión`, undefined);
});
exports.loginSMS = loginSMS;
/**
 * Crea un nuevo usuario
 */
const registerUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { address, avatar, email, full_name, identification, lat, lng, password, phone, role_id, type_asc_id, whatsapp_group, zone_id } = req.body;
        const photo_profile = (_a = req.files) === null || _a === void 0 ? void 0 : _a.photo_profile;
        if (photo_profile) {
            if (photo_profile instanceof Array === true) {
                return (0, customResponses_1.customResponse)(false, res, 400, 'Solo puede subir un archivo', null);
            }
        }
        // if (parseInt(role_id) === 3) {
        //   if (type_asc_id === null) {
        //     return customResponse(false, res, 400, `El tipo de agente es requerido`, null);
        //   }
        // }
        if (parseInt(role_id) === 1) {
            const userSuperAdmin = yield user_model_1.default.findOne({ where: { role_id: 1, is_active: 1, is_deleted: 0 } });
            if (userSuperAdmin) {
                return (0, customResponses_1.customResponse)(false, res, 400, `No puede registrar un super administrador`, null);
            }
        }
        const userPivote = yield user_model_1.default.findOne({ where: { email: email, is_active: 1, is_deleted: 0 } });
        if (userPivote) {
            return (0, customResponses_1.customResponse)(false, res, 400, `Un usuario con este '${email}' ya existe`, null);
        }
        const passEncript = yield (0, password_1.generatePassword)(password);
        const user = yield user_model_1.default.create({ password: passEncript, address, email: email.trim().toLowerCase(), full_name, identification, lat: lat ? lat : null, lng: lng ? lng : null, phone, role_id: parseInt(role_id), type_asc_id, whatsapp_group, zone_id: zone_id ? zone_id : null });
        if (user) {
            if (photo_profile) {
                const nameFile = `${identification}_${(0, utils_1.generateFileName)()}`;
                yield (0, utils_1.savePhotosCreateUser)({ identification: nameFile, photo_profile });
                const extension = (0, upload_file_1.getExtension)(photo_profile);
                yield user.update({
                    photo_profile: photo_profile ? `photo_profile_${nameFile}.${extension}` : null,
                });
            }
            else {
                if (avatar)
                    yield user.update({ photo_profile: avatar });
            }
        }
        const token = yield (0, generate_jwt_1.generateJWTObjectWhiteTime)({ id: user.get().id }, '7d');
        if (user.get().role_id === 4) {
            yield (0, sendEmail_1.sendEmail)(
            //
            'We-u', [email], 'Confirmar cuenta', `Confirmar cuenta`, (0, authEmails_1.emailConfirmAccount)(user.get().full_name, token));
        }
        const msg = user.get().role_id === 4 ? `El Usuario ${user.get().full_name} creado correctamente. Te enviamos un correo electrónico para confirmar y activar la cuenta, por favor revise su bandeja de entrada` : `El Usuario "${user.get().full_name}" creado correctamente. Espera que el Administrador acepte tu registro`;
        (0, customResponses_1.customResponse)(true, res, 200, msg, { id: user.get().id });
    }
    catch (error) {
        console.error('-->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.registerUsers = registerUsers;
/**
 * Recibe una solicitud y un objeto de respuesta, luego obtiene el correo electrónico y la contraseña
 * del cuerpo de la solicitud, luego intenta encontrar un usuario con el correo electrónico y la
 * contraseña proporcionados, si no lo encuentra, devuelve una respuesta personalizada con un Código de
 * estado 401 y un mensaje, si lo encuentra, valida la contraseña, si no es válido, devuelve una
 * respuesta personalizada con un código de estado 401 y un mensaje, si es válido, verifica si el
 * usuario está activo, si es no, devuelve una respuesta personalizada con un código de estado 401 y un
 * mensaje, si está activo, actualiza el campo accessed_at del usuario, luego genera un token JWT con
 * la identificación y el nombre completo del usuario, y finalmente devuelve una respuesta
 * personalizada con un 200 código de estado y un mensaje
 * @param {Request} req - Solicitud: el objeto de la solicitud.
 * @param {Response} res - El objeto de respuesta.
 * @returns Una función que recibe una solicitud y una respuesta como parámetros.
 */
const loginAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield user_model_1.default.findOne({
            where: {
                email: email.trim(),
                role_id: { [sequelize_1.Op.or]: [1, 2, 5] },
                is_deleted: 0,
            },
        });
        if (!user) {
            return (0, customResponses_1.customResponse)(false, res, 401, 'Usuario o contraseña incorrectos', null);
        }
        const validate = (0, password_1.ValidadPassword)(password, user.getDataValue('password'));
        if (!validate) {
            return (0, customResponses_1.customResponse)(false, res, 401, 'Usuario o contraseña incorrectos', null);
        }
        if (!user.get().is_active) {
            return (0, customResponses_1.customResponse)(false, res, 401, 'Por favor espere que el administrador active su cuenta', null);
        }
        yield user.update({ accessed_at: new Date() });
        const token = yield (0, generate_jwt_1.generateJWTObjectWhiteTime)({ id: user.get().id, full_name: user.get().full_name }, '1d');
        (0, customResponses_1.customResponse)(true, res, 200, `Bienvenido`, { token });
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.loginAdmin = loginAdmin;
/**
 * Recibe una solicitud y una respuesta, obtiene los datos del cuerpo de la solicitud, genera un nuevo
 * token con los datos y lo envía de vuelta al cliente
 * @param {Request} req - Solicitud: este es el objeto de solicitud que se pasa al controlador de ruta.
 * @param {Response} res - Respuesta: el objeto de respuesta que se enviará al cliente.
 */
const renewToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body.data;
    const token = yield (0, generate_jwt_1.generateJWTObjectWhiteTime)({ id: data.id, full_name: data.full_name }, '1d');
    (0, customResponses_1.customResponse)(true, res, 200, 'Token renovado', { token });
});
exports.renewToken = renewToken;
/**
 * Recibe un token, lo verifica y si es válido activa al usuario
 * @param {Request} req - Solicitud: este es el objeto de solicitud que contiene los datos enviados por
 * el cliente.
 * @param {Response} res - Respuesta: este es el objeto de respuesta que se enviará de vuelta al
 * cliente.
 * @returns una respuesta con un código de estado de 200 y un mensaje de 'Usuario activado'
 */
const confirmAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { object } = jsonwebtoken_1.default.verify(token, `${process.env.SECRETORPRIVATEKEY}`);
        if (!object)
            return (0, customResponses_1.customResponse)(false, res, 401, 'Su solicitud ha expirado', null);
        const user = yield user_model_1.default.findByPk(object.id);
        if (user) {
            yield user.update({ is_active: 1 });
            (0, customResponses_1.customResponse)(true, res, 200, 'Usuario activado', null);
        }
        else {
            (0, customResponses_1.customResponse)(false, res, 400, 'El usuario no existe', null);
        }
    }
    catch (error) {
        console.error('-->', error);
        return (0, customResponses_1.customResponse)(false, res, 410, 'Su solicitud ha expirado', null);
    }
});
exports.confirmAccount = confirmAccount;
/**
 * Recibe un token y una contraseña, decodifica el token, encuentra al usuario, genera una nueva
 * contraseña, actualiza la contraseña del usuario y devuelve una respuesta
 * @param {Request} req - Solicitud: el objeto de la solicitud.
 * @param {Response} res - El objeto de respuesta.
 */
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, token } = req.body;
    try {
        const { object } = jsonwebtoken_1.default.verify(token, `${process.env.SECRETORPRIVATEKEY}`);
        // const { object }: any = await decodeJWT(token);
        if (!object)
            return (0, customResponses_1.customResponse)(false, res, 401, 'Su solicitud ha expirado', null);
        const user = yield user_model_1.default.findOne({ where: { id: object.id } });
        if (!user)
            return (0, customResponses_1.customResponse)(false, res, 400, 'Identificación y/o correo electrónico inválidos o inactivos. Por favor comuniquese con su Ejecutivo de cuenta', null);
        const passEncript = yield (0, password_1.generatePassword)(password);
        yield user.update({ password: passEncript });
        (0, customResponses_1.customResponse)(true, res, 200, 'Su contraseña se restableció', null);
    }
    catch (error) {
        console.error('-->', error);
        return (0, customResponses_1.customResponse)(false, res, 410, 'Su solicitud ha expirado', null);
    }
});
exports.resetPassword = resetPassword;
/**
 * Envía un correo electrónico al usuario con un enlace para restablecer su contraseña
 */
const sendEmailResetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield user_model_1.default.findOne({ where: { email: email, is_active: 1, is_deleted: 0 } });
        if (!user) {
            return (0, customResponses_1.customResponse)(false, res, 400, 'El usuario con ese email no existe', null);
        }
        const token = yield (0, generate_jwt_1.generateJWTObjectWhiteTime)(user.get(), '10 minutes');
        const send = yield (0, sendEmail_1.sendEmail)(
        //
        'We-u', [email], 'Restablecer contraseña', `¿Hola, ${user.get().full_name} solicitaste restablecer tu contraseña?`, (0, authEmails_1.emailRecoverPassword)(token, user.get().full_name));
        (0, customResponses_1.customResponse)(true, res, 200, 'Te enviamos un correo electronico, revisa tu bandeja de entrada', send);
    }
    catch (error) {
        console.error('-->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.sendEmailResetPassword = sendEmailResetPassword;
const sendEmailExample = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const send = yield (0, sendEmail_1.sendEmail)(
        //
        'We-u', [email], 'Restablecer contraseña', `¿Hola, Ejemplo ?`, (0, authEmails_1.emailConfirmAccount)('token', 'Ejemplo'));
        (0, customResponses_1.customResponse)(true, res, 200, 'We send you a email, please check your inbox', send);
    }
    catch (error) {
        console.error('-->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.sendEmailExample = sendEmailExample;
const generaToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield (0, generate_jwt_1.generateJWTObjectWhiteTime)({ email: 'alejandro03@gmail.com' }, '1d');
    return (0, customResponses_1.customResponse)(true, res, 200, 'token', token);
});
exports.generaToken = generaToken;
const decodeToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, token } = req.body;
        if (token) {
            const { object } = yield (0, generate_jwt_1.decodeJWT)(token);
            if (!object) {
                return (0, customResponses_1.customResponse)(false, res, 401, 'No se pudo decodificar el token', null);
            }
            return (0, customResponses_1.customResponse)(true, res, 200, 'token decodificado', object);
        }
        (0, customResponses_1.customResponse)(true, res, 200, 'token decodificado', data);
    }
    catch (error) {
        console.error('-->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.decodeToken = decodeToken;
//# sourceMappingURL=auth.controller.js.map