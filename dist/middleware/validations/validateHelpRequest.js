"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLimitOffset = exports.validateFieldsUpdateHelpRequest = void 0;
const express_validator_1 = require("express-validator");
const validator_field_middlewares_1 = require("../validator-field.middlewares");
/* Un middleware que valida los campos del inicio de sesión. */
exports.validateFieldsUpdateHelpRequest = [
    (0, express_validator_1.check)('id', 'Campo obligatorio').not().isEmpty(),
    // check('status').custom(validTypeStatus),
    (0, express_validator_1.check)('status', 'Campo obligatorio').not().isEmpty(),
    validator_field_middlewares_1.validatorField,
    //
];
exports.validateLimitOffset = [
    (0, express_validator_1.check)('offset', 'Campo requerido').not().isEmpty(),
    (0, express_validator_1.check)('offset', 'Tipo de dato incorrecto, se debe enviar un entero').isNumeric(),
    (0, express_validator_1.check)('limit', 'Campo requerido').not().isEmpty(),
    (0, express_validator_1.check)('limit', 'Tipo de dato incorrecto, se debe enviar un entero').isNumeric(),
    validator_field_middlewares_1.validatorField,
    //
];
//# sourceMappingURL=validateHelpRequest.js.map