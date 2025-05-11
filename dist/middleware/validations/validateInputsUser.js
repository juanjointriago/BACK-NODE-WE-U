"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateUserASC = exports.validateFieldsUpdateAddressAndCoordsIdCity = exports.validateFieldsUpdateAddressAndCoords = exports.validateFieldsUpdateInfoUser = exports.validateFieldsCreateUser = exports.validateFieldsGetUsers = exports.validateFieldsChangeStatusUserById = exports.validateFieldsResetPassword = void 0;
const express_validator_1 = require("express-validator");
const validator_field_middlewares_1 = require("../validator-field.middlewares");
const validatorsDb_1 = require("../../helpers/validatorsDb");
/* Este es un middleware que valida los campos del cuerpo de la solicitud. */
exports.validateFieldsResetPassword = [
    (0, express_validator_1.check)('newPassword', 'Contraseña nueva de tener mínimo 6 caracteres y maximo 6 caracteres').isString().isLength({ min: 6, max: 10 }),
    validator_field_middlewares_1.validatorField,
    //
];
/* Este es un middleware que valida los campos del cuerpo de la solicitud. */
exports.validateFieldsChangeStatusUserById = [
    (0, express_validator_1.check)('id', 'El tipo de datos es incorrecto debe ser un número').isNumeric(),
    (0, express_validator_1.check)('id', 'Campo obligatorio').exists(),
    (0, express_validator_1.check)('status', 'El tipo de datos es incorrecto debe ser un boolean').isBoolean(),
    (0, express_validator_1.check)('status', 'Campo obligatorio').exists(),
    validator_field_middlewares_1.validatorField,
    //
];
/* Un middleware que valida los campos del cuerpo de la solicitud. */
exports.validateFieldsGetUsers = [
    (0, express_validator_1.check)('offset', 'El tipo de datos es incorrecto debe ser un número').isNumeric(),
    (0, express_validator_1.check)('offset', 'Campo obligatorio').exists(),
    (0, express_validator_1.check)('limit', 'El tipo de datos es incorrecto debe ser un boolean').isNumeric(),
    (0, express_validator_1.check)('limit', 'Campo obligatorio').exists(),
    validator_field_middlewares_1.validatorField,
    //
];
/* Este es un middleware que valida los campos del cuerpo de la solicitud. */
exports.validateFieldsCreateUser = [
    (0, express_validator_1.check)('email', 'El correo es un campo obligatorio').exists(),
    (0, express_validator_1.check)('email', 'El correo es inválido').isEmail(),
    (0, express_validator_1.check)('phone', 'El número de celular es un campo obligatorio').exists(),
    (0, express_validator_1.check)('phone', 'Número de celular inválido').isLength({ min: 10, max: 10 }),
    (0, express_validator_1.check)('identification', 'Número de identificacion es un campo obligatorio').exists(),
    (0, express_validator_1.check)('identification', 'Número de identificacion es inválido').isLength({ min: 10, max: 13 }),
    (0, express_validator_1.check)('charge', 'El cargo es un campo obligatorio').exists(),
    validator_field_middlewares_1.validatorField,
    //
];
exports.validateFieldsUpdateInfoUser = [
    (0, express_validator_1.check)('phone').custom(validatorsDb_1.phoneExistUpdate),
    validator_field_middlewares_1.validatorField,
    //
];
exports.validateFieldsUpdateAddressAndCoords = [
    (0, express_validator_1.check)('lat', 'El tipo de datos es incorrecto debe ser un número').isNumeric(),
    (0, express_validator_1.check)('lat', 'Campo obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('lng', 'El tipo de datos es incorrecto debe ser un número').isNumeric(),
    (0, express_validator_1.check)('lng', 'Campo obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('codeCity').custom(validatorsDb_1.validCodeCity),
    validator_field_middlewares_1.validatorField,
    //
];
exports.validateFieldsUpdateAddressAndCoordsIdCity = [
    (0, express_validator_1.check)('lat', 'El tipo de datos es incorrecto debe ser un número').isNumeric(),
    (0, express_validator_1.check)('lat', 'Campo obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('lng', 'El tipo de datos es incorrecto debe ser un número').isNumeric(),
    (0, express_validator_1.check)('lng', 'Campo obligatorio').not().isEmpty(),
    validator_field_middlewares_1.validatorField,
    //
];
exports.validateCreateUserASC = [
    (0, express_validator_1.check)('email', 'El correo electronico no es válido').isEmail(),
    (0, express_validator_1.check)('email', 'El correo electronico es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('full_name', 'El nombre es un campo obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('phone', 'El número telefónico no es válido').custom(validatorsDb_1.phoneExist).isLength({ min: 10, max: 10 }),
    (0, express_validator_1.check)('phone', 'El número telefónico es obligatorio').not().isEmpty(),
    // check('identification').custom(identificationExist),
    (0, express_validator_1.check)('identification').custom(validatorsDb_1.validIdentificationEC),
    (0, express_validator_1.check)('type_asc_id', 'El campo debe ser un número').isNumeric(),
    (0, express_validator_1.check)('type_asc_id', 'El campo es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('subzone_id', 'El campo es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('type_asc_id').custom(validatorsDb_1.validTypeASC),
    validator_field_middlewares_1.validatorField,
    //
];
//# sourceMappingURL=validateInputsUser.js.map