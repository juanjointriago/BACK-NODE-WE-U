"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateSubzoneByAscId = exports.validateCreateSubZone = exports.validatePaymentSubzones = exports.validatePayment = exports.preValidateRegisterSubscriber = exports.validateRegisterSubscriber = exports.validateFieldsPostZone = void 0;
const express_validator_1 = require("express-validator");
const validator_field_middlewares_1 = require("../validator-field.middlewares");
const validatorsDb_1 = require("../../helpers/validatorsDb");
/* Una validación de los campos de solicitud. */
exports.validateFieldsPostZone = [
    (0, express_validator_1.check)('zone_name', 'Campo obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('zone_name', 'Tipo de dato es incorrecto debe ser una cadena de texto').isString(),
    (0, express_validator_1.check)('latlngs', 'Campo obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('latlngs', 'Tipo de dato es incorrecto debe ser una cadena de texto').isString(),
    validator_field_middlewares_1.validatorField,
    //
];
/* Una validación de los campos de solicitud. */
exports.validateRegisterSubscriber = [
    (0, express_validator_1.check)('email', 'El correo electronico no es válido').isEmail(),
    (0, express_validator_1.check)('email', 'El correo electronico es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('password', 'El password es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('password', 'Ingrese al menos 6 caracteres').isLength({ min: 6 }),
    (0, express_validator_1.check)('full_name', 'El nombre es un campo obligatorio').not().isEmpty(),
    // check('identification').custom(identificationExist),
    (0, express_validator_1.check)('identification').custom(validatorsDb_1.validIdentificationEC),
    (0, express_validator_1.check)('payment_method', 'El campo debe ser un número').isNumeric(),
    (0, express_validator_1.check)('payment_method').custom(validatorsDb_1.validPaymentMethod),
    (0, express_validator_1.check)('phone', 'El número telefónico no es válido').custom(validatorsDb_1.phoneExist).isLength({ min: 10, max: 10 }),
    (0, express_validator_1.check)('phone', 'El número telefónico es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('num_asc', 'El campo debe ser un número').isNumeric(),
    (0, express_validator_1.check)('num_asc', 'El campo es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('num_asc').custom(validatorsDb_1.validNumACS),
    (0, express_validator_1.check)('num_subzones_extra', 'El campo debe ser un número').isNumeric(),
    // check('num_subzones', 'El campo es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('num_subzones_extra').custom(validatorsDb_1.validNumsubzones),
    validator_field_middlewares_1.validatorField,
    //
];
exports.preValidateRegisterSubscriber = [
    (0, express_validator_1.check)('email', 'El correo electronico no es válido').isEmail(),
    (0, express_validator_1.check)('email', 'El correo electronico es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('password', 'El password es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('password', 'Ingrese al menos 6 caracteres').isLength({ min: 6 }),
    (0, express_validator_1.check)('full_name', 'El nombre es un campo obligatorio').not().isEmpty(),
    // check('identification').custom(identificationExist),
    (0, express_validator_1.check)('identification').custom(validatorsDb_1.validIdentificationEC),
    (0, express_validator_1.check)('phone', 'El número telefónico no es válido').custom(validatorsDb_1.phoneExist).isLength({ min: 10, max: 10 }),
    (0, express_validator_1.check)('phone', 'El número telefónico es obligatorio').not().isEmpty(),
    validator_field_middlewares_1.validatorField,
    //
];
exports.validatePayment = [
    (0, express_validator_1.check)('payment_method', 'El campo debe ser un número').isNumeric(),
    (0, express_validator_1.check)('payment_method').custom(validatorsDb_1.validPaymentMethod),
    validator_field_middlewares_1.validatorField,
    //
];
exports.validatePaymentSubzones = [
    (0, express_validator_1.check)('payment_method', 'El campo debe ser un número').isNumeric(),
    (0, express_validator_1.check)('payment_method').custom(validatorsDb_1.validPaymentMethod),
    (0, express_validator_1.check)('num_subzones', 'El campo debe ser un número').isNumeric(),
    (0, express_validator_1.check)('num_subzones', 'El campo es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('num_subzones').custom(validatorsDb_1.validNumACS),
    validator_field_middlewares_1.validatorField,
    //
];
exports.validateCreateSubZone = [
    (0, express_validator_1.check)('name', 'El campo es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('name', 'El campo debe ser una cadena de caracteres').isString(),
    (0, express_validator_1.check)('polygon', 'El campo es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('polygon', 'El campo debe ser una un arreglo').isArray(),
    validator_field_middlewares_1.validatorField,
    //
];
exports.validateUpdateSubzoneByAscId = [
    (0, express_validator_1.check)('asc_id', 'El campo es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('asc_id', 'El campo debe ser un número').isNumeric(),
    (0, express_validator_1.check)('subzone_id', 'El campo es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('subzone_id', 'El campo debe ser un número').isNumeric(),
    validator_field_middlewares_1.validatorField,
    //
];
//# sourceMappingURL=validateInputsSubscription.js.map