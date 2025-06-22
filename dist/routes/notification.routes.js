"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controller/notification.controller");
const validator_jwt_middlewares_1 = require("../middleware/validator-jwt.middlewares");
const router = (0, express_1.Router)();
router.get('/getNotifications', validator_jwt_middlewares_1.validatorJWT, notification_controller_1.getNotifications);
router.put('/putViewedNotification', validator_jwt_middlewares_1.validatorJWT, notification_controller_1.putViewedNotification);
router.delete('/deleteNotification', validator_jwt_middlewares_1.validatorJWT, notification_controller_1.deleteNotification);
router.delete('/deleteAllNotification', validator_jwt_middlewares_1.validatorJWT, notification_controller_1.deleteAllNotification);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map