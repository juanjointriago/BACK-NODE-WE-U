"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.comprobarJWT = exports.decodeJWT = exports.generateJWTObjectWhiteTime = exports.generateJWTObject = exports.generateJWT = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
/**
 * Toma un correo electrónico como parámetro, crea una carga útil con el correo electrónico y luego
 * firma la carga útil con una clave secreta
 * @param {string} email - El correo electrónico del usuario para el que queremos generar el token.
 * @returns Una promesa que se resolverá en un token o se rechazará con un mensaje.
 */
const generateJWT = (email) => {
    return new Promise((resolve, reject) => {
        const payload = {
            email,
        };
        jsonwebtoken_1.default.sign(payload, `${process.env.SECRETORPRIVATEKEY}`, (err, token) => {
            if (err) {
                console.log(err);
                reject('No se puedo genera el token');
            }
            else {
                resolve(token);
            }
        });
    });
};
exports.generateJWT = generateJWT;
/**
 * Toma un objeto como parámetro y devuelve una promesa que se resuelve en un token JWT
 * @param object - {}: este es el objeto que desea cifrar.
 * @returns Una promesa que se resolverá en un token o se rechazará con un mensaje.
 */
const generateJWTObject = (object) => {
    return new Promise((resolve, reject) => {
        const payload = {
            object,
        };
        jsonwebtoken_1.default.sign(payload, `${process.env.SECRETORPRIVATEKEY}`, (err, token) => {
            if (err) {
                console.log(err);
                reject('No se puedo genera el token');
            }
            else {
                resolve(token);
            }
        });
    });
};
exports.generateJWTObject = generateJWTObject;
/**
 * Genera un token JWT con un tiempo de vencimiento personalizado
 * @param object - {}: este es el objeto que desea enviar al cliente.
 * @param {string | number | undefined} time - cadena | número | indefinido
 * @returns Una promesa que devolverá una ficha
 */
const generateJWTObjectWhiteTime = (object, time) => {
    return new Promise((resolve, reject) => {
        const payload = {
            object,
        };
        jsonwebtoken_1.default.sign(payload, `${process.env.SECRETORPRIVATEKEY}`, {
            expiresIn: time,
        }, (err, token) => {
            if (err) {
                console.log(err);
                reject('No se puedo genera el token');
            }
            else {
                resolve(token);
            }
        });
    });
};
exports.generateJWTObjectWhiteTime = generateJWTObjectWhiteTime;
/**
 * Toma una carga útil de JWT como una cadena, la decodifica y devuelve los datos decodificados como
 * una promesa
 * @param {string} payload - La cadena JWT para decodificar.
 * @returns Una promesa que se resuelve en la carga útil decodificada.
 */
const decodeJWT = (payload) => {
    return new Promise((resolve) => {
        const data = (0, jsonwebtoken_1.decode)(payload);
        resolve(data);
    });
};
exports.decodeJWT = decodeJWT;
/**
 * Toma un token como parámetro y devuelve una matriz con un valor booleano y un objeto
 * @param {string} [token] - El token que se va a verificar.
 * @returns Una matriz con dos elementos. El primer elemento es un booleano y el segundo elemento es un
 * objeto.
 */
const comprobarJWT = (token = '') => {
    try {
        const { object } = jsonwebtoken_1.default.verify(token, `${process.env.SECRETORPRIVATEKEY}`);
        return [true, object];
    }
    catch (error) {
        return [false, null];
    }
};
exports.comprobarJWT = comprobarJWT;
//# sourceMappingURL=generate-jwt.js.map