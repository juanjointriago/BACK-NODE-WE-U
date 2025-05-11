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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config/config");
/**
 * Envía un correo electrónico utilizando las credenciales que proporciona
 * @param {string} from - La dirección de correo electrónico del remitente. Todas las direcciones de
 * correo electrónico pueden ser simplemente 'remitente@servidor.com' o con el formato 'Nombre del
 * remitente <remitente@servidor.com>', consulte aquí para obtener más detalles.
 * @param {string[]} to - La dirección de correo electrónico del destinatario.
 * @param {string} subject - El asunto del correo electrónico
 * @param {string} text - La versión de texto sin formato del correo electrónico.
 * @param {string} html - El cuerpo HTML del correo electrónico.
 * @returns Una promesa que se resuelve en un objeto con las siguientes propiedades:
 */
const sendEmail = (from, to, subject, text, html) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer_1.default.createTransport({
            host: config_1.HOSTEMAIL,
            port: Number(config_1.PORTEMAIL),
            secure: true,
            auth: {
                user: config_1.EMAIL,
                pass: config_1.PASSWORDEMAIL,
            },
        });
        transporter.sendMail({
            from: config_1.EMAIL,
            to,
            subject,
            text,
            html,
        }, (error, info) => {
            if (error) {
                resolve(error);
            }
            else {
                resolve(info);
            }
        });
    });
});
exports.sendEmail = sendEmail;
//# sourceMappingURL=sendEmail.js.map