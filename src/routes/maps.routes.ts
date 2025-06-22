import { Router } from 'express';
import { getGeoCodeGoogleMaps, getGeometryLocationGoogleMaps, getPredictionsGoogleMaps } from '../controller/maps.controller';
import { validatorJWT } from '../middleware/validator-jwt.middlewares';

const router = Router();

router.get('/autocomplete/:input', validatorJWT, getPredictionsGoogleMaps);
router.get('/details/:placeid', validatorJWT, getGeometryLocationGoogleMaps);
router.get('/geocode/:lat/:lng', getGeoCodeGoogleMaps);

export default router;
