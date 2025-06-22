"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatorField = void 0;
const express_validator_1 = require("express-validator");
/**
 * Toma una solicitud, una respuesta y la siguiente función como argumentos, y si hay algún error en la
 * solicitud, devuelve un código de estado 400 con los errores. De lo contrario, llama a la siguiente
 * función.
 * @param {Request} req - Solicitud - El objeto de la solicitud
 * @param {Response} res - Respuesta - el objeto de respuesta
 * @param {NextFunction} next - Esta es una función a la que llamamos cuando queremos pasar al
 * siguiente middleware.
 * @returns los errores si los hay.
 */
const validatorField = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }
    next();
    return;
};
exports.validatorField = validatorField;
//# sourceMappingURL=validator-field.middlewares.js.map