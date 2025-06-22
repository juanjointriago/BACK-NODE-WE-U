import { Router } from 'express';
import { validatorJWT } from '../middleware/validator-jwt.middlewares';
import { asyncMiddleware } from '../middleware/asyncMiddleware';
import { numberUsersZoneByIdProvince } from '../controller/report.controller';

const router = Router();

router.post('/province', validatorJWT, asyncMiddleware(numberUsersZoneByIdProvince));

export default router;
