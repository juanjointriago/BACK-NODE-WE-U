import { Socket } from 'socket.io';
import { comprobarJWT } from '../helpers/generate-jwt';
import { updateOnlineUser, updateOfflineUser, getASCByZoneId, getUserSuperAdmin, getUserByIdAndIsActive, getUserStatusAssignedById, getASCBySubZoneId } from '../controller/user.controller';
import { getAdminSubZone, getSubAdmin } from '../controller/zone.controller';
import User from '../models/user.model';
import { getHelpRequestById, updateAscHelpRequestById } from '../controller/helpRequest.controller';
import { saveNotificationToAdminSocket, sendNotificationExpoUser } from '../controller/notification.controller';
import { INotification } from '../interfaces/notification.interfaces';
import { getComplaintById, updateComplaintAscById } from '../controller/complaint.controller';
import { schedulerProgram } from '../helpers/scheduler';
import { NewHelpRequest } from '../interfaces/socket.interface';
import { UserRoles } from '../enums/user.enum';

export const socketController = async (socket: Socket, io: any) => {
  if (socket.handshake.query['Authorization']?.toString()) {
    const [valido, object] = comprobarJWT(socket.handshake.query['Authorization']?.toString());

    const date = new Date().toString();

    if (!valido) {
      console.log('socket no identificado');
      return socket.disconnect();
    }

    const user = await updateOnlineUser(object.id);
    console.log('cliente conectado', user?.toJSON(), date);

    // Unir al usuario a una sala de socket.io
    socket.join(object.id);

    // tracking para emiter la posición de los agentes de seguridad ciudadana al
    // administrador de la zona y/o ciudadano que tenga una solicitud de auxilio
    socket.on('tracking-asc', async (payload) => {
      const user = await getUserStatusAssignedById(object.id);

      if (user) {
        await user.update({ lat: payload.lat, lng: payload.lng });

        const subAdmin = await getSubAdmin(user.get().zone_id);

        const adminSubscriber = await getAdminSubZone(user.get().subzone_id);

        const toEmmit = {
          ...user.toJSON(),
          lat: payload.lat,
          lng: payload.lng,
        };

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
    });

    /////////////////////////////////////////////////////////////////
    ////////////////     HELP REQUEST SOCKETS     ///////////////////
    /////////////////////////////////////////////////////////////////

    // tracking para emiter la posicion del usuario al asc en un solicitud de auxilio
    socket.on('tracking-help-request', async (payload) => {
      const helpRequest = await getHelpRequestById(payload.id);

      if (helpRequest) {
        if (helpRequest.get().status !== 'accepted') return;

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
    });

    // notificar nueva solicitud de auxilio a sub admin y asc
    socket.on('new-help-request', async (payload: NewHelpRequest) => {
      const helpRequestDB = await getHelpRequestById(payload.id);

      if (helpRequestDB) {
        const subAdmin = await getSubAdmin(helpRequestDB.get().zone.id);
        const adminSubscriber = await getAdminSubZone(helpRequestDB.get().subzone_id);
        const agents = await getASCByZoneId(helpRequestDB.get().zone.id);
        const agentsBySubZone = await getASCBySubZoneId(helpRequestDB.get().subzone_id);

        const toEmmit = {
          ...helpRequestDB.toJSON(),
        };

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
              sendNotificationExpoUser({
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
                sendNotificationExpoUser({
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
    });

    // notificar al asc la actualización del estado de la solicitud
    socket.on('asc-help-request', async (payload) => {
      const helpRequestDB = await getHelpRequestById(payload.id);

      if (helpRequestDB) {
        const subAdmin = await getSubAdmin(helpRequestDB.get().zone.id);
        const subscriber = await getAdminSubZone(helpRequestDB.get().subzone_id);

        const toEmmit = {
          ...helpRequestDB.toJSON(),
        };

        if (user) {
          if (user.get().role_id === UserRoles.SubAdmin || user.get().role_id === UserRoles.Subscriber) {
            const date = new Date().setMinutes(new Date().getMinutes() + 2);

            schedulerProgram(date, async () => {
              const helpRequestDBSchedule = await getHelpRequestById(payload.id);

              if (helpRequestDBSchedule) {
                if (helpRequestDBSchedule.get().status === 'pending') {
                  await updateAscHelpRequestById(toEmmit.id);
                  const helpDB = await getHelpRequestById(toEmmit.id);

                  const toEmmitSchedule = {
                    ...helpDB?.toJSON(),
                  };

                  const notification: INotification = {
                    receiverId: object.id,
                    title: 'Asignación no aceptada',
                    body: `El ASC ${toEmmit.asc.full_name} no ha aceptado la solicitud que le asigno`,
                    type: 5,
                    senderId: object.id,
                  };

                  await notificationToAdmin(notification);

                  io.to(subAdmin).emit('new-help-request', toEmmitSchedule);

                  io.to(subscriber).emit('new-help-request', toEmmitSchedule);

                  if (toEmmit.asc) {
                    const user = await getUserStatusAssignedById(toEmmit.asc.id);
                    io.to(subAdmin).emit('tracking-asc', user);
                  }
                }
              }
            });
          }
        }

        if (subAdmin) {
          io.to(subAdmin).emit('new-help-request', toEmmit);
          if (toEmmit.asc) {
            const user = await getUserStatusAssignedById(toEmmit.asc.id);
            io.to(subAdmin).emit('tracking-asc', user);
          }
        }

        if (subscriber) {
          io.to(subscriber).emit('new-help-request', toEmmit);
          if (toEmmit.asc) {
            const user = await getUserStatusAssignedById(toEmmit.asc.id);
            io.to(subAdmin).emit('tracking-asc', user);
          }
        }

        if (helpRequestDB.get().asc) {
          io.to(helpRequestDB.get().asc.id).emit('asc-help-request', toEmmit);
        }
      }
    });

    // notificar al user la actualización del estado de la solicitud
    socket.on('user-help-request', async (payload) => {
      const helpRequestDB = await getHelpRequestById(payload.id);

      if (helpRequestDB) {
        const subAdmin = await getSubAdmin(helpRequestDB.get().zone.id);
        const agents = await getASCByZoneId(helpRequestDB.get().zone.id);
        const subscriber = await getAdminSubZone(helpRequestDB.get().subzone_id);

        const toEmmit = {
          ...helpRequestDB.toJSON(),
        };

        if (subAdmin) {
          if (toEmmit.status === 'accepted') {
            const notification: INotification = {
              receiverId: subAdmin,
              title: 'Solicitud de auxilio aceptada',
              body: `El ASC ${toEmmit.asc.full_name} ha aceptado la solicitud que le asigno`,
              type: 3,
              senderId: object.id,
            };

            await notificationToAdmin(notification);
          }

          io.to(subAdmin).emit('new-help-request', toEmmit);
        }

        if (subscriber) {
          if (toEmmit.status === 'accepted') {
            const notification: INotification = {
              receiverId: subscriber,
              title: 'Solicitud de auxilio aceptada',
              body: `El ASC ${toEmmit.asc.full_name} ha aceptado la solicitud que le asigno`,
              type: 3,
              senderId: object.id,
            };

            await notificationToAdmin(notification);
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
    });

    /////////////////////////////////////////////////////////////////
    ////////////////     NOTIFICACIONES ADMIN SOCKETS     //////////
    ///////////////////////////////////////////////////////////////
    // notificar al super admin un registro de usuario

    // notificar al subadmin correspondiente que sus zonas que selecciono han sido aceptadas
    socket.on('zones-accepted', async (data: { idSubAdmin: number; title: string; body: string }) => {
      try {
        const userAdmin = await User.findOne({
          where: { id: data.idSubAdmin, role_id: 2, is_active: 1, is_deleted: 0 },
          attributes: ['id'],
        });

        if (userAdmin) {
          const toEmit: INotification = {
            receiverId: userAdmin.get().id,
            title: data.title,
            body: data.body,
            type: 2,
            senderId: object.id,
          };

          notificationToAdmin(toEmit);
        }
      } catch (error) {
        console.log('-->', error);
      }
    });

    // notificar al subadmin correspondiente que sus zonas que selecciono han sido aceptadas
    socket.on('zones-selected', async () => {
      try {
        const userAdmin = await User.findOne({
          where: { role_id: 1, is_active: 1, is_deleted: 0 },
          attributes: ['id', 'full_name'],
        });

        if (userAdmin) {
          const toEmit: INotification = {
            receiverId: userAdmin.get().id,
            title: 'Solicitud de zonas',
            body: `El sub administrador ${object.full_name}, solicita la aprobación de nuevas zonas`,
            type: 4,
            senderId: object.id,
          };

          notificationToAdmin(toEmit);
        }
      } catch (error) {
        console.log('-->', error);
      }
    });

    /////////////////////////////////////////////////////////////////
    ////////////////     COMPLAINTS SOCKETS     ////////////////////
    ///////////////////////////////////////////////////////////////

    // notificar nueva solicitud de auxilio a sub admin y asc
    socket.on('new-complaint', async (payload) => {
      const complaintDB = await getComplaintById(payload.id);

      if (complaintDB) {
        const subAdmin = await getSubAdmin(complaintDB.get().zone.id);
        const agents = await getASCByZoneId(complaintDB.get().zone.id);
        const adminSubscriber = complaintDB.get().subzone_id ? await getAdminSubZone(complaintDB.get().subzone_id) : null;
        const agentsBySubZone = complaintDB.get().subzone_id ? await getASCBySubZoneId(complaintDB.get().subzone_id) : null;

        const toEmmit = {
          ...complaintDB.toJSON(),
        };

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
              sendNotificationExpoUser({
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
                  sendNotificationExpoUser({
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
    });

    // notificar al asc la actualización del estado de la denuncia
    socket.on('complaint-update', async (payload) => {
      const complaintDB = await getComplaintById(payload.id);

      if (complaintDB) {
        const subAdmin = await getSubAdmin(complaintDB.get().zone.id);
        const adminSubscriber = complaintDB.get().subzone_id ? await getAdminSubZone(complaintDB.get().subzone_id) : null;

        const toEmmit = {
          ...complaintDB.toJSON(),
        };

        if (subAdmin) {
          if (toEmmit.status === 'accepted') {
            const notification: INotification = {
              receiverId: subAdmin,
              title: 'Asignación aceptada',
              body: `El ASC ${toEmmit.asc.full_name} ha aceptado la asignación de denuncia`,
              type: 5,
              senderId: object.id,
            };

            await notificationToAdmin(notification);
          }

          io.to(subAdmin).emit('new-complaint', toEmmit);
        }

        if (adminSubscriber) {
          if (toEmmit.status === 'accepted') {
            const notification: INotification = {
              receiverId: adminSubscriber,
              title: 'Asignación aceptada',
              body: `El ASC ${toEmmit.asc.full_name} ha aceptado la asignación de denuncia`,
              type: 5,
              senderId: object.id,
            };

            await notificationToAdmin(notification);
          }

          io.to(adminSubscriber).emit('new-complaint', toEmmit);
        }

        if (user) {
          if (user.get().role_id === UserRoles.SubAdmin) {
            const date = new Date().setMinutes(new Date().getMinutes() + 2);

            schedulerProgram(date, async () => {
              const complaintDB = await getComplaintById(payload.id);

              if (complaintDB) {
                if (complaintDB.get().status === 'pending') {
                  await updateComplaintAscById(toEmmit.id);
                  const complaintDBSchedule = await getComplaintById(payload.id);

                  const notification: INotification = {
                    receiverId: object.id,
                    title: 'Asignación no aceptada',
                    body: `El ASC ${toEmmit.asc.full_name} no ha aceptado la asignación de denuncia`,
                    type: 5,
                    senderId: object.id,
                  };

                  const toEmmitSchedule = {
                    ...complaintDBSchedule?.toJSON(),
                  };

                  await notificationToAdmin(notification);
                  io.to(subAdmin).emit('new-complaint', toEmmitSchedule);
                  if (toEmmit.asc) {
                    const user = await getUserStatusAssignedById(toEmmit.asc.id);
                    io.to(subAdmin).emit('tracking-asc', user);
                  }
                }
              }
            });
          }
          if (user.get().role_id === UserRoles.Subscriber) {
            const date = new Date().setMinutes(new Date().getMinutes() + 2);

            schedulerProgram(date, async () => {
              const complaintDB = await getComplaintById(payload.id);

              if (complaintDB) {
                if (complaintDB.get().status === 'pending') {
                  await updateComplaintAscById(toEmmit.id);
                  const complaintDBSchedule = await getComplaintById(payload.id);

                  const notification: INotification = {
                    receiverId: object.id,
                    title: 'Asignación no aceptada',
                    body: `El ASC ${toEmmit.asc.full_name} no ha aceptado la asignación de denuncia`,
                    type: 5,
                    senderId: object.id,
                  };

                  const toEmmitSchedule = {
                    ...complaintDBSchedule?.toJSON(),
                  };

                  await notificationToAdmin(notification);
                  io.to(subAdmin).emit('new-complaint', toEmmitSchedule);
                  if (toEmmit.asc) {
                    const user = await getUserStatusAssignedById(toEmmit.asc.id);
                    io.to(subAdmin).emit('tracking-asc', user);
                  }
                }
              }
            });
          }
        }

        if (complaintDB.get().asc) {
          io.to(complaintDB.get().asc.id).emit('complaint-update', toEmmit);
          if (toEmmit.asc) {
            const user = await getUserStatusAssignedById(toEmmit.asc.id);
            io.to(subAdmin).emit('tracking-asc', user);
          }
        }

        if (complaintDB.get().user) {
          io.to(complaintDB.get().user.id).emit('complaint-update', toEmmit);
        }
      }
    });

    socket.on('disconnect', async () => {
      const date = `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()} ${new Date().getHours()}:${new Date().getMinutes()}`;
      const user = await updateOfflineUser(object.id);
      console.log('cliente desconectado', user?.toJSON(), date);
    });
  } else {
    if (!socket.handshake.query['SecretKey']?.toString()) {
      console.log('socket no identificado');
      return socket.disconnect();
    }

    // notificar al super admin un registro de usuario
    socket.on('new-user', async (data: any) => {
      try {
        const userAdmin = await getUserSuperAdmin();
        const newUser = await getUserByIdAndIsActive(data.id, false);

        if (!newUser) return;
        const role_id = newUser.get().role_id;
        const roleName = () => {
          if (role_id === 2) return 'Sub administrador';
          if (role_id === 3) return 'Agente';
          return 'Ciudadano';
        };

        if (userAdmin) {
          const toEmit: INotification = {
            receiverId: userAdmin?.get().id,
            title: `Nuevo usuario ${roleName()}`,
            body: `${newUser?.get().full_name} con cédula ${newUser?.get().identification} se ha registrado`,
            type: 1,
            senderId: newUser.get().id,
          };

          const resp = await saveNotificationToAdminSocket(toEmit);

          if (resp.data) {
            console.log('new-user', userAdmin?.get().id);
            io.emit(`listen-notification-${userAdmin?.get().id}`, resp.data);
          }
        }
      } catch (error) {
        console.log('-->', error);
      }
    });
  }
  const notificationToAdmin = async (data: INotification) => {
    const resp = await saveNotificationToAdminSocket(data);
    if (resp.data) {
      io.to(data.receiverId).emit('listen-notification', resp.data);
    }
  };
};

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
