"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TWILIO_AUTH_TOKEN = exports.TWILIO_ACCOUNT_SID = exports.KEYFILENAME = exports.BUCKET_NAME = exports.PROJECT_ID = exports.COMPONENTS = exports.LANGUAGE = exports.KEY_MAPS = exports.AWS_SECRET_KEY = exports.AWS_PUBLIC_KEY = exports.AWS_BUCKET_REGION = exports.AWS_BUCKET_NAME = exports.PASSWORDDB = exports.USERDB = exports.HOSTDB = exports.DB = exports.PORTEMAIL = exports.HOSTEMAIL = exports.PASSWORDEMAIL = exports.EMAIL = exports.HOSTWEB = exports.HOSTNAME = exports.SECRETORPRIVATEKEY = exports.PORT = exports.NODE_ENV = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
// General
exports.NODE_ENV = process.env.NODE_ENV || 'dev';
exports.PORT = process.env.PORT || '8080';
exports.SECRETORPRIVATEKEY = process.env.SECRETORPRIVATEKEY || '3estaESla4pliCacionD3w3-|_|';
exports.HOSTNAME = process.env.HOSTNAME || 'http://localhost:8080';
exports.HOSTWEB = process.env.HOSTWEB || 'http://127.0.0.1:5173';
// Email
exports.EMAIL = process.env.EMAIL || 'devdepartment884@gmail.com';
exports.PASSWORDEMAIL = process.env.PASSWORDEMAIL || 'qlxlzdhsviyucysv';
exports.HOSTEMAIL = process.env.HOSTEMAIL || 'smtp.gmail.com';
exports.PORTEMAIL = process.env.PORTEMAIL || '465';
// Database
exports.DB = process.env.DB || 'nousproyec1_we_u';
exports.HOSTDB = process.env.HOSTDB || 'priva230.spindns.com';
exports.USERDB = process.env.USERDB || 'nousproyec1_we_u';
exports.PASSWORDDB = process.env.PASSWORDDB || 'd0KlLxdO@OBD';
// aws - s3
exports.AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || '';
exports.AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION || '';
exports.AWS_PUBLIC_KEY = process.env.AWS_PUBLIC_KEY || '';
exports.AWS_SECRET_KEY = process.env.AWS_SECRET_KEY || '';
// Google maps
exports.KEY_MAPS = process.env.KEY_MAPS || '';
exports.LANGUAGE = process.env.LANGUAGE || 'es';
exports.COMPONENTS = process.env.COMPONENTS || 'country%3Aec';
// Google cloud
//Storage
exports.PROJECT_ID = process.env.PROJECT_ID || '509714053184';
exports.BUCKET_NAME = process.env.BUCKET_NAME || 'weu-bucket';
exports.KEYFILENAME = process.env.KEYFILENAME || './we-u-servers.json';
// Twilio
exports.TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'AC627cde0e410d64529758f4aef9cb7b1e';
exports.TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '9a4c673435269fe65f1c27fd22395bd5';
//# sourceMappingURL=config.js.map