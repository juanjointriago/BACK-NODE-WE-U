"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const connection_1 = __importDefault(require("../db/connection"));
const index_routes_1 = require("../routes/index.routes");
const controller_1 = require("../sockets/controller");
const apitPaths_1 = require("./apitPaths");
const errorMiddleware_1 = require("../middleware/errorMiddleware");
class Server {
    constructor() {
        this.apiPaths = apitPaths_1.apiPaths;
        console.clear();
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || '8000';
        this.app.use((0, morgan_1.default)('dev'));
        this.server = (0, http_1.createServer)(this.app);
        // Conección DB
        this.dbConnection();
        // Middlewares
        this.middlewares();
        //Definir mis rutas
        this.routes();
        //sockets
        this.io = require('socket.io')(this.server, { cors: { origin: '*' } });
        this.sockets();
    }
    middlewares() {
        //CORDS
        this.app.use((0, cors_1.default)({
            origin: '*',
        }));
        //Lectura del body
        this.app.use(express_1.default.json({ limit: '50mb' }));
        //Capeta Pública
        this.app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
        // this.app.use(express.static('public'));
        this.app.use((0, express_fileupload_1.default)({
            useTempFiles: true,
            tempFileDir: '/tmp/',
            createParentPath: true,
            limits: {
                fieldSize: 50000,
            },
        }));
    }
    dbConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield connection_1.default.authenticate();
                console.log('Base de datos Online');
            }
            catch (error) {
                throw new Error('' + error);
            }
        });
    }
    routes() {
        this.app.use(this.apiPaths.auth, index_routes_1.authRoutes);
        this.app.use(this.apiPaths.uploads, index_routes_1.uploadRoutes);
        this.app.use(this.apiPaths.user, index_routes_1.userRoutes);
        this.app.use(this.apiPaths.catalog, index_routes_1.catalogRoutes);
        this.app.use(this.apiPaths.zone, index_routes_1.zoneRoutes);
        this.app.use(this.apiPaths.helpRequest, index_routes_1.helpRequest);
        this.app.use(this.apiPaths.notification, index_routes_1.notificationRoutes);
        this.app.use(this.apiPaths.complaint, index_routes_1.complaintRoutes);
        this.app.use(this.apiPaths.logbook, index_routes_1.logbookRoutes);
        this.app.use(this.apiPaths.maps, index_routes_1.mapsRoutes);
        this.app.use(this.apiPaths.subs, index_routes_1.subscriptionRoutes);
        this.app.use(this.apiPaths.report, index_routes_1.reportRoutes);
        this.app.use(errorMiddleware_1.errorMiddleware);
    }
    sockets() {
        this.io.on('connection', (socket) => (0, controller_1.socketController)(socket, this.io));
    }
    listen() {
        process.env.TZ;
        this.server.listen(this.port, () => {
            console.log(`Servidor corriendo en el puerto ${this.port}`);
        });
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map