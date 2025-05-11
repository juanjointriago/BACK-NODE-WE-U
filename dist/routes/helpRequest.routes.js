"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_jwt_middlewares_1 = require("../middleware/validator-jwt.middlewares");
const helpRequest_controller_1 = require("../controller/helpRequest.controller");
const validateHelpRequest_1 = require("../middleware/validations/validateHelpRequest");
const router = (0, express_1.Router)();
router.get('/getHelpRequest', validator_jwt_middlewares_1.validatorJWT, helpRequest_controller_1.getHelpRequest);
router.get('/history/:offset/:limit', [validator_jwt_middlewares_1.validatorJWT, ...validateHelpRequest_1.validateLimitOffset], helpRequest_controller_1.getHistoryHelpRequest);
router.get('/getHelpRequest/:id', validator_jwt_middlewares_1.validatorJWT, helpRequest_controller_1.getHelpRequestByIdEnpoint);
router.get('/getMyHelpRequestAssigned', validator_jwt_middlewares_1.validatorJWT, helpRequest_controller_1.getMyHelpRequestAssigned);
router.post('/postHelpRequest', validator_jwt_middlewares_1.validatorJWT, helpRequest_controller_1.postHelpRequest);
router.post('/getListHelpRequest', validator_jwt_middlewares_1.validatorJWT, helpRequest_controller_1.getListHelpRequest);
router.put('/updateHelpRequest', [...validateHelpRequest_1.validateFieldsUpdateHelpRequest, validator_jwt_middlewares_1.validatorJWT], helpRequest_controller_1.updateHelpRequest);
exports.default = router;
//# sourceMappingURL=helpRequest.routes.js.map