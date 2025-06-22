"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customResponse = exports.badResponse = void 0;
/**
 * Toma un objeto de respuesta y devuelve una función que toma un mensaje y envía un código de estado
 * 500 con un objeto JSON que contiene el mensaje.
 * @param {Response} res - Respuesta: Este es el objeto de respuesta que obtenemos del servidor
 * express.
 */
const badResponse = (res) => {
    res.status(500).json({
        ok: false,
        msg: `Ha ocurrido un error vuelva a intentarlo`,
    });
};
exports.badResponse = badResponse;
/**
 * @param {boolean} ok - booleano: este es un valor booleano que indica si la solicitud fue exitosa o
 * no.
 * @param {Response} res - Respuesta: este es el objeto de respuesta que obtenemos del servidor
 * express.
 * @param {number} status - El código de estado HTTP.
 * @param {string} msg - El mensaje que desea devolver al cliente.
 * @param {any} data - Los datos que desea devolver al cliente.
 */
const customResponse = (ok, res, status, msg, data) => {
    res.status(status).json({
        ok,
        msg,
        data,
    });
};
exports.customResponse = customResponse;
//# sourceMappingURL=customResponses.js.map