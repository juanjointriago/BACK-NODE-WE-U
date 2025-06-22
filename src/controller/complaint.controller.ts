import { Request, Response } from 'express';
import { Model, Op } from 'sequelize';
import { customResponse, badResponse } from '../helpers/customResponses';
import { validTypeStatusEnd } from '../helpers/validatorsDb';
import Complaint from '../models/complaint.model';
import PoliticaDivision from '../models/PoliticaDivision.model';
import User from '../models/user.model';
import { sendNotificationExpoUser } from './notification.controller';
import { getUserByIdForExpoNotification } from './user.controller';
import { getZonesByAdmin } from './zone.controller';
import { generateFileName, getFolderUserPhotoProfile } from '../helpers/utils';
import MediaComplaint from '../models/mediaComplaints.model';
import { UserRoles } from '../enums/user.enum';
import { generateSignedUrlGCS, uploadFileGCS } from '../helpers/gc-storage';
import { getExtension } from '../helpers/upload-file';
import Subzone from '../models/subzone.model';

export const getComplaints = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    const { limit, offset } = req.params;

    if (data.role_id === UserRoles.Superadmin) return customResponse(false, res, 401, `Acceso denegado`, null);

    let zonesAdmin: number[] = [];

    if (data.role_id === UserRoles.SubAdmin) {
      zonesAdmin = await getZonesByAdmin(data.id);
    }

    if (data.role_id === UserRoles.SubAdmin) {
      const complaints = await Complaint.findAndCountAll({
        where: {
          //   status: { [Op.in]: ['pending', 'accepted'] },
          zone_id: { [Op.in]: zonesAdmin },
        },
        attributes: ['id', 'address', 'created_at', 'description', 'lat', 'lng', 'status', 'title', 'updated_at'],
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
          {
            model: User,
            attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
            as: 'user',
          },
          {
            model: MediaComplaint,
            attributes: ['url'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      for (let complaint of complaints.rows) {
        if (complaint.get().user) complaint.get().user.photo_profile = await generateSignedUrlGCS(complaint.get().user.photo_profile, getFolderUserPhotoProfile(complaint.get().user.photo_profile));
        if (complaint.get().asc) complaint.get().asc.photo_profile = await generateSignedUrlGCS(complaint.get().asc.photo_profile, getFolderUserPhotoProfile(complaint.get().asc.photo_profile));

        for (const media of complaint.get().media_complaints) {
          media.url = await generateSignedUrlGCS(media.url, 'complaints');
        }
      }

      complaints.rows = complaints.rows.filter((complaint: Model<any, any>) => (complaint.get().status === 'completed' ? complaint.get().updated_at.setHours(complaint.get().updated_at.getHours() + 2) >= new Date() : complaint));

      return customResponse(true, res, 200, complaints.count > 0 ? 'Denuncias encontradas' : 'No existen denuncias', complaints);
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

      const complaints = await Complaint.findAndCountAll({
        where: {
          status: { [Op.in]: ['pending', 'accepted', 'completed'] },
          subzone_id: { [Op.in]: subzones },
        },
        attributes: ['id', 'address', 'created_at', 'description', 'lat', 'lng', 'status', 'title', 'updated_at'],
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
          {
            model: User,
            attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
            as: 'user',
          },
          {
            model: MediaComplaint,
            attributes: ['url'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      for (let complaint of complaints.rows) {
        if (complaint.get().user) complaint.get().user.photo_profile = await generateSignedUrlGCS(complaint.get().user.photo_profile, getFolderUserPhotoProfile(complaint.get().user.photo_profile));
        if (complaint.get().asc) complaint.get().asc.photo_profile = await generateSignedUrlGCS(complaint.get().asc.photo_profile, getFolderUserPhotoProfile(complaint.get().asc.photo_profile));

        for (const media of complaint.get().media_complaints) {
          media.url = await generateSignedUrlGCS(media.url, 'complaints');
        }
      }

      complaints.rows = complaints.rows.filter((complaint: Model<any, any>) => (complaint.get().status === 'completed' ? complaint.get().updated_at.setHours(complaint.get().updated_at.getHours() + 2) >= new Date() : complaint));

      return customResponse(true, res, 200, complaints.count > 0 ? 'Denuncias encontradas' : 'No existen denuncias', complaints);
    }

    if (data.role_id === UserRoles.ASC) {
      if (data.subzone_id) {
        const complaints = await Complaint.findAndCountAll({
          where: {
            status: { [Op.in]: ['pending', 'accepted', 'completed'] },
            subzone_id: data.subzone_id,
          },
          attributes: ['id', 'address', 'created_at', 'description', 'lat', 'lng', 'status', 'title', 'updated_at'],
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
            {
              model: User,
              attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
              as: 'user',
            },
            {
              model: MediaComplaint,
              attributes: ['url'],
            },
          ],
          order: [['created_at', 'DESC']],
          limit: parseInt(limit),
          offset: parseInt(offset),
        });

        for (let complaint of complaints.rows) {
          if (complaint.get().user) complaint.get().user.photo_profile = await generateSignedUrlGCS(complaint.get().user.photo_profile, getFolderUserPhotoProfile(complaint.get().user.photo_profile));
          if (complaint.get().asc) complaint.get().asc.photo_profile = await generateSignedUrlGCS(complaint.get().asc.photo_profile, getFolderUserPhotoProfile(complaint.get().asc.photo_profile));

          for (const media of complaint.get().media_complaints) {
            media.url = await generateSignedUrlGCS(media.url, 'complaints');
          }
        }

        complaints.rows = complaints.rows.filter((complaint: Model<any, any>) => (complaint.get().status === 'completed' ? complaint.get().updated_at.setHours(complaint.get().updated_at.getHours() + 2) >= new Date() : complaint));

        return customResponse(true, res, 200, complaints.count > 0 ? 'Denuncias encontradas' : 'No existen denuncias', complaints);
      } else {
        const complaints = await Complaint.findAndCountAll({
          where: {
            status: { [Op.in]: ['pending', 'accepted', 'completed'] },
            zone_id: data.zone_id,
          },
          attributes: ['id', 'address', 'created_at', 'description', 'lat', 'lng', 'status', 'title', 'updated_at'],
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
            {
              model: User,
              attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
              as: 'user',
            },
            {
              model: MediaComplaint,
              attributes: ['url'],
            },
          ],
          order: [['created_at', 'DESC']],
          limit: parseInt(limit),
          offset: parseInt(offset),
        });

        for (let complaint of complaints.rows) {
          if (complaint.get().user) complaint.get().user.photo_profile = await generateSignedUrlGCS(complaint.get().user.photo_profile, getFolderUserPhotoProfile(complaint.get().user.photo_profile));
          if (complaint.get().asc) complaint.get().asc.photo_profile = await generateSignedUrlGCS(complaint.get().asc.photo_profile, getFolderUserPhotoProfile(complaint.get().asc.photo_profile));

          for (const media of complaint.get().media_complaints) {
            media.url = await generateSignedUrlGCS(media.url, 'complaints');
          }
        }

        complaints.rows = complaints.rows.filter((complaint: Model<any, any>) => (complaint.get().status === 'completed' ? complaint.get().updated_at.setHours(complaint.get().updated_at.getHours() + 2) >= new Date() : complaint));

        return customResponse(true, res, 200, complaints.count > 0 ? 'Denuncias encontradas' : 'No existen denuncias', complaints);
      }
    }

    const complaints = await Complaint.findAndCountAll({
      where: {
        status: { [Op.in]: ['pending', 'accepted', 'completed'] },
        zone_id: data.zone_id,
      },
      attributes: ['id', 'address', 'created_at', 'description', 'lat', 'lng', 'status', 'title', 'updated_at'],
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
        {
          model: User,
          attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile'],
          as: 'user',
        },
        {
          model: MediaComplaint,
          attributes: ['url'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    for (let complaint of complaints.rows) {
      if (complaint.get().user) complaint.get().user.photo_profile = await generateSignedUrlGCS(complaint.get().user.photo_profile, getFolderUserPhotoProfile(complaint.get().user.photo_profile));
      if (complaint.get().asc) complaint.get().asc.photo_profile = await generateSignedUrlGCS(complaint.get().asc.photo_profile, getFolderUserPhotoProfile(complaint.get().asc.photo_profile));

      for (const media of complaint.get().media_complaints) {
        media.url = await generateSignedUrlGCS(media.url, 'complaints');
      }
    }

    complaints.rows = complaints.rows.filter((complaint: Model<any, any>) => (complaint.get().status === 'completed' ? complaint.get().updated_at.setHours(complaint.get().updated_at.getHours() + 2) >= new Date() : complaint));

    return customResponse(true, res, 200, complaints.count > 0 ? 'Denuncias encontradas' : 'No existen denuncias', complaints);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getListComplaint = async (req: Request, res: Response) => {
  try {
    const { data, offset, limit, searchName, idZone, status } = req.body;

    if (data.role_id !== UserRoles.SubAdmin && data.role_id !== UserRoles.Superadmin && data.role_id !== UserRoles.Subscriber) return customResponse(false, res, 401, `Acceso denegado`, null);

    if (data.role_id === UserRoles.SubAdmin) {
      const zonesAdmin = await getZonesByAdmin(data.id);
      const complaints = await Complaint.findAndCountAll({
        where: {
          zone_id: idZone ? parseInt(idZone) : { [Op.ne]: zonesAdmin },
          status: status ? status : { [Op.in]: ['pending', 'completed', 'cancel', 'accepted'] },
        },
        attributes: ['id', 'address', 'created_at', 'description', 'status', 'title'],
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

      complaints.rows.map((item, idx) => {
        item.get().rowNumber = offset + idx + 1;
      });

      return customResponse(true, res, 200, complaints.count > 0 ? `Solicitudes encontradas` : 'No se encontraron registros', complaints);
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

      const complaints = await Complaint.findAndCountAll({
        where: {
          subzone_id: { [Op.in]: subzones },
          status: status ? status : { [Op.in]: ['pending', 'completed', 'cancel', 'accepted'] },
        },
        attributes: ['id', 'address', 'created_at', 'description', 'status', 'title'],
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

      complaints.rows.map((item, idx) => {
        item.get().rowNumber = offset + idx + 1;
      });

      customResponse(true, res, 200, complaints.count > 0 ? `Solicitudes encontradas` : 'No se encontraron registros', complaints);
    }
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getPhotosByComplaintId = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    const { complaint_id } = req.params;

    // if (data.role_id !== UserRoles.ASC) return customResponse(false, res, 401, `Acceso denegado`, null);

    const photos = await MediaComplaint.findAll({
      where: { complaint_id, is_deleted: 0 },
      attributes: ['id', 'url', 'created_at'],
    });

    for (let p of photos) {
      p.get().url = await generateSignedUrlGCS(p.get().url, 'complaints');
    }

    customResponse(true, res, 200, photos.length > 0 ? `Fotos encontradas` : 'No se encontraron registros', photos);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getPointsComplaints = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    if (data.role_id !== UserRoles.ASC) return customResponse(false, res, 401, `Acceso denegado`, null);

    const complaints = await Complaint.findAndCountAll({
      where: {
        status: { [Op.in]: ['pending'] },
        zone_id: data.zone_id,
      },
      attributes: ['id', 'lat', 'lng'],
      order: [['created_at', 'DESC']],
    });

    customResponse(true, res, 200, complaints.count > 0 ? 'Denuncias encontradas' : 'No existen denuncias', complaints);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getComplaintByIdEndpoint = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    const { idComplaint } = req.params;

    if (data.role_id === UserRoles.Superadmin) return customResponse(false, res, 401, `Acceso denegado`, null);

    const complaint = await getComplaintById(parseInt(idComplaint));

    customResponse(true, res, 200, complaint ? 'Denuncia encontrada' : 'la denuncia no existe', complaint);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const createComplaint = async (req: Request, res: Response) => {
  try {
    const { data, address, description, lat, lng, title, zone_id, subzone_id } = req.body;

    if (data.role_id !== UserRoles.User) return customResponse(false, res, 401, 'No pude realizar esta petición', null);

    if (!req.files || Object.keys(req.files).length === 0 || !req.files.photos) {
      return customResponse(false, res, 400, 'No hay fotos que subir', null);
    }

    const photos = req.files?.photos;

    if (photos instanceof Array) {
      if (photos.length > 10) return customResponse(false, res, 401, 'Solo puede subir máximo 10 fotos', null);
    }

    const newComplaint = await Complaint.create({ address, description, lat: parseFloat(lat), lng: parseFloat(lng), title, zone_id: parseInt(zone_id), user_id: data.id, subzone_id: subzone_id ? parseInt(subzone_id) : null });

    if (photos instanceof Array) {
      for (let p of photos) {
        const extension = getExtension(p);
        const nameFile = `complaint_${data.identification}_${generateFileName()}`;
        await uploadFileGCS(p, nameFile, 'complaints');
        await MediaComplaint.create({ complaint_id: newComplaint.get().id, url: `${nameFile}.${extension}` });
      }
    } else {
      const extension = getExtension(photos);
      const nameFile = `complaint_${data.identification}_${generateFileName()}`;
      await uploadFileGCS(photos, nameFile, 'complaints');
      await MediaComplaint.create({ complaint_id: newComplaint.get().id, url: `${nameFile}.${extension}` });
    }

    return customResponse(true, res, 200, 'Denuncia creada', newComplaint);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const updateComplaint = async (req: Request, res: Response) => {
  try {
    const { data, idComplaint, idAsc, status } = req.body;

    const { ok, msg } = validTypeStatusEnd(status);

    if (!ok) {
      return customResponse(ok, res, 404, msg, null);
    }

    if (status === 'accepted') {
      if (data.role_id === UserRoles.ASC) {
        const complaintsDB = await Complaint.findAll({
          where: { agent_id: data.id, status: 'accepted' },
          attributes: ['id'],
        });

        if (complaintsDB.length > 0) {
          return customResponse(false, res, 404, `Ya tiene un solicitud aceptada, no puede aceptar más`, null);
        }
      }
      if (data.role_id === 4) {
        return customResponse(false, res, 404, `Solo un asc puede aceptar la solicitud`, null);
      }
    }

    const complaint = await Complaint.findOne({
      where: {
        id: idComplaint,
      },
      attributes: ['id', 'address', 'lat', 'lng', 'status', 'created_at', 'agent_id', 'user_id', 'zone_id'],
    });

    if (!complaint) return customResponse(false, res, 404, `No se encontro la solicitud`, null);

    const complaintAux = complaint.toJSON();

    if (complaintAux.status === 'cancel') {
      return customResponse(false, res, 404, `No puede cambiar el estado la solictud, ya fue cancelada`, null);
    }
    if (complaintAux.status === 'completed') {
      return customResponse(false, res, 404, `No puede cambiar el estado, la solicitud ya ha sido completada`, null);
    }

    if (complaintAux.agent_id) {
      if (status === 'pending') {
        return customResponse(false, res, 404, `No puede cambiar el estado, la solicitud ya ha sido aceptada`, null);
      }
    }

    if (complaintAux.status !== 'pending') {
      // console.log(data.id);
      if (data.id !== complaintAux.agent_id && data.id !== complaintAux.user_id) {
        return customResponse(false, res, 404, `No puede cambiar el estado, no fue creador o asignado de la solicitud`, null);
      }
    }

    if (data.role_id === UserRoles.ASC) {
      const complaintUpdated = await complaint.update({ status, agent_id: data.id });

      const user = await getUserByIdForExpoNotification(complaint.get().user_id);
      if (user) {
        if (status === 'completed') {
          sendNotificationExpoUser({
            expoToken: user.get().expo_token,
            title: 'Denuncia de la comunidad',
            message: 'La denuncia ha sido compledata',
            data: { id: complaintUpdated.get().id, status: complaintUpdated.get().status },
          });
        }

        if (status === 'accepted') {
          sendNotificationExpoUser({
            expoToken: user.get().expo_token,
            title: 'Denuncia de la comunidad',
            message: 'La denuncia ha sido aceptada',
            data: { id: complaintUpdated.get().id, status: complaintUpdated.get().status },
          });
        }

        if (status === 'cancel') {
          await complaint.update({ cancel_user_id: data.id });
          sendNotificationExpoUser({
            expoToken: user.get().expo_token,
            title: 'Denuncia de la comunidad',
            message: 'La denuncia ha sido cancelada',
            data: { id: complaintUpdated.get().id, status: complaintUpdated.get().status },
          });
        }
      }
    } else if (data.role_id === UserRoles.SubAdmin || data.role_id === UserRoles.Subscriber) {
      const complaintsDB = await Complaint.findAll({
        where: { agent_id: idAsc, status: { [Op.in]: ['pending', 'accepted'] } },
        attributes: ['id'],
      });

      if (complaintsDB.length > 0) {
        return customResponse(false, res, 404, `El agente ya tiene una denuncia asignada o en curso, el agente solo puede atender una denuncia`, null);
      }
      const complaintUpdated = await complaint.update({ agent_id: idAsc });
      const user = await getUserByIdForExpoNotification(idAsc);
      if (user)
        sendNotificationExpoUser({
          expoToken: user.get().expo_token,
          title: 'Denuncia de la comunidad',
          message: 'Se te ha asignado una denuncia',
          data: { id: complaintUpdated.get().id, status: complaintUpdated.get().status },
        });
    } else {
      const reqUpdated = await complaint.update({ status });

      if (status === 'cancel') {
        const user = await getUserByIdForExpoNotification(complaint.get().agent_id);
        await complaint.update({ cancel_user_id: data.id });
        if (user)
          sendNotificationExpoUser({
            expoToken: user.get().expo_token,
            title: 'Denuncia de la comunidad',
            message: 'La denuncia ha sido cancelada',
            data: { id: reqUpdated.get().id, status: reqUpdated.get().status },
          });
      }
    }

    customResponse(true, res, 200, `solicitud actualizada`, complaint);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getComplaintById = async (id: number) => {
  const complaint = await Complaint.findOne({
    where: { id },
    attributes: ['id', 'address', 'created_at', 'description', 'lat', 'lng', 'status', 'title', 'subzone_id'],
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
      {
        model: MediaComplaint,
        attributes: ['url'],
      },
    ],
  });

  if (complaint) {
    if (complaint.get().user) complaint.get().user.photo_profile = await generateSignedUrlGCS(complaint.get().user.photo_profile, getFolderUserPhotoProfile(complaint.get().user.photo_profile));
    if (complaint.get().asc) complaint.get().asc.photo_profile = await generateSignedUrlGCS(complaint.get().asc.photo_profile, getFolderUserPhotoProfile(complaint.get().asc.photo_profile));

    for (const media of complaint.get().media_complaints) {
      media.url = await generateSignedUrlGCS(media.url, 'complaints');
    }
  }

  return complaint;
};

export const getAssignedComplaint = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    if (data.role_id !== UserRoles.ASC) return customResponse(false, res, 401, 'No pude realizar esta petición', null);

    const complaint = await Complaint.findAll({
      where: {
        agent_id: data.id,
        status: { [Op.in]: ['pending'] },
      },
      attributes: ['id', 'status', 'updated_at'],
    });

    if (complaint.length === 0) {
      return customResponse(false, res, 200, 'No tienes asignado una denuncia', complaint);
    }

    return customResponse(true, res, 200, 'Tienes una denuncia asignada', complaint);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const updateComplaintAscById = async (id: number) => {
  const complaint = await Complaint.findOne({
    where: { id, is_deleted: 0 },
  });

  complaint?.update({ agent_id: null });
};

export const getComplaintHistory = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    const { limit, offset } = req.params;

    if (data.role_id !== UserRoles.ASC && data.role_id !== UserRoles.User) return customResponse(false, res, 401, `Acceso denegado`, null);

    const complaints =
      data.role_id === UserRoles.ASC
        ? await Complaint.findAndCountAll({
            where: {
              agent_id: data.id,
              status: { [Op.in]: ['completed'] },
            },
            attributes: ['id', 'address', 'created_at', 'description', 'lat', 'lng', 'status', 'title', 'updated_at'],
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
              {
                model: MediaComplaint,
                attributes: ['url'],
              },
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
          })
        : await Complaint.findAndCountAll({
            where: {
              user_id: data.id,
              status: { [Op.in]: ['completed'] },
            },
            attributes: ['id', 'address', 'created_at', 'description', 'lat', 'lng', 'status', 'title', 'updated_at'],
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
              {
                model: MediaComplaint,
                attributes: ['url'],
              },
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
          });

    for (let complaint of complaints.rows) {
      if (complaint.get().user) complaint.get().user.photo_profile = await generateSignedUrlGCS(complaint.get().user.photo_profile, getFolderUserPhotoProfile(complaint.get().user.photo_profile));
      if (complaint.get().asc) complaint.get().asc.photo_profile = await generateSignedUrlGCS(complaint.get().asc.photo_profile, getFolderUserPhotoProfile(complaint.get().asc.photo_profile));

      for (const media of complaint.get().media_complaints) {
        media.url = await generateSignedUrlGCS(media.url, 'complaints');
      }
    }

    customResponse(true, res, 200, complaints.count > 0 ? 'Denuncias encontradas' : 'No existen denuncias', complaints);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};
