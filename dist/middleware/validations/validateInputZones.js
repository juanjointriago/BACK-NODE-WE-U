"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFieldsUpdateZonesSelected = exports.validateFieldsPutZone = exports.validateFieldsPostZone = void 0;
const express_validator_1 = require("express-validator");
const validator_field_middlewares_1 = require("../validator-field.middlewares");
/* Una validación de los campos de solicitud. */
exports.validateFieldsPostZone = [
    (0, express_validator_1.check)('zone_name', 'Campo obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('zone_name', 'Tipo de dato es incorrecto debe ser una cadena de texto').isString(),
    (0, express_validator_1.check)('latlngs', 'Campo obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('latlngs', 'Tipo de dato es incorrecto debe ser una cadena de texto').isString(),
    validator_field_middlewares_1.validatorField,
    //
];
/* Una validación de los campos de la solicitud. */
exports.validateFieldsPutZone = [
    (0, express_validator_1.check)('id', 'Campo obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('id', 'Tipo de dato es incorrecto debe ser un entero').isNumeric(),
    (0, express_validator_1.check)('zone_name', 'Campo obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('zone_name', 'Tipo de dato es incorrecto debe ser una cadena de texto').isString(),
    (0, express_validator_1.check)('latlngs', 'Campo obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('latlngs', 'Tipo de dato es incorrecto debe ser una cadena de texto').isString(),
    validator_field_middlewares_1.validatorField,
    //
];
exports.validateFieldsUpdateZonesSelected = [
    (0, express_validator_1.check)('is_active', 'Campo obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('is_active', 'Tipo de dato es incorrecto debe ser un boleano').isBoolean(),
    (0, express_validator_1.check)('zoneSelectedId', 'Campo obligatorio').not().isEmpty(),
    validator_field_middlewares_1.validatorField,
    //
];
//# sourceMappingURL=validateInputZones.js.map