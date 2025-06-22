import { asyncMiddleware } from '../middleware/asyncMiddleware';
import { uploadFiles, uploadFilesAWSS3, uploadFilesGCS } from './../controller/upload.controller';
import { Router } from 'express';

const router = Router();
router.post('/local/:folder', uploadFiles);
router.post('/s3', uploadFilesAWSS3);
router.post('/gcs', asyncMiddleware(uploadFilesGCS));
router.post('/gcs/:folder', asyncMiddleware(uploadFilesGCS));

export default router;
