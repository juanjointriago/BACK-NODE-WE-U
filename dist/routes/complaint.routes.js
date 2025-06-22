"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_jwt_middlewares_1 = require("../middleware/validator-jwt.middlewares");
const complaint_controller_1 = require("../controller/complaint.controller");
const validateComplaint_1 = require("../middleware/validations/validateComplaint");
const comment_controller_1 = require("../controller/comment.controller");
const router = (0, express_1.Router)();
// complaints
router.get('/getComplaints/:offset/:limit', [validator_jwt_middlewares_1.validatorJWT, ...validateComplaint_1.validateGetComplaints], complaint_controller_1.getComplaints);
router.get('/history/:offset/:limit', [validator_jwt_middlewares_1.validatorJWT, ...validateComplaint_1.validateGetComplaints], complaint_controller_1.getComplaintHistory);
router.get('/getPointsComplaints', validator_jwt_middlewares_1.validatorJWT, complaint_controller_1.getPointsComplaints);
router.get('/getComplaintById/:idComplaint', validator_jwt_middlewares_1.validatorJWT, complaint_controller_1.getComplaintByIdEndpoint);
router.get('/getAssignedComplaint', validator_jwt_middlewares_1.validatorJWT, complaint_controller_1.getAssignedComplaint);
router.get('/photos/:complaint_id', validator_jwt_middlewares_1.validatorJWT, complaint_controller_1.getPhotosByComplaintId);
router.post('/getListComplaint', validator_jwt_middlewares_1.validatorJWT, complaint_controller_1.getListComplaint);
router.post('/createComplaint', [validator_jwt_middlewares_1.validatorJWT, ...validateComplaint_1.validateCreateComplaint], complaint_controller_1.createComplaint);
router.put('/updateComplaint', validator_jwt_middlewares_1.validatorJWT, complaint_controller_1.updateComplaint);
// comments
router.get('/getCommentsByIdComplaint/:idComplaint', validator_jwt_middlewares_1.validatorJWT, comment_controller_1.getCommentsByIdComplaint);
router.post('/postComment', [validator_jwt_middlewares_1.validatorJWT, ...validateComplaint_1.validatePostComment], comment_controller_1.postComment);
router.delete('/deleteComment/:idComment', validator_jwt_middlewares_1.validatorJWT, comment_controller_1.deleteComment);
exports.default = router;
//# sourceMappingURL=complaint.routes.js.map