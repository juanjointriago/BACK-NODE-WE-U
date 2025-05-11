"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_jwt_middlewares_1 = require("../middleware/validator-jwt.middlewares");
const zone_controller_1 = require("../controller/zone.controller");
const validateInputZones_1 = require("../middleware/validations/validateInputZones");
const asyncMiddleware_1 = require("../middleware/asyncMiddleware");
const router = (0, express_1.Router)();
router.post('/addZonesToSubAdmin', [validator_jwt_middlewares_1.validatorJWT], zone_controller_1.addZonesToSubAdmin);
router.post('/subzone/coords', [validator_jwt_middlewares_1.validatorJWT], (0, asyncMiddleware_1.asyncMiddleware)(zone_controller_1.getSubzoneByPoint));
router.put('/updateZonesSelected', [...validateInputZones_1.validateFieldsUpdateZonesSelected, validator_jwt_middlewares_1.validatorJWT], zone_controller_1.updateZonesSelected);
router.get('/subzone', validator_jwt_middlewares_1.validatorJWT, (0, asyncMiddleware_1.asyncMiddleware)(zone_controller_1.getMySubZone));
router.get('/subzone/:idSubzone', validator_jwt_middlewares_1.validatorJWT, (0, asyncMiddleware_1.asyncMiddleware)(zone_controller_1.getPolygonBySubzone));
router.get('/subzones/:idZone', (0, asyncMiddleware_1.asyncMiddleware)(zone_controller_1.getSubZonesByIdZone));
router.get('/subzones/:idZone/polygons', (0, asyncMiddleware_1.asyncMiddleware)(zone_controller_1.getSubZonesPolygonByIdZone));
router.put('/subzone', validator_jwt_middlewares_1.validatorJWT, (0, asyncMiddleware_1.asyncMiddleware)(zone_controller_1.updateSubzone));
router.get('/multipolygons/:idZone', validator_jwt_middlewares_1.validatorJWT, (0, asyncMiddleware_1.asyncMiddleware)(zone_controller_1.getMultipolygonsByIdZone));
exports.default = router;
//# sourceMappingURL=zone.routes.js.map