import { Router } from 'express';
import { validatorJWT } from '../middleware/validator-jwt.middlewares';
import { createSubZone, createUserASC, getMySubscription, paymentAsc, paymentSubscriptionMonthly, paymentSubZone, registerSubscriber, validationFieldRegisterSubscriber, getMyPayments, updateSubzoneByAscId } from '../controller/subscription.controller';
import { asyncMiddleware } from '../middleware/asyncMiddleware';
import { preValidateRegisterSubscriber, validateCreateSubZone, validatePayment, validateRegisterSubscriber, validatePaymentSubzones, validateUpdateSubzoneByAscId } from '../middleware/validations/validateInputsSubscription';
import { validateCreateUserASC } from '../middleware/validations/validateInputsUser';

const router = Router();

router.get('/', validatorJWT, asyncMiddleware(getMySubscription));
router.get('/payments', validatorJWT, asyncMiddleware(getMyPayments));
router.post('/', validateRegisterSubscriber, asyncMiddleware(registerSubscriber));
router.post('/asc', [validatorJWT, ...validateCreateUserASC], asyncMiddleware(createUserASC));
router.post('/subzone', [validatorJWT, ...validateCreateSubZone], asyncMiddleware(createSubZone));
router.post('/validations', preValidateRegisterSubscriber, asyncMiddleware(validationFieldRegisterSubscriber));
router.post('/payment/asc', [validatorJWT, ...validatePayment], asyncMiddleware(paymentAsc));
router.post('/payment/subzone', [validatorJWT, ...validatePaymentSubzones], asyncMiddleware(paymentSubZone));
router.post('/payment/monthly', [validatorJWT, ...validatePayment], asyncMiddleware(paymentSubscriptionMonthly));
router.put('/subzone/asc', [validatorJWT, ...validateUpdateSubzoneByAscId], asyncMiddleware(updateSubzoneByAscId));

export default router;
