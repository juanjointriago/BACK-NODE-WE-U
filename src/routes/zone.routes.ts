import { Router } from 'express';
import { validatorJWT } from '../middleware/validator-jwt.middlewares';
import { addZonesToSubAdmin, getMultipolygonsByIdZone, getMySubZone, getPolygonBySubzone, getSubZonesByIdZone, getSubZonesPolygonByIdZone, getSubzoneByPoint, updateZonesSelected, updateSubzone } from '../controller/zone.controller';
import { validateFieldsUpdateZonesSelected } from '../middleware/validations/validateInputZones';
import { asyncMiddleware } from '../middleware/asyncMiddleware';

const router = Router();

router.post('/addZonesToSubAdmin', [validatorJWT], addZonesToSubAdmin);
router.post('/subzone/coords', [validatorJWT], asyncMiddleware(getSubzoneByPoint));
router.put('/updateZonesSelected', [...validateFieldsUpdateZonesSelected, validatorJWT], updateZonesSelected);
router.get('/subzone', validatorJWT, asyncMiddleware(getMySubZone));
router.get('/subzone/:idSubzone', validatorJWT, asyncMiddleware(getPolygonBySubzone));
router.get('/subzones/:idZone', asyncMiddleware(getSubZonesByIdZone));
router.get('/subzones/:idZone/polygons', asyncMiddleware(getSubZonesPolygonByIdZone));
router.put('/subzone', validatorJWT, asyncMiddleware(updateSubzone));
router.get('/multipolygons/:idZone', validatorJWT, asyncMiddleware(getMultipolygonsByIdZone));

export default router;
