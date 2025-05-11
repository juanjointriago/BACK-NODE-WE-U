import { Router } from 'express';
import { getRoles, getTypesASC, getProvinceByCode, getProvincesAndtheirCities, myZonesSelected, zonesSelected, getProvinceByName } from '../controller/catalog.controller';
import { validatorJWT } from '../middleware/validator-jwt.middlewares';

const router = Router();

router.get('/getRoles', getRoles);
router.get('/getTypesASC', getTypesASC);
router.get('/getProvinceByCode/:codeProvince', getProvinceByCode);
router.get('/getProvinceByName/:name', getProvinceByName);
router.get('/getProvincesAndtheirCities/', getProvincesAndtheirCities);
router.get('/myZonesSelected', validatorJWT, myZonesSelected);
router.get('/zonesSelected', validatorJWT, zonesSelected);

export default router;
