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
exports.validTypeStatusEnd = exports.validTypeStatus = exports.validCodeCity = exports.validTypeASC = exports.validNumsubzones = exports.validNumACS = exports.validPaymentMethod = exports.validRole = exports.validIdentificationEC = exports.identificationExist = exports.phoneExistUpdate = exports.phoneExist = void 0;
const payment_enum_1 = require("../enums/payment_enum");
const user_enum_1 = require("../enums/user.enum");
const user_model_1 = __importDefault(require("../models/user.model"));
/**
 * Si el número de teléfono existe en la base de datos, arroja un error.
 * @param {string} phone - número telefonico 10 caracteres
 */
const phoneExist = (phone) => __awaiter(void 0, void 0, void 0, function* () {
    const phoneExist = yield user_model_1.default.findOne({ where: { phone, is_deleted: 0 } });
    if (phoneExist) {
        throw new Error(`El numero de teléfono ${phone} ya se encuentra registrado`);
    }
});
exports.phoneExist = phoneExist;
const phoneExistUpdate = (phone) => __awaiter(void 0, void 0, void 0, function* () {
    if (phone) {
        const phoneExist = yield user_model_1.default.findOne({ where: { phone, is_deleted: 0 } });
        if (phoneExist) {
            throw new Error(`El numero de teléfono ${phone} ya se encuentra registrado`);
        }
    }
});
exports.phoneExistUpdate = phoneExistUpdate;
/**
 * Esta función comprueba si un usuario existe en la base de datos por su número de identificación, y
 * si existe arroja un error.
 * @param {string} identification - cédula
 */
const identificationExist = (identification) => __awaiter(void 0, void 0, void 0, function* () {
    const phoneExist = yield user_model_1.default.findOne({ where: { identification, is_deleted: 0 } });
    if (phoneExist) {
        throw new Error(`El número de cédula ${identification} ya se encuentra registrado`);
    }
});
exports.identificationExist = identificationExist;
/**
 * verifica una cédula válida
 * @param {string} identification - cédula
 */
const validIdentificationEC = (identification) => __awaiter(void 0, void 0, void 0, function* () {
    const resp = verify(identification);
    if (!resp) {
        throw new Error(`El número de cédula ${identification} no es válido`);
    }
});
exports.validIdentificationEC = validIdentificationEC;
/**
 * Si el rol es 1, lanza un error.
 * @param {string} role - número
 */
const validRole = (role) => __awaiter(void 0, void 0, void 0, function* () {
    if (parseInt(role) === user_enum_1.UserRoles.ASC) {
        throw new Error(`No puede registrar un usuario con el este rol`);
    }
});
exports.validRole = validRole;
/**
 * Checks if a given payment method is valid.
 * @param paymentMethod - The payment method to be checked.
 * @throws {Error} - Throws an error if the payment method is not valid.
 */
const validPaymentMethod = (paymentMethod) => __awaiter(void 0, void 0, void 0, function* () {
    // List of valid payment methods
    const validMethods = [payment_enum_1.PaymentMethod.creditCard, payment_enum_1.PaymentMethod.transfer];
    // Check if the payment method is in the list of valid methods
    if (!validMethods.includes(parseInt(paymentMethod))) {
        // Throw an error if the payment method is not valid
        throw new Error(`No es un mêtodo de pago válido, el mêtodo de pago debe ser uno de los siguientes: ${validMethods.join(', ')}`);
    }
});
exports.validPaymentMethod = validPaymentMethod;
/**
 * Validates if a number is a valid ASC.
 * Throws an error if the number is not positive or not a multiple of 5.
 *
 * @param num - The number to be validated.
 * @throws Error - If the number is not positive or not a multiple of 5.
 */
const validNumACS = (num) => __awaiter(void 0, void 0, void 0, function* () {
    if (num <= 0) {
        throw new Error(`El ASC debe ser un número positivo y mayor a 0`);
    }
});
exports.validNumACS = validNumACS;
const validNumsubzones = (num) => __awaiter(void 0, void 0, void 0, function* () {
    if (num < 0) {
        throw new Error(`El ASC debe ser un número positivo y mayor a 0`);
    }
});
exports.validNumsubzones = validNumsubzones;
/**
 * Validates if a given ASC type is valid.
 *
 * @param {number} type - The ASC type to validate.
 * @throws {Error} Throws an error if the ASC type is not valid.
 */
