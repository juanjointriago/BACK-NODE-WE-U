import { Router } from 'express';
import { login, resetPassword, loginAdmin, registerUsers, renewToken, confirmAccount, sendEmailResetPassword, loginSMS } from '../controller/auth.controller';
import { validateFieldsLogin, validateFieldsResetPassword, validateFieldsRegister, validateFieldsLoginSMS } from '../middleware/validations/validateAuth';
import { validatorJWT } from '../middleware/validator-jwt.middlewares';
import { asyncMiddleware } from '../middleware/asyncMiddleware';

const router = Router();

router.get('/renewToken', validatorJWT, renewToken);

router.post('/signin', validateFieldsLogin, login);
router.post('/signinAdmin', validateFieldsLogin, loginAdmin);
router.post('/signup', validateFieldsRegister, registerUsers);

router.post('/resetPassword', validateFieldsResetPassword, resetPassword);
router.post('/sendEmailResetPassword', sendEmailResetPassword);
router.get('/confirmAccount/:token', confirmAccount);

// router.post('/signin/sms', validateFieldsLoginSMS, asyncMiddleware(loginSMS));
// router.post('/decodeToken', validatorJWT, decodeToken);
// router.post('/signup', validateFieldsRegister, registedr);
// router.post('/checkToken', checkToken);
// router.get('/generaToken', generaToken);
// router.post('/sendEmailExample', sendEmailExample);

export default router;
