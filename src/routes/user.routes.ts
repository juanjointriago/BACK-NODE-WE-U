import { Router } from 'express';
import { getUserById, getUsers, changeStatusUserById, geInfotUserLogged, deleteUser, updateAddressAndCoords, getASCOnline, getUsersFiveKmAround, updateInfoUser, updateSubzoneByUserId, updateAvailableAsc, getPaymentsByUserId, getAscByZone, getAscBySubzone, getAvatars, updateUserAvatar } from '../controller/user.controller';
import { validatorJWT } from '../middleware/validator-jwt.middlewares';
import { validateFieldsChangeStatusUserById, validateFieldsGetUsers, validateFieldsUpdateAddressAndCoords } from '../middleware/validations/validateInputsUser';
import { asyncMiddleware } from '../middleware/asyncMiddleware';

const router = Router();

router.get('/avatars/', asyncMiddleware(getAvatars));
router.get('/subscriber/payments/:idUser', validatorJWT, asyncMiddleware(getPaymentsByUserId));
router.get('/getUserById/:id', validatorJWT, getUserById);
router.get('/geInfotUserLogged', validatorJWT, geInfotUserLogged);
router.get('/getASCOnline', validatorJWT, getASCOnline);
router.get('/zone/:zone_id', [validatorJWT], asyncMiddleware(getAscByZone));
router.get('/subzone/:subzone_id', [validatorJWT], asyncMiddleware(getAscBySubzone));
router.post('/getUsers', [...validateFieldsGetUsers, validatorJWT], getUsers);
router.post('/getUsersFiveKmAround', validatorJWT, getUsersFiveKmAround);
router.put('/changeStatusUserById', [...validateFieldsChangeStatusUserById, validatorJWT], changeStatusUserById);
router.put('/available', [validatorJWT], asyncMiddleware(updateAvailableAsc));
router.put('/updateAddressAndCoords', [...validateFieldsUpdateAddressAndCoords, validatorJWT], updateAddressAndCoords);
router.put('/updateAddressAndCoords/:idCity', [...validateFieldsUpdateAddressAndCoords, validatorJWT], updateAddressAndCoords);
router.put('/updateInfoUser', validatorJWT, updateInfoUser);
router.put('/subzone', validatorJWT, asyncMiddleware(updateSubzoneByUserId));
router.delete('/deleteUser', validatorJWT, deleteUser);
router.put('/updateUserAvatar', validatorJWT, updateUserAvatar);

export default router;
