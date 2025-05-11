import { createServer } from 'http';
import express, { Application } from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import db from '../db/connection';
import { authRoutes, catalogRoutes, complaintRoutes, helpRequest, logbookRoutes, notificationRoutes, uploadRoutes, userRoutes, zoneRoutes, mapsRoutes, subscriptionRoutes, reportRoutes } from '../routes/index.routes';

import { Socket } from 'socket.io';
import { socketController } from '../sockets/controller';
import { apiPaths } from './apitPaths';
import { errorMiddleware } from '../middleware/errorMiddleware';

class Server {
  private app: Application;
  private port: string;
  private server;
  private io;
  private apiPaths = apiPaths;
  constructor() {
    console.clear();

    this.app = express();
    this.port = process.env.PORT || '8000';

    this.app.use(morgan('dev'));

    this.server = createServer(this.app);

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
    this.app.use(
      cors({
        origin: '*',
      })
    );
    //Lectura del body
    this.app.use(express.json({ limit: '50mb' }));

    //Capeta Pública
    this.app.use(express.static(path.join(__dirname, '../public')));
    // this.app.use(express.static('public'));

    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
        createParentPath: true,
        limits: {
          fieldSize: 50000,
        },
      })
    );
  }

  async dbConnection() {
    try {
      await db.authenticate();
      console.log('Base de datos Online');
    } catch (error) {
      console.warn({error})
      throw new Error('' + error);
    }
  }

  routes() {
    this.app.use(this.apiPaths.auth, authRoutes);
    this.app.use(this.apiPaths.uploads, uploadRoutes);
    this.app.use(this.apiPaths.user, userRoutes);
    this.app.use(this.apiPaths.catalog, catalogRoutes);
    this.app.use(this.apiPaths.zone, zoneRoutes);
    this.app.use(this.apiPaths.helpRequest, helpRequest);
    this.app.use(this.apiPaths.notification, notificationRoutes);
    this.app.use(this.apiPaths.complaint, complaintRoutes);
    this.app.use(this.apiPaths.logbook, logbookRoutes);
    this.app.use(this.apiPaths.maps, mapsRoutes);
    this.app.use(this.apiPaths.subs, subscriptionRoutes);
    this.app.use(this.apiPaths.report, reportRoutes);
    this.app.use(errorMiddleware);
  }

  sockets() {
    this.io.on('connection', (socket: Socket) => socketController(socket, this.io));
  }

  listen() {
    process.env.TZ;

    this.server.listen(this.port, () => {
      console.log(`Servidor corriendo en el puerto ${this.port}`);
    });
  }
}

export default Server;
