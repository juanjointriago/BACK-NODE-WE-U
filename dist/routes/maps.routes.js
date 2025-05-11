"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const maps_controller_1 = require("../controller/maps.controller");
const validator_jwt_middlewares_1 = require("../middleware/validator-jwt.middlewares");
const router = (0, express_1.Router)();
router.get('/autocomplete/:input', validator_jwt_middlewares_1.validatorJWT, maps_controller_1.getPredictionsGoogleMaps);
router.get('/details/:placeid', validator_jwt_middlewares_1.validatorJWT, maps_controller_1.getGeometryLocationGoogleMaps);
router.get('/geocode/:lat/:lng', maps_controller_1.getGeoCodeGoogleMaps);
exports.default = router;
//# sourceMappingURL=maps.routes.js.map