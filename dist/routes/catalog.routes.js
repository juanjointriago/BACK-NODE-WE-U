"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catalog_controller_1 = require("../controller/catalog.controller");
const validator_jwt_middlewares_1 = require("../middleware/validator-jwt.middlewares");
const router = (0, express_1.Router)();
router.get('/getRoles', catalog_controller_1.getRoles);
router.get('/getTypesASC', catalog_controller_1.getTypesASC);
router.get('/getProvinceByCode/:codeProvince', catalog_controller_1.getProvinceByCode);
router.get('/getProvinceByName/:name', catalog_controller_1.getProvinceByName);
router.get('/getProvincesAndtheirCities/', catalog_controller_1.getProvincesAndtheirCities);
router.get('/myZonesSelected', validator_jwt_middlewares_1.validatorJWT, catalog_controller_1.myZonesSelected);
router.get('/zonesSelected', validator_jwt_middlewares_1.validatorJWT, catalog_controller_1.zonesSelected);
exports.default = router;
//# sourceMappingURL=catalog.routes.js.map