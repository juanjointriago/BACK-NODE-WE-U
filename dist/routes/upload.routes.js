"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asyncMiddleware_1 = require("../middleware/asyncMiddleware");
const upload_controller_1 = require("./../controller/upload.controller");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post('/local/:folder', upload_controller_1.uploadFiles);
router.post('/s3', upload_controller_1.uploadFilesAWSS3);
router.post('/gcs', (0, asyncMiddleware_1.asyncMiddleware)(upload_controller_1.uploadFilesGCS));
router.post('/gcs/:folder', (0, asyncMiddleware_1.asyncMiddleware)(upload_controller_1.uploadFilesGCS));
exports.default = router;
//# sourceMappingURL=upload.routes.js.map