import { config } from 'dotenv';

config();

// General
export const NODE_ENV = process.env.NODE_ENV || 'dev';
export const PORT = process.env.PORT || '8080';
export const SECRETORPRIVATEKEY = process.env.SECRETORPRIVATEKEY || '3estaESla4pliCacionD3w3-|_|';
export const HOSTNAME = process.env.HOSTNAME || 'http://localhost:8080';
export const HOSTWEB = process.env.HOSTWEB || 'http://127.0.0.1:5173';

// Email
export const EMAIL = process.env.EMAIL || 'devdepartment884@gmail.com';
export const PASSWORDEMAIL = process.env.PASSWORDEMAIL || 'qlxlzdhsviyucysv';
export const HOSTEMAIL = process.env.HOSTEMAIL || 'smtp.gmail.com';
export const PORTEMAIL = process.env.PORTEMAIL || '465';

// Database
export const DB = process.env.DB || 'nousproyec1_we_u';
export const HOSTDB = process.env.HOSTDB || 'priva230.spindns.com';
export const USERDB = process.env.USERDB || 'nousproyec1_we_u';
export const PASSWORDDB = process.env.PASSWORDDB || 'd0KlLxdO@OBD';

// aws - s3
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || '';
export const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION || '';
export const AWS_PUBLIC_KEY = process.env.AWS_PUBLIC_KEY || '';
export const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY || '';

// Google maps
export const KEY_MAPS = process.env.KEY_MAPS || '';
export const LANGUAGE = process.env.LANGUAGE || 'es';
export const COMPONENTS = process.env.COMPONENTS || 'country%3Aec';

// Google cloud
//Storage
export const PROJECT_ID = process.env.PROJECT_ID || '509714053184';
export const BUCKET_NAME = process.env.BUCKET_NAME || 'weu-bucket';
export const KEYFILENAME = process.env.KEYFILENAME || './we-u-servers.json';
// Twilio
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'AC627cde0e410d64529758f4aef9cb7b1e';
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '9a4c673435269fe65f1c27fd22395bd5';
