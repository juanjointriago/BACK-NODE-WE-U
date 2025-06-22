import { Router } from 'express';
import { validatorJWT } from '../middleware/validator-jwt.middlewares';
import { getComplaints, createComplaint, updateComplaint, getPointsComplaints, getComplaintByIdEndpoint, getListComplaint, getAssignedComplaint, getPhotosByComplaintId, getComplaintHistory } from '../controller/complaint.controller';
import { validateCreateComplaint, validateGetComplaints, validatePostComment } from '../middleware/validations/validateComplaint';
import { postComment, getCommentsByIdComplaint, deleteComment } from '../controller/comment.controller';

const router = Router();

// complaints
router.get('/getComplaints/:offset/:limit', [validatorJWT, ...validateGetComplaints], getComplaints);
router.get('/history/:offset/:limit', [validatorJWT, ...validateGetComplaints], getComplaintHistory);
router.get('/getPointsComplaints', validatorJWT, getPointsComplaints);
router.get('/getComplaintById/:idComplaint', validatorJWT, getComplaintByIdEndpoint);
router.get('/getAssignedComplaint', validatorJWT, getAssignedComplaint);
router.get('/photos/:complaint_id', validatorJWT, getPhotosByComplaintId);
router.post('/getListComplaint', validatorJWT, getListComplaint);

router.post('/createComplaint', [validatorJWT, ...validateCreateComplaint], createComplaint);
router.put('/updateComplaint', validatorJWT, updateComplaint);

// comments
router.get('/getCommentsByIdComplaint/:idComplaint', validatorJWT, getCommentsByIdComplaint);
router.post('/postComment', [validatorJWT, ...validatePostComment], postComment);
router.delete('/deleteComment/:idComment', validatorJWT, deleteComment);

export default router;
