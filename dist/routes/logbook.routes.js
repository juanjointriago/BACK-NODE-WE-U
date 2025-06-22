"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_jwt_middlewares_1 = require("../middleware/validator-jwt.middlewares");
const logobook_controller_1 = require("../controller/logobook.controller");
const validateHelpRequest_1 = require("../middleware/validations/validateHelpRequest");
const router = (0, express_1.Router)();
router.get('/getLogbookById/:idLogbook', validator_jwt_middlewares_1.validatorJWT, logobook_controller_1.getLogbookById);
router.get('/getMylastLogbook', validator_jwt_middlewares_1.validatorJWT, logobook_controller_1.getMylastLogbook);
router.get('/getPhotosByPointId/:idCoord', validator_jwt_middlewares_1.validatorJWT, logobook_controller_1.getPhotosByPointId);
router.get('/history/:offset/:limit', [validator_jwt_middlewares_1.validatorJWT, ...validateHelpRequest_1.validateLimitOffset], logobook_controller_1.getLogbookHistory);
router.post('/getAllLogbooks', validator_jwt_middlewares_1.validatorJWT, logobook_controller_1.getAllLogbooks);
router.post('/postLogbook', validator_jwt_middlewares_1.validatorJWT, logobook_controller_1.postLogbook);
router.post('/postCoordsLogbook', validator_jwt_middlewares_1.validatorJWT, logobook_controller_1.postCoordsLogbook);
router.put('/:id', validator_jwt_middlewares_1.validatorJWT, logobook_controller_1.updateLogbook);
exports.default = router;
//# sourceMappingURL=logbook.routes.js.map