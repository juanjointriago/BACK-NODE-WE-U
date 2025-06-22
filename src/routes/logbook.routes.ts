import { Router } from 'express';
import { validatorJWT } from '../middleware/validator-jwt.middlewares';
import { postLogbook, postCoordsLogbook, getLogbookById, getMylastLogbook, getAllLogbooks, getPhotosByPointId, updateLogbook, getLogbookHistory } from '../controller/logobook.controller';
import { validateLimitOffset } from '../middleware/validations/validateHelpRequest';

const router = Router();

router.get('/getLogbookById/:idLogbook', validatorJWT, getLogbookById);
router.get('/getMylastLogbook', validatorJWT, getMylastLogbook);
router.get('/getPhotosByPointId/:idCoord', validatorJWT, getPhotosByPointId);
router.get('/history/:offset/:limit', [validatorJWT, ...validateLimitOffset], getLogbookHistory);


router.post('/getAllLogbooks', validatorJWT, getAllLogbooks);
router.post('/postLogbook', validatorJWT, postLogbook);
router.post('/postCoordsLogbook', validatorJWT, postCoordsLogbook);
router.put('/:id', validatorJWT, updateLogbook);

export default router;