const validTypeASC = (type) => __awaiter(void 0, void 0, void 0, function* () {
    // List of valid payment methods
    const typesASC = [user_enum_1.typeASC.PUBLIC, user_enum_1.typeASC.PRIVATE, user_enum_1.typeASC.ORG_NEIGHBOUR_OR_COMUN_PERSON];
    // Check if the payment method is in the list of valid methods
    if (!typesASC.includes(parseInt(type))) {
        // Throw an error if the payment method is not valid
        throw new Error(`No es un tipo de ASC válido, el tipo de ASC debe ser uno de los siguientes: ${typesASC.join(', ')}`);
    }
});
exports.validTypeASC = validTypeASC;
/**
 * Verifies the validity of an identification number.
 * @param {string} id - The identification number to be verified.
 * @returns {boolean} - True if the identification number is valid, false otherwise.
 */
const verify = (id) => {
    // Check if the identification number has the correct length
    if (id.length === 10) {
        // Extract the third digit of the identification number
        const thirdNumber = parseInt(id.substring(2, 3));
        // Define the coefficient values for each character
        const coefValCedula = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        // Extract the very last digit of the identification number
        const veryLastNUmber = parseInt(id.substring(9, 10));
        let suma = 0;
        let digito = 0;
        // Check if the third digit is less than 6
        if (thirdNumber <= 6) {
            // Iterate over each character of the identification number
            for (let i = 0; i < id.length - 1; i++) {
                // Multiply each character by its corresponding coefficient value
                digito = parseInt(id.substring(i, i + 1)) * coefValCedula[i];
                // Sum the resulting values
                suma += parseInt((digito % 10) + '') + parseInt(digito / 10 + '');
            }
            // Round the sum to the nearest integer
            suma = Math.round(suma);
            // Check if the rounded sum modulo 10 is equal to the very last digit
            if (Math.round(suma % 10) === 0 && Math.round(suma % 10) === veryLastNUmber) {
                return true;
            }
            else if (10 - Math.round(suma % 10) === veryLastNUmber) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
};
const validCodeCity = (code) => __awaiter(void 0, void 0, void 0, function* () {
    if (code)
        if (code.length !== 4) {
            throw new Error(`No es un código válido, el código debe tener 4 caracteres`);
        }
});
exports.validCodeCity = validCodeCity;
/**
 * Validates the status type.
 *
 * @param {string} status - The status to be validated.
 * @throws {Error} - Throws an error if the status is not valid.
 */
const validTypeStatus = (status) => {
    // List of valid status types
    const typeStatus = ['pending', 'accepted', 'completed', 'cancel'];
    // Check if the status is in the list of valid types
    if (!typeStatus.includes(status)) {
        // Throw an error if the status is not valid
        throw new Error(`El estado que quiere ingresar no existe solo puede ingresar`);
    }
};
exports.validTypeStatus = validTypeStatus;
/**
 * Check if the given status is a valid type status.
 * @param {string} status - The status to be checked.
 * @returns {object} - An object with the result of the validation.
 *    - ok: A boolean indicating if the status is valid or not.
 *    - msg: A message describing the result of the validation.
 */
const validTypeStatusEnd = (status) => {
    // Define the valid type status options.
    const typeStatus = ['pending', 'accepted', 'completed', 'cancel'];
    // Check if the given status is not included in the valid type status options.
    if (!typeStatus.includes(status)) {
        // Return an object indicating that the status is invalid.
        return {
            ok: false,
            msg: `El estado que quiere ingresar no existe solo puede ingresar ${typeStatus}`,
        };
    }
    // Return an object indicating that the status is valid.
    return { ok: true, msg: 'ok' };
};
exports.validTypeStatusEnd = validTypeStatusEnd;
//# sourceMappingURL=validatorsDb.js.map