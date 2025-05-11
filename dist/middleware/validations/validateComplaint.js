"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePostComment = exports.validateCreateComplaint = exports.validateGetComplaints = void 0;
const express_validator_1 = require("express-validator");
const validator_field_middlewares_1 = require("../validator-field.middlewares");
exports.validateGetComplaints = [
    (0, express_validator_1.check)('offset', 'Campo requerido').not().isEmpty(),
    (0, express_validator_1.check)('offset', 'Tipo de dato incorrecto, se debe enviar un entero').isNumeric(),
    (0, express_validator_1.check)('limit', 'Campo requerido').not().isEmpty(),
    (0, express_validator_1.check)('limit', 'Tipo de dato incorrecto, se debe enviar un entero').isNumeric(),
    validator_field_middlewares_1.validatorField,
    //
];
exports.validateCreateComplaint = [
    (0, express_validator_1.check)('address', 'Campo requerido').not().isEmpty(),
    (0, express_validator_1.check)('zone_id', 'Campo requerido').not().isEmpty(),
    (0, express_validator_1.check)('lat', 'Campo requerido').not().isEmpty(),
    (0, express_validator_1.check)('lng', 'Campo requerido').not().isEmpty(),
    (0, express_validator_1.check)('title', 'Campo requerido').not().isEmpty(),
    (0, express_validator_1.check)('description', 'Campo requerido').not().isEmpty(),
    validator_field_middlewares_1.validatorField,
    //
];
exports.validatePostComment = [
    (0, express_validator_1.check)('address', 'Campo requerido').not().isEmpty(),
    (0, express_validator_1.check)('complaint_id', 'Campo requerido').not().isEmpty(),
    (0, express_validator_1.check)('zone_id', 'Campo requerido').not().isEmpty(),
    (0, express_validator_1.check)('lat', 'Campo requerido').not().isEmpty(),
    (0, express_validator_1.check)('lng', 'Campo requerido').not().isEmpty(),
    (0, express_validator_1.check)('description', 'Campo requerido').not().isEmpty(),
    validator_field_middlewares_1.validatorField,
    //
];
//# sourceMappingURL=validateComplaint.js.map