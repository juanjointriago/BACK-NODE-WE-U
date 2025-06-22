import { Router } from 'express';
import { getNotifications, putViewedNotification, deleteNotification, deleteAllNotification } from '../controller/notification.controller';
import { validatorJWT } from '../middleware/validator-jwt.middlewares';

const router = Router();

router.get('/getNotifications', validatorJWT, getNotifications);
router.put('/putViewedNotification', validatorJWT, putViewedNotification);
router.delete('/deleteNotification', validatorJWT, deleteNotification);
router.delete('/deleteAllNotification', validatorJWT, deleteAllNotification);

export default router;
