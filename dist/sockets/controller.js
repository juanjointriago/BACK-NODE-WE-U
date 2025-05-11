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
exports.socketController = void 0;
const generate_jwt_1 = require("../helpers/generate-jwt");
const user_controller_1 = require("../controller/user.controller");
const zone_controller_1 = require("../controller/zone.controller");
const user_model_1 = __importDefault(require("../models/user.model"));
const helpRequest_controller_1 = require("../controller/helpRequest.controller");
const notification_controller_1 = require("../controller/notification.controller");
const complaint_controller_1 = require("../controller/complaint.controller");
const scheduler_1 = require("../helpers/scheduler");
const user_enum_1 = require("../enums/user.enum");
const socketController = (socket, io) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    if ((_a = socket.handshake.query['Authorization']) === null || _a === void 0 ? void 0 : _a.toString()) {
        const [valido, object] = (0, generate_jwt_1.comprobarJWT)((_b = socket.handshake.query['Authorization']) === null || _b === void 0 ? void 0 : _b.toString());
        const date = new Date().toString();
        if (!valido) {
            console.log('socket no identificado');
            return socket.disconnect();
        }
        const user = yield (0, user_controller_1.updateOnlineUser)(object.id);
        console.log('cliente conectado', user === null || user === void 0 ? void 0 : user.toJSON(), date);
        // Unir al usuario a una sala de socket.io
        socket.join(object.id);
        // tracking para emiter la posición de los agentes de seguridad ciudadana al
        // administrador de la zona y/o ciudadano que tenga una solicitud de auxilio
        socket.on('tracking-asc', (payload) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield (0, user_controller_1.getUserStatusAssignedById)(object.id);
            if (user) {
                yield user.update({ lat: payload.lat, lng: payload.lng });
                const subAdmin = yield (0, zone_controller_1.getSubAdmin)(user.get().zone_id);
                const adminSubscriber = yield (0, zone_controller_1.getAdminSubZone)(user.get().subzone_id);
                const toEmmit = Object.assign(Object.assign({}, user.toJSON()), { lat: payload.lat, lng: payload.lng });
                if (subAdmin) {
                    io.to(subAdmin).emit('tracking-asc', toEmmit);
                }
                if (adminSubscriber) {
                    io.to(adminSubscriber).emit('tracking-asc', toEmmit);
                }
                if (payload.user_id) {
                    io.to(payload.user_id).emit('tracking-asc', toEmmit);
                }
            }
        }));
        /////////////////////////////////////////////////////////////////
        ////////////////     HELP REQUEST SOCKETS     ///////////////////
        /////////////////////////////////////////////////////////////////
        // tracking para emiter la posicion del usuario al asc en un solicitud de auxilio
        socket.on('tracking-help-request', (payload) => __awaiter(void 0, void 0, void 0, function* () {
            const helpRequest = yield (0, helpRequest_controller_1.getHelpRequestById)(payload.id);
            if (helpRequest) {
                if (helpRequest.get().status !== 'accepted')
                    return;
                const toEmmit = {
                    id: helpRequest.get().user.id,
                    full_name: helpRequest.get().user.name,
                    zone_id: helpRequest.get().zone.id,
                    lat: payload.lat,
                    lng: payload.lng,
                };
                if (helpRequest.get().asc.id) {
                    io.to(helpRequest.get().asc.id).emit('tracking-help-request', toEmmit);
                }
            }
        }));
        // notificar nueva solicitud de auxilio a sub admin y asc
        socket.on('new-help-request', (payload) => __awaiter(void 0, void 0, void 0, function* () {
            const helpRequestDB = yield (0, helpRequest_controller_1.getHelpRequestById)(payload.id);
            if (helpRequestDB) {
                const subAdmin = yield (0, zone_controller_1.getSubAdmin)(helpRequestDB.get().zone.id);
                const adminSubscriber = yield (0, zone_controller_1.getAdminSubZone)(helpRequestDB.get().subzone_id);
                const agents = yield (0, user_controller_1.getASCByZoneId)(helpRequestDB.get().zone.id);
                const agentsBySubZone = yield (0, user_controller_1.getASCBySubZoneId)(helpRequestDB.get().subzone_id);
                const toEmmit = Object.assign({}, helpRequestDB.toJSON());
                if (subAdmin) {
                    io.to(subAdmin).emit('new-help-request', toEmmit);
                }
                if (payload.subzone_id) {
                    if (adminSubscriber) {
                        io.to(adminSubscriber).emit('new-help-request', toEmmit);
                    }
                }
                if (agents.length > 0) {
                    agents.map((agent) => {
                        if (toEmmit.status === 'pending') {
                            (0, notification_controller_1.sendNotificationExpoUser)({
                                expoToken: agent.get().expo_token,
                                message: 'Solicitud de auxilio',
                                title: 'Solicitud de auxilio aceptada',
                                data: { id: toEmmit.id, status: toEmmit.status },
                            });
                        }
                    });
                    io.to(agents.map((agent) => agent.get().id)).emit('new-help-request', toEmmit);
                }
                if (payload.subzone_id) {
                    if (agentsBySubZone.length > 0) {
                        agentsBySubZone.map((agent) => {
                            if (toEmmit.status === 'pending') {
                                (0, notification_controller_1.sendNotificationExpoUser)({
                                    expoToken: agent.get().expo_token,
                                    message: 'Solicitud de auxilio',
                                    title: 'Solicitud de auxilio aceptada',
                                    data: { id: toEmmit.id, status: toEmmit.status },
                                });
                            }
                        });
                        io.to(agentsBySubZone.map((agent) => agent.get().id)).emit('new-help-request', toEmmit);
                    }
                }
            }
        }));
        // notificar al asc la actualización del estado de la solicitud
        socket.on('asc-help-request', (payload) => __awaiter(void 0, void 0, void 0, function* () {
            const helpRequestDB = yield (0, helpRequest_controller_1.getHelpRequestById)(payload.id);
            if (helpRequestDB) {
                const subAdmin = yield (0, zone_controller_1.getSubAdmin)(helpRequestDB.get().zone.id);
                const subscriber = yield (0, zone_controller_1.getAdminSubZone)(helpRequestDB.get().subzone_id);
                const toEmmit = Object.assign({}, helpRequestDB.toJSON());
                if (user) {
                    if (user.get().role_id === user_enum_1.UserRoles.SubAdmin || user.get().role_id === user_enum_1.UserRoles.Subscriber) {
                        const date = new Date().setMinutes(new Date().getMinutes() + 2);
                        (0, scheduler_1.schedulerProgram)(date, () => __awaiter(void 0, void 0, void 0, function* () {
                            const helpRequestDBSchedule = yield (0, helpRequest_controller_1.getHelpRequestById)(payload.id);
                            if (helpRequestDBSchedule) {
                                if (helpRequestDBSchedule.get().status === 'pending') {
                                    yield (0, helpRequest_controller_1.updateAscHelpRequestById)(toEmmit.id);
                                    const helpDB = yield (0, helpRequest_controller_1.getHelpRequestById)(toEmmit.id);
                                    const toEmmitSchedule = Object.assign({}, helpDB === null || helpDB === void 0 ? void 0 : helpDB.toJSON());
                                    const notification = {
                                        receiverId: object.id,
                                        title: 'Asignación no aceptada',
                                        body: `El ASC ${toEmmit.asc.full_name} no ha aceptado la solicitud que le asigno`,
                                        type: 5,
                                        senderId: object.id,
                                    };
                                    yield notificationToAdmin(notification);
                                    io.to(subAdmin).emit('new-help-request', toEmmitSchedule);
                                    io.to(subscriber).emit('new-help-request', toEmmitSchedule);
                                    if (toEmmit.asc) {
                                        const user = yield (0, user_controller_1.getUserStatusAssignedById)(toEmmit.asc.id);
                                        io.to(subAdmin).emit('tracking-asc', user);
                                    }
                                }
                            }
                        }));
                    }
                }
                if (subAdmin) {
                    io.to(subAdmin).emit('new-help-request', toEmmit);
                    if (toEmmit.asc) {
                        const user = yield (0, user_controller_1.getUserStatusAssignedById)(toEmmit.asc.id);
                        io.to(subAdmin).emit('tracking-asc', user);
                    }
                }
                if (subscriber) {
                    io.to(subscriber).emit('new-help-request', toEmmit);
                    if (toEmmit.asc) {
                        const user = yield (0, user_controller_1.getUserStatusAssignedById)(toEmmit.asc.id);
                        io.to(subAdmin).emit('tracking-asc', user);
                    }
                }
                if (helpRequestDB.get().asc) {
                    io.to(helpRequestDB.get().asc.id).emit('asc-help-request', toEmmit);
                }
            }
        }));
        // notificar al user la actualización del estado de la solicitud
        socket.on('user-help-request', (payload) => __awaiter(void 0, void 0, void 0, function* () {
            const helpRequestDB = yield (0, helpRequest_controller_1.getHelpRequestById)(payload.id);
            if (helpRequestDB) {
                const subAdmin = yield (0, zone_controller_1.getSubAdmin)(helpRequestDB.get().zone.id);
                const agents = yield (0, user_controller_1.getASCByZoneId)(helpRequestDB.get().zone.id);
                const subscriber = yield (0, zone_controller_1.getAdminSubZone)(helpRequestDB.get().subzone_id);
                const toEmmit = Object.assign({}, helpRequestDB.toJSON());
                if (subAdmin) {
                    if (toEmmit.status === 'accepted') {
                        const notification = {
                            receiverId: subAdmin,
                            title: 'Solicitud de auxilio aceptada',
                            body: `El ASC ${toEmmit.asc.full_name} ha aceptado la solicitud que le asigno`,
                            type: 3,
                            senderId: object.id,
                        };
                        yield notificationToAdmin(notification);
                    }
                    io.to(subAdmin).emit('new-help-request', toEmmit);
                }
                if (subscriber) {
                    if (toEmmit.status === 'accepted') {
                        const notification = {
                            receiverId: subscriber,
                            title: 'Solicitud de auxilio aceptada',
                            body: `El ASC ${toEmmit.asc.full_name} ha aceptado la solicitud que le asigno`,
                            type: 3,
                            senderId: object.id,
                        };
                        yield notificationToAdmin(notification);
                    }
                    io.to(subscriber).emit('new-help-request', toEmmit);
                }
                if (agents.length > 0) {
                    io.to(agents.filter((agent) => agent.get().id !== helpRequestDB.get().asc.id).map((agent) => agent.get().id)).emit('new-help-request', toEmmit);
                }
                if (helpRequestDB.get().user) {
                    io.to(helpRequestDB.get().user.id).emit('user-help-request', toEmmit);
                }
            }
        }));
        /////////////////////////////////////////////////////////////////
        ////////////////     NOTIFICACIONES ADMIN SOCKETS     //////////
        ///////////////////////////////////////////////////////////////
        // notificar al super admin un registro de usuario
        // notificar al subadmin correspondiente que sus zonas que selecciono han sido aceptadas
        socket.on('zones-accepted', (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const userAdmin = yield user_model_1.default.findOne({
                    where: { id: data.idSubAdmin, role_id: 2, is_active: 1, is_deleted: 0 },
                    attributes: ['id'],
                });
                if (userAdmin) {
                    const toEmit = {
                        receiverId: userAdmin.get().id,
                        title: data.title,
                        body: data.body,
                        type: 2,
                        senderId: object.id,
                    };
                    notificationToAdmin(toEmit);
                }
            }
            catch (error) {
                console.log('-->', error);
            }
        }));
        // notificar al subadmin correspondiente que sus zonas que selecciono han sido aceptadas
        socket.on('zones-selected', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const userAdmin = yield user_model_1.default.findOne({
                    where: { role_id: 1, is_active: 1, is_deleted: 0 },
                    attributes: ['id', 'full_name'],
                });
                if (userAdmin) {
                    const toEmit = {
                        receiverId: userAdmin.get().id,
                        title: 'Solicitud de zonas',
                        body: `El sub administrador ${object.full_name}, solicita la aprobación de nuevas zonas`,
                        type: 4,
                        senderId: object.id,
                    };
                    notificationToAdmin(toEmit);
                }
            }
            catch (error) {
                console.log('-->', error);
            }
        }));
        /////////////////////////////////////////////////////////////////
        ////////////////     COMPLAINTS SOCKETS     ////////////////////
        ///////////////////////////////////////////////////////////////
        // notificar nueva solicitud de auxilio a sub admin y asc
        socket.on('new-complaint', (payload) => __awaiter(void 0, void 0, void 0, function* () {
            const complaintDB = yield (0, complaint_controller_1.getComplaintById)(payload.id);
            if (complaintDB) {
                const subAdmin = yield (0, zone_controller_1.getSubAdmin)(complaintDB.get().zone.id);
                const agents = yield (0, user_controller_1.getASCByZoneId)(complaintDB.get().zone.id);
                const adminSubscriber = complaintDB.get().subzone_id ? yield (0, zone_controller_1.getAdminSubZone)(complaintDB.get().subzone_id) : null;
                const agentsBySubZone = complaintDB.get().subzone_id ? yield (0, user_controller_1.getASCBySubZoneId)(complaintDB.get().subzone_id) : null;
                const toEmmit = Object.assign({}, complaintDB.toJSON());
                if (subAdmin) {
                    io.to(subAdmin).emit('new-complaint', toEmmit);
                }
                if (payload.subzone_id) {
                    if (adminSubscriber) {
                        io.to(adminSubscriber).emit('new-complaint', toEmmit);
                    }
                }
                if (agents.length > 0) {
                    agents.map((agent) => {
                        if (toEmmit.status === 'pending') {
                            (0, notification_controller_1.sendNotificationExpoUser)({
                                expoToken: agent.get().expo_token,
                                title: 'Denuncia de la comunidad',
                                message: 'Nueva denuncia de la comunidad',
                                data: { id: toEmmit.id, status: toEmmit.status },
                            });
                        }
                    });
                    io.to(agents.map((agent) => agent.get().id)).emit('new-complaint', toEmmit);
                }
                if (payload.subzone_id) {
                    if (agentsBySubZone) {
                        if (agentsBySubZone.length > 0) {
                            agentsBySubZone.map((agent) => {
                                if (toEmmit.status === 'pending') {
                                    (0, notification_controller_1.sendNotificationExpoUser)({
                                        expoToken: agent.get().expo_token,
                                        title: 'Denuncia de la comunidad',
                                        message: 'Nueva denuncia de la comunidad',
                                        data: { id: toEmmit.id, status: toEmmit.status },
                                    });
                                }
                            });
                            io.to(agentsBySubZone.map((agent) => agent.get().id)).emit('new-complaint', toEmmit);
                        }
                    }
                }
            }
        }));
        // notificar al asc la actualización del estado de la denuncia
        socket.on('complaint-update', (payload) => __awaiter(void 0, void 0, void 0, function* () {
            const complaintDB = yield (0, complaint_controller_1.getComplaintById)(payload.id);
            if (complaintDB) {
                const subAdmin = yield (0, zone_controller_1.getSubAdmin)(complaintDB.get().zone.id);
                const adminSubscriber = complaintDB.get().subzone_id ? yield (0, zone_controller_1.getAdminSubZone)(complaintDB.get().subzone_id) : null;
                const toEmmit = Object.assign({}, complaintDB.toJSON());
                if (subAdmin) {
                    if (toEmmit.status === 'accepted') {
                        const notification = {
                            receiverId: subAdmin,
                            title: 'Asignación aceptada',
                            body: `El ASC ${toEmmit.asc.full_name} ha aceptado la asignación de denuncia`,
                            type: 5,
                            senderId: object.id,
                        };
                        yield notificationToAdmin(notification);
                    }
                    io.to(subAdmin).emit('new-complaint', toEmmit);
                }
                if (adminSubscriber) {
                    if (toEmmit.status === 'accepted') {
                        const notification = {
                            receiverId: adminSubscriber,
                            title: 'Asignación aceptada',
                            body: `El ASC ${toEmmit.asc.full_name} ha aceptado la asignación de denuncia`,
                            type: 5,
                            senderId: object.id,
                        };
                        yield notificationToAdmin(notification);
                    }
                    io.to(adminSubscriber).emit('new-complaint', toEmmit);
                }
                if (user) {
                    if (user.get().role_id === user_enum_1.UserRoles.SubAdmin) {
                        const date = new Date().setMinutes(new Date().getMinutes() + 2);
                        (0, scheduler_1.schedulerProgram)(date, () => __awaiter(void 0, void 0, void 0, function* () {
                            const complaintDB = yield (0, complaint_controller_1.getComplaintById)(payload.id);
                            if (complaintDB) {
                                if (complaintDB.get().status === 'pending') {
                                    yield (0, complaint_controller_1.updateComplaintAscById)(toEmmit.id);
                                    const complaintDBSchedule = yield (0, complaint_controller_1.getComplaintById)(payload.id);
                                    const notification = {
                                        receiverId: object.id,
                                        title: 'Asignación no aceptada',
                                        body: `El ASC ${toEmmit.asc.full_name} no ha aceptado la asignación de denuncia`,
                                        type: 5,
                                        senderId: object.id,
                                    };
                                    const toEmmitSchedule = Object.assign({}, complaintDBSchedule === null || complaintDBSchedule === void 0 ? void 0 : complaintDBSchedule.toJSON());
                                    yield notificationToAdmin(notification);
                                    io.to(subAdmin).emit('new-complaint', toEmmitSchedule);
                                    if (toEmmit.asc) {
                                        const user = yield (0, user_controller_1.getUserStatusAssignedById)(toEmmit.asc.id);
                                        io.to(subAdmin).emit('tracking-asc', user);
                                    }
                                }
                            }
                        }));
                    }
                    if (user.get().role_id === user_enum_1.UserRoles.Subscriber) {
                        const date = new Date().setMinutes(new Date().getMinutes() + 2);
                        (0, scheduler_1.schedulerProgram)(date, () => __awaiter(void 0, void 0, void 0, function* () {
                            const complaintDB = yield (0, complaint_controller_1.getComplaintById)(payload.id);
                            if (complaintDB) {
                                if (complaintDB.get().status === 'pending') {
                                    yield (0, complaint_controller_1.updateComplaintAscById)(toEmmit.id);
                                    const complaintDBSchedule = yield (0, complaint_controller_1.getComplaintById)(payload.id);
                                    const notification = {
                                        receiverId: object.id,
                                        title: 'Asignación no aceptada',
                                        body: `El ASC ${toEmmit.asc.full_name} no ha aceptado la asignación de denuncia`,
                                        type: 5,
                                        senderId: object.id,
                                    };
                                    const toEmmitSchedule = Object.assign({}, complaintDBSchedule === null || complaintDBSchedule === void 0 ? void 0 : complaintDBSchedule.toJSON());
                                    yield notificationToAdmin(notification);
                                    io.to(subAdmin).emit('new-complaint', toEmmitSchedule);
                                    if (toEmmit.asc) {
                                        const user = yield (0, user_controller_1.getUserStatusAssignedById)(toEmmit.asc.id);
                                        io.to(subAdmin).emit('tracking-asc', user);
                                    }
                                }
                            }
                        }));
                    }
                }
                if (complaintDB.get().asc) {
                    io.to(complaintDB.get().asc.id).emit('complaint-update', toEmmit);
                    if (toEmmit.asc) {
                        const user = yield (0, user_controller_1.getUserStatusAssignedById)(toEmmit.asc.id);
                        io.to(subAdmin).emit('tracking-asc', user);
                    }
                }
                if (complaintDB.get().user) {
                    io.to(complaintDB.get().user.id).emit('complaint-update', toEmmit);
                }
            }
        }));
        socket.on('disconnect', () => __awaiter(void 0, void 0, void 0, function* () {
            const date = `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()} ${new Date().getHours()}:${new Date().getMinutes()}`;
            const user = yield (0, user_controller_1.updateOfflineUser)(object.id);
            console.log('cliente desconectado', user === null || user === void 0 ? void 0 : user.toJSON(), date);
        }));
    }
    else {
        if (!((_c = socket.handshake.query['SecretKey']) === null || _c === void 0 ? void 0 : _c.toString())) {
            console.log('socket no identificado');
            return socket.disconnect();
        }
        // notificar al super admin un registro de usuario
        socket.on('new-user', (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const userAdmin = yield (0, user_controller_1.getUserSuperAdmin)();
                const newUser = yield (0, user_controller_1.getUserByIdAndIsActive)(data.id, false);
                if (!newUser)
                    return;
                const role_id = newUser.get().role_id;
                const roleName = () => {
                    if (role_id === 2)
                        return 'Sub administrador';
                    if (role_id === 3)
                        return 'Agente';
                    return 'Ciudadano';
                };
                if (userAdmin) {
                    const toEmit = {
                        receiverId: userAdmin === null || userAdmin === void 0 ? void 0 : userAdmin.get().id,
                        title: `Nuevo usuario ${roleName()}`,
                        body: `${newUser === null || newUser === void 0 ? void 0 : newUser.get().full_name} con cédula ${newUser === null || newUser === void 0 ? void 0 : newUser.get().identification} se ha registrado`,
                        type: 1,
                        senderId: newUser.get().id,
                    };
                    const resp = yield (0, notification_controller_1.saveNotificationToAdminSocket)(toEmit);
                    if (resp.data) {
                        console.log('new-user', userAdmin === null || userAdmin === void 0 ? void 0 : userAdmin.get().id);
                        io.emit(`listen-notification-${userAdmin === null || userAdmin === void 0 ? void 0 : userAdmin.get().id}`, resp.data);
                    }
                }
            }
            catch (error) {
                console.log('-->', error);
            }
        }));
    }
    const notificationToAdmin = (data) => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, notification_controller_1.saveNotificationToAdminSocket)(data);
        if (resp.data) {
            io.to(data.receiverId).emit('listen-notification', resp.data);
        }
    });
});
exports.socketController = socketController;
/*
socket.emit('message', "this is a test"); //enviando solo al remitente-cliente
socket.broadcast.emit('message', "this is a test"); //Envío a todas las clientas excepto remitente
socket.broadcast.to('game').emit('message', 'nice game'); //Enviando a todos los clientes en la sala de 'juegos' (canal) excepto al remitente
socket.to('game').emit('message', 'enjoy the game'); //enviando al cliente remitente, solo si están en la sala de 'juegos' (canal)
socket.broadcast.to(socketid).emit('message', 'for your eyes only'); //enviando a socketid individual
io.emit('message', "this is a test"); //enviando a todos los clientes, incluye remitente
io.in('game').emit('message', 'cool game'); //enviar a todos los clientes en la sala de 'juegos' (canal), incluir remitente
io.of('myNamespace').emit('message', 'gg'); //enviar a todos los clientes en el espacio de nombres 'myNamespace', incluir remitente
socket.emit(); //Enviar a todos los clientes conectados
socket.broadcast.emit(); //enviar a todos los clientes conectados excepto al que envió el mensaje
socket.on(); //Detector de eventos, se puede llamar en el cliente para ejecutar en el servidor
io.socket.socket(); //Para emitir a clientes específicos
io.socket.emit(); //enviar a todos los clientes conectados (igual que socket.emit)
io.socket.on() ; //conexión inicial de un cliente.
*/
//# sourceMappingURL=controller.js.map