import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { customResponse, badResponse } from '../helpers/customResponses';
import HelpRequest from '../models/helpRequest.model';
import PoliticaDivision from '../models/PoliticaDivision.model';
import User from '../models/user.model';
import { getUserByIdForExpoNotification } from './user.controller';
import { sendNotificationExpoUser } from './notification.controller';
import { getZonesByAdmin } from './zone.controller';
import { validTypeStatusEnd } from '../helpers/validatorsDb';
import { UserRoles } from '../enums/user.enum';
import { generateSignedUrlGCS } from '../helpers/gc-storage';
import { getFolderUserPhotoProfile } from '../helpers/utils';
import Subzone from '../models/subzone.model';

export const getHelpRequest = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    if (data.role_id === UserRoles.User) return customResponse(false, res, 401, `Acceso denegado`, null);

    let zonesAdmin: number[] = [];

    if (data.role_id === UserRoles.SubAdmin) {
      zonesAdmin = await getZonesByAdmin(data.id);
    }

    if (data.role_id === UserRoles.Superadmin) {
      const helpRequest = await HelpRequest.findAndCountAll({
        where: {
          zone_id: data.zone_id,
          status: 'pending',
          agent_id: null,
        },
        attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at'],
        include: [
          {
            model: User,
            as: 'asc',
            attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
          },
          {
            model: PoliticaDivision,
            as: 'zone',
            attributes: ['id', 'name'],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      if (helpRequest.count === 0) return customResponse(false, res, 404, `No se encontraron solicitudes`, null);

      for (const help of helpRequest.rows) {
        if (help.get().user) help.get().user.photo_profile = await generateSignedUrlGCS(help.get().user.photo_profile, getFolderUserPhotoProfile(help.get().user.photo_profile));
        if (help.get().asc) help.get().asc.photo_profile = await generateSignedUrlGCS(help.get().asc.photo_profile, getFolderUserPhotoProfile(help.get().asc.photo_profile));
      }

      return customResponse(true, res, 200, `Solicitudes encontradas`, helpRequest);
    }

    if (data.role_id === UserRoles.SubAdmin) {
      const helpRequest = await HelpRequest.findAndCountAll({
        where: {
          zone_id: { [Op.in]: zonesAdmin },
        },
        attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at'],
        include: [
          {
            model: User,
            as: 'asc',
            attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
          },
          {
            model: PoliticaDivision,
            as: 'zone',
            attributes: ['id', 'name'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit: 20,
      });

      if (helpRequest.count === 0) return customResponse(false, res, 404, `No se encontraron solicitudes`, null);

      for (const help of helpRequest.rows) {
        if (help.get().user) help.get().user.photo_profile = await generateSignedUrlGCS(help.get().user.photo_profile, getFolderUserPhotoProfile(help.get().user.photo_profile));
        if (help.get().asc) help.get().asc.photo_profile = await generateSignedUrlGCS(help.get().asc.photo_profile, getFolderUserPhotoProfile(help.get().asc.photo_profile));
      }

      return customResponse(true, res, 200, `Solicitudes encontradas`, helpRequest);
    }

    if (data.role_id === UserRoles.Subscriber) {
      const subzones: number[] = [];
      const subzonesDB = await Subzone.findAll({
        where: {
          subs_id: data.subscription.id,
        },
      });

      if (subzonesDB.length === 0) {
        return customResponse(false, res, 404, 'No tiene subzonas', null);
      }

      subzonesDB.forEach((subzone) => {
        subzones.push(subzone.get().id);
      });

      const helpRequest = await HelpRequest.findAndCountAll({
        where: {
          subzone_id: { [Op.in]: subzones },
        },
        attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at'],
        include: [
          {
            model: User,
            as: 'asc',
            attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
          },
          {
            model: PoliticaDivision,
            as: 'zone',
            attributes: ['id', 'name'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit: 20,
      });

      if (helpRequest.count === 0) return customResponse(false, res, 404, `No se encontraron solicitudes`, null);

      for (const help of helpRequest.rows) {
        if (help.get().user) help.get().user.photo_profile = await generateSignedUrlGCS(help.get().user.photo_profile, getFolderUserPhotoProfile(help.get().user.photo_profile));
        if (help.get().asc) help.get().asc.photo_profile = await generateSignedUrlGCS(help.get().asc.photo_profile, getFolderUserPhotoProfile(help.get().asc.photo_profile));
      }

      return customResponse(true, res, 200, `Solicitudes encontradas`, helpRequest);
    }

    if (data.role_id === UserRoles.ASC) {
      if (data.subzone_id) {
        const helpRequest = await HelpRequest.findAndCountAll({
          where: {
            subzone_id: data.subzone_id,
            status: 'pending',
            agent_id: null,
          },
          attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at'],
          include: [
            {
              model: User,
              as: 'asc',
              attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
            },
            {
              model: User,
              as: 'user',
              attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
            },
            {
              model: PoliticaDivision,
              as: 'zone',
              attributes: ['id', 'name'],
            },
          ],
          order: [['created_at', 'DESC']],
        });

        if (helpRequest.count === 0) return customResponse(false, res, 404, `No se encontraron solicitudes`, null);

        for (const help of helpRequest.rows) {
          if (help.get().user) help.get().user.photo_profile = await generateSignedUrlGCS(help.get().user.photo_profile, getFolderUserPhotoProfile(help.get().user.photo_profile));
          if (help.get().asc) help.get().asc.photo_profile = await generateSignedUrlGCS(help.get().asc.photo_profile, getFolderUserPhotoProfile(help.get().asc.photo_profile));
        }

        return customResponse(true, res, 200, `Solicitudes encontradas`, helpRequest);
      } else {
        const helpRequest = await HelpRequest.findAndCountAll({
          where: {
            zone_id: data.zone_id,
            status: 'pending',
            agent_id: null,
          },
          attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at'],
          include: [
            {
              model: User,
              as: 'asc',
              attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
            },
            {
              model: User,
              as: 'user',
              attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
            },
            {
              model: PoliticaDivision,
              as: 'zone',
              attributes: ['id', 'name'],
            },
          ],
          order: [['created_at', 'DESC']],
        });

        if (helpRequest.count === 0) return customResponse(false, res, 404, `No se encontraron solicitudes`, null);

        for (const help of helpRequest.rows) {
          if (help.get().user) help.get().user.photo_profile = await generateSignedUrlGCS(help.get().user.photo_profile, getFolderUserPhotoProfile(help.get().user.photo_profile));
          if (help.get().asc) help.get().asc.photo_profile = await generateSignedUrlGCS(help.get().asc.photo_profile, getFolderUserPhotoProfile(help.get().asc.photo_profile));
        }

        return customResponse(true, res, 200, `Solicitudes encontradas`, helpRequest);
      }
    }

    const helpRequest = await HelpRequest.findAndCountAll({
      where: {
        zone_id: data.zone_id,
        status: 'pending',
        agent_id: null,
      },
      attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at'],
      include: [
        {
          model: User,
          as: 'asc',
          attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
        },
        {
          model: PoliticaDivision,
          as: 'zone',
          attributes: ['id', 'name'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    if (helpRequest.count === 0) return customResponse(false, res, 404, `No se encontraron solicitudes`, null);

    for (const help of helpRequest.rows) {
      if (help.get().user) help.get().user.photo_profile = await generateSignedUrlGCS(help.get().user.photo_profile, getFolderUserPhotoProfile(help.get().user.photo_profile));
      if (help.get().asc) help.get().asc.photo_profile = await generateSignedUrlGCS(help.get().asc.photo_profile, getFolderUserPhotoProfile(help.get().asc.photo_profile));
    }

    return customResponse(true, res, 200, `Solicitudes encontradas`, helpRequest);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getListHelpRequest = async (req: Request, res: Response) => {
  try {
    const { data, offset, limit, searchName, idZone, status } = req.body;

    if (data.role_id !== UserRoles.SubAdmin && data.role_id !== UserRoles.Subscriber) return customResponse(false, res, 401, `Acceso denegado`, null);

    if (data.role_id === UserRoles.SubAdmin) {
      const zonesAdmin = await getZonesByAdmin(data.id);

      const helpRequest = await HelpRequest.findAndCountAll({
        where: {
          zone_id: idZone ? parseInt(idZone) : { [Op.in]: zonesAdmin },
          status: status ? status : { [Op.in]: ['pending', 'completed', 'cancel', 'accepted'] },
        },
        attributes: ['id', 'address', 'status', 'created_at'],
        include: [
          {
            model: User,
            as: 'asc',
            attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
            where: { full_name: searchName ? { [Op.substring]: searchName } : { [Op.not]: null } },
          },
          {
            model: PoliticaDivision,
            as: 'zone',
            attributes: ['id', 'name'],
          },
        ],
        order: [['created_at', 'ASC']],
        offset: parseInt(offset),
        limit: parseInt(limit),
      });

      for (let help of helpRequest.rows) {
        if (help.get().user) help.get().user.photo_profile = await generateSignedUrlGCS(help.get().user.photo_profile, getFolderUserPhotoProfile(help.get().user.photo_profile));
        if (help.get().asc) help.get().asc.photo_profile = await generateSignedUrlGCS(help.get().asc.photo_profile, getFolderUserPhotoProfile(help.get().asc.photo_profile));
      }

      helpRequest.rows.map((help, idx) => {
        help.get().rowNumber = offset + idx + 1;
      });

      return customResponse(true, res, 200, helpRequest.count > 0 ? `Solicitudes encontradas` : 'No se encontraron registros', helpRequest);
    }

    if (data.role_id === UserRoles.Subscriber) {
      const subzones: number[] = [];
      const subzonesDB = await Subzone.findAll({
        where: {
          subs_id: data.subscription.id,
        },
      });

      if (subzonesDB.length === 0) {
        return customResponse(false, res, 404, 'No tiene subzonas', null);
      }

      subzonesDB.forEach((subzone) => {
        subzones.push(subzone.get().id);
      });

      const helpRequest = await HelpRequest.findAndCountAll({
        where: {
          subzone_id: { [Op.in]: subzones },
          status: status ? status : { [Op.in]: ['pending', 'completed', 'cancel', 'accepted'] },
        },
        attributes: ['id', 'address', 'status', 'created_at'],
        include: [
          {
            model: User,
            as: 'asc',
            attributes: ['id', 'full_name'],
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'full_name'],
            where: { full_name: searchName ? { [Op.substring]: searchName } : { [Op.not]: null } },
          },
          {
            model: PoliticaDivision,
            as: 'zone',
            attributes: ['id', 'name'],
          },
        ],
        order: [['created_at', 'ASC']],
        offset: parseInt(offset),
        limit: parseInt(limit),
      });

      helpRequest.rows.map((help, idx) => {
        help.get().rowNumber = offset + idx + 1;
      });

      return customResponse(true, res, 200, helpRequest.count > 0 ? `Solicitudes encontradas` : 'No se encontraron registros', helpRequest);
    }
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getHelpRequestByIdEnpoint = async (req: Request, res: Response) => {
  try {
    // const { data } = req.body;
    const { id } = req.params;

    const helpRequest = await getHelpRequestById(parseInt(id));

    if (!helpRequest) return customResponse(false, res, 404, `No se encontraron solicitudes`, null);

    customResponse(true, res, 200, `Solicitudes encontradas`, helpRequest);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getMyHelpRequestAssigned = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    if (data.role_id !== UserRoles.ASC) return customResponse(false, res, 401, `Acceso denegado`, null);

    const helpRequest = await HelpRequest.findAll({
      where: {
        status: 'pending',
        agent_id: data.id,
      },
      attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at'],
      include: [
        {
          model: User,
          as: 'asc',
          attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
        },
        {
          model: PoliticaDivision,
          as: 'zone',
          attributes: ['id', 'name'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: 1,
    });

    if (helpRequest.length === 0) return customResponse(false, res, 404, `No se encontraron solicitudes`, null);

    if (helpRequest[0].get().user) helpRequest[0].get().user.photo_profile = await generateSignedUrlGCS(helpRequest[0].get().user.photo_profile, getFolderUserPhotoProfile(helpRequest[0].get().user.photo_profile));
    if (helpRequest[0].get().asc) helpRequest[0].get().asc.photo_profile = await generateSignedUrlGCS(helpRequest[0].get().asc.photo_profile, getFolderUserPhotoProfile(helpRequest[0].get().asc.photo_profile));

    customResponse(true, res, 200, `Solicitudes encontradas`, helpRequest[0]);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const postHelpRequest = async (req: Request, res: Response) => {
  try {
    const { data, address, lat, lng, zone_id, subzone_id } = req.body;

    if (data.role_id !== UserRoles.User) return customResponse(false, res, 404, `Acceso denegado`, null);

    const helpRequestALlDB = await HelpRequest.findAll({
      where: { user_id: data.id, status: { [Op.in]: ['pending', 'accepted'] } },
      attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at', 'subzone_id'],
      include: [
        {
          model: User,
          as: 'asc',
          attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
        },
        {
          model: PoliticaDivision,
          as: 'zone',
          attributes: ['id', 'name'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    if (helpRequestALlDB.length > 0) {
      for (const help of helpRequestALlDB) {
        if (help.get().user) help.get().user.photo_profile = await generateSignedUrlGCS(help.get().user.photo_profile, getFolderUserPhotoProfile(help.get().user.photo_profile));
        if (help.get().asc) help.get().asc.photo_profile = await generateSignedUrlGCS(help.get().asc.photo_profile, getFolderUserPhotoProfile(help.get().asc.photo_profile));
      }
      return customResponse(false, res, 404, `Ya tiene un solicitud aceptada, no puede crear más`, helpRequestALlDB);
    }

    const newRequest = await HelpRequest.create({ address, lat, lng, user_id: data.id, zone_id, subzone_id });

    customResponse(true, res, 200, `solicitud creada`, newRequest);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const updateHelpRequest = async (req: Request, res: Response) => {
  try {
    const { data, id, status, agent_id } = req.body;

    const { ok, msg } = validTypeStatusEnd(status);

    if (!ok) {
      return customResponse(ok, res, 404, msg, null);
    }

    if (status === 'accepted') {
      if (data.role_id === UserRoles.ASC) {
        const helpRequestALlDB = await HelpRequest.findAll({
          where: { agent_id: data.id, status: 'accepted' },
          attributes: ['id'],
        });

        if (helpRequestALlDB.length > 0) {
          return customResponse(false, res, 404, `Ya tiene un solicitud aceptada, no puede aceptar más`, null);
        }
      }
      if (data.role_id === UserRoles.User) {
        return customResponse(false, res, 404, `Solo un asc puede aceptar la solicitud`, null);
      }
    }

    const helpRequest = await HelpRequest.findOne({
      where: {
        id,
      },
      attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at', 'agent_id', 'user_id', 'zone_id'],
    });

    if (!helpRequest) return customResponse(false, res, 404, `No se encontro la solicitud`, null);

    const helReq = helpRequest.toJSON();

    if (helReq.status === 'cancel') {
      return customResponse(false, res, 404, `No puede cambiar el estado la solictud, ya fue cancelada`, null);
    }
    if (helReq.status === 'completed') {
      return customResponse(false, res, 404, `No puede cambiar el estado, la solicitud ya ha sido completada`, null);
    }

    if (helReq.agent_id) {
      if (status === 'pending') {
        return customResponse(false, res, 404, `No puede cambiar el estado, la solicitud ya ha sido aceptada`, null);
      }
    }

    if (helReq.status !== 'pending') {
      // console.log(data.id);
      if (data.id !== helReq.agent_id && data.id !== helReq.user_id) {
        return customResponse(false, res, 404, `No puede cambiar el estado, no fue creador o asignado de la solicitud o`, null);
      }
    }

    if (data.role_id === UserRoles.ASC) {
      const reqUpdated = await helpRequest.update({ status, agent_id: data.id });

      const user = await getUserByIdForExpoNotification(helpRequest.get().user_id);
      if (user) {
        if (status === 'completed') {
          sendNotificationExpoUser({
            expoToken: user.get().expo_token,
            title: 'Solicitud de auxilio',
            message: 'Solicitud de auxilio completada',
            data: { id: reqUpdated.get().id, status: reqUpdated.get().status },
          });
        }

        if (status === 'accepted') {
          sendNotificationExpoUser({
            expoToken: user.get().expo_token,
            title: 'Solicitud de auxilio',
            message: 'Solicitud de auxilio aceptada',
            data: { id: reqUpdated.get().id, status: reqUpdated.get().status },
          });
        }

        if (status === 'cancel') {
          await helpRequest.update({ cancel_user_id: data.id });
          sendNotificationExpoUser({
            expoToken: user.get().expo_token,
            title: 'Solicitud de auxilio',
            message: 'Solicitud de auxilio cancelada',
            data: { id: reqUpdated.get().id, status: reqUpdated.get().status },
          });
        }
      }
    } else if (data.role_id === UserRoles.SubAdmin || data.role_id === UserRoles.Subscriber) {
      const helpAux = await HelpRequest.findAll({
        where: { agent_id, status: { [Op.in]: ['pending', 'accepted'] } },
        attributes: ['id'],
      });

      if (helpAux.length > 0) {
        return customResponse(false, res, 404, `El agente ya tiene una denuncia asignada, el agente solo puede atender una denuncia`, null);
      }
      const reqUpdated = await helpRequest.update({ agent_id });
      const user = await getUserByIdForExpoNotification(agent_id);

      if (user)
        sendNotificationExpoUser({
          expoToken: user.get().expo_token,
          title: 'Solicitud de auxilio',
          message: 'Asignación de solicitud de auxilio',
          data: { id: reqUpdated.get().id, status: reqUpdated.get().status },
        });
    } else {
      const reqUpdated = await helpRequest.update({ status });

      if (status === 'cancel') {
        await helpRequest.update({ cancel_user_id: data.id });
        const user = await getUserByIdForExpoNotification(helpRequest.get().agent_id);

        if (user)
          sendNotificationExpoUser({
            expoToken: user.get().expo_token,
            title: 'Solicitud de auxilio',
            message: 'Solicitud de auxilio cancelada',
            data: { id: reqUpdated.get().id, status: reqUpdated.get().status },
          });
      }
    }

    customResponse(true, res, 200, `solicitud actualizada`, helpRequest);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getHelpRequestById = async (id: number) => {
  const help = await HelpRequest.findOne({
    where: { id },
    attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at', 'subzone_id'],
    include: [
      {
        model: User,
        as: 'asc',
        attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
      },
      {
        model: PoliticaDivision,
        as: 'zone',
        attributes: ['id', 'name'],
      },
    ],
  });

  if (help) {
    if (help.get().user) help.get().user.photo_profile = await generateSignedUrlGCS(help.get().user.photo_profile, getFolderUserPhotoProfile(help.get().user.photo_profile));
    if (help.get().asc) help.get().asc.photo_profile = await generateSignedUrlGCS(help.get().asc.photo_profile, getFolderUserPhotoProfile(help.get().asc.photo_profile));
  }

  return help;
};

export const updateAscHelpRequestById = async (id: number) => {
  try {
    const helpRequest = await HelpRequest.findOne({
      where: { id, is_deleted: 0 },
    });

    await helpRequest?.update({ agent_id: null });
  } catch (error) {
    console.error('error->', error);
  }
};

export const getHistoryHelpRequest = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    const { limit, offset } = req.params;

    if (data.role_id !== UserRoles.ASC && data.role_id !== UserRoles.User) return customResponse(false, res, 401, `Acceso denegado`, null);

    const helpHistory =
      data.role_id === UserRoles.ASC
        ? await HelpRequest.findAndCountAll({
            where: {
              agent_id: data.id,
              status: { [Op.in]: ['completed'] },
            },
            attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at'],
            include: [
              {
                model: PoliticaDivision,
                attributes: ['id', 'name'],
                as: 'zone',
              },
              {
                model: User,
                attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
                as: 'user',
              },
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
          })
        : await HelpRequest.findAndCountAll({
            where: {
              user_id: data.id,
              status: { [Op.in]: ['completed'] },
            },
            attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at'],
            include: [
              {
                model: PoliticaDivision,
                attributes: ['id', 'name'],
                as: 'zone',
              },
              {
                model: User,
                attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
                as: 'asc',
              },
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
          });

    for (let help of helpHistory.rows) {
      if (help.get().user) help.get().user.photo_profile = await generateSignedUrlGCS(help.get().user.photo_profile, getFolderUserPhotoProfile(help.get().user.photo_profile));
      if (help.get().asc) help.get().asc.photo_profile = await generateSignedUrlGCS(help.get().asc.photo_profile, getFolderUserPhotoProfile(help.get().asc.photo_profile));
    }

    customResponse(true, res, 200, helpHistory.count > 0 ? 'Denuncias encontradas' : 'No existen denuncias', helpHistory);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};
