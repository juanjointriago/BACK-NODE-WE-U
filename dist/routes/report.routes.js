"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_jwt_middlewares_1 = require("../middleware/validator-jwt.middlewares");
const asyncMiddleware_1 = require("../middleware/asyncMiddleware");
const report_controller_1 = require("../controller/report.controller");
const router = (0, express_1.Router)();
router.post('/province', validator_jwt_middlewares_1.validatorJWT, (0, asyncMiddleware_1.asyncMiddleware)(report_controller_1.numberUsersZoneByIdProvince));
exports.default = router;
//# sourceMappingURL=report.routes.js.map