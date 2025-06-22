import { Router } from 'express';
import { validatorJWT } from '../middleware/validator-jwt.middlewares';
import { getHelpRequest, postHelpRequest, updateHelpRequest, getMyHelpRequestAssigned, getHelpRequestByIdEnpoint, getListHelpRequest, getHistoryHelpRequest } from '../controller/helpRequest.controller';
import { validateFieldsUpdateHelpRequest, validateLimitOffset } from '../middleware/validations/validateHelpRequest';

const router = Router();

router.get('/getHelpRequest', validatorJWT, getHelpRequest);
router.get('/history/:offset/:limit', [validatorJWT, ...validateLimitOffset], getHistoryHelpRequest);
router.get('/getHelpRequest/:id', validatorJWT, getHelpRequestByIdEnpoint);
router.get('/getMyHelpRequestAssigned', validatorJWT, getMyHelpRequestAssigned);
router.post('/postHelpRequest', validatorJWT, postHelpRequest);
router.post('/getListHelpRequest', validatorJWT, getListHelpRequest);
router.put('/updateHelpRequest', [...validateFieldsUpdateHelpRequest, validatorJWT], updateHelpRequest);

export default router;
