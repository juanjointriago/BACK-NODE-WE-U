"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFieldsResetPassword = exports.validateFieldsRecoverPassword = exports.validateFieldsRegister = exports.validateFieldsLoginSMS = exports.validateFieldsLogin = void 0;
const express_validator_1 = require("express-validator");
const validator_field_middlewares_1 = require("../validator-field.middlewares");
const validatorsDb_1 = require("../../helpers/validatorsDb");
/* Un middleware que valida los campos del inicio de sesión. */
exports.validateFieldsLogin = [
    (0, express_validator_1.check)('email', 'email incorrecto').isEmail(),
    (0, express_validator_1.check)('password', 'Contraseña incorrecta').not().isEmpty(),
    validator_field_middlewares_1.validatorField,
    //
];
/* Un middleware que valida los campos del inicio de sesión. */
exports.validateFieldsLoginSMS = [
    (0, express_validator_1.check)('phone', 'El número de celular es obligatorio').not().isEmpty(),
    validator_field_middlewares_1.validatorField,
    //
];
/* Una serie de validaciones. */
exports.validateFieldsRegister = [
    (0, express_validator_1.check)('full_name', 'El nombre es un campo obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('email', 'El correo electronico no es válido').isEmail(),
    (0, express_validator_1.check)('email', 'El correo electronico es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('password', 'El password es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('password', 'Ingrese al menos 6 caracteres').isLength({ min: 6 }),
    (0, express_validator_1.check)('phone', 'El número telefónico no es válido').custom(validatorsDb_1.phoneExist).isLength({ min: 10, max: 10 }),
    (0, express_validator_1.check)('phone', 'El número telefónico es obligatorio').not().isEmpty(),
    // check('identification').custom(identificationExist),
    (0, express_validator_1.check)('identification').custom(validatorsDb_1.validIdentificationEC),
    (0, express_validator_1.check)('role_id').custom(validatorsDb_1.validRole),
    // check('role_id', 'El role_id es un entero').isNumeric(),
    (0, express_validator_1.check)('role_id', 'el rol es un campo obligatorio').not().isEmpty(),
    validator_field_middlewares_1.validatorField,
    //
];
/* Un middleware que valida los campos de la contraseña de recuperación. */
exports.validateFieldsRecoverPassword = [
    (0, express_validator_1.check)('email', 'El correo es un campo obligatorio').exists(),
    (0, express_validator_1.check)('email', 'El correo es inválido').isEmail(),
    (0, express_validator_1.check)('identification', 'Número de identificacion es un campo obligatorio').exists(),
    (0, express_validator_1.check)('identification', 'Número de identificacion es inválido').isLength({ min: 10, max: 13 }),
    validator_field_middlewares_1.validatorField,
    //
];
/* Un middleware que valida los campos de la recuperación de contraseña. */
exports.validateFieldsResetPassword = [
    (0, express_validator_1.check)('token', 'El token es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('password', 'El password es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('password', 'Contraseña incorrecta').isString().isLength({ min: 6 }),
    validator_field_middlewares_1.validatorField,
    //
];
//# sourceMappingURL=validateAuth.js.map