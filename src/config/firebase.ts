import * as admin from 'firebase-admin';
import * as path from 'path';

const serviceAccount = require(path.join(__dirname, '../../src/config/firebase-service-account.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'we-u-ae81d.firebasestorage.app',
  });
}

const bucket = admin.storage().bucket();
export { bucket };
