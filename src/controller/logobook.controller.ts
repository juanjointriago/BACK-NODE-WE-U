import { Request, Response } from 'express';
import { customResponse, badResponse } from '../helpers/customResponses';
import { getZonesByAdmin } from './zone.controller';
import { Model, Op } from 'sequelize';
import User from '../models/user.model';
import PoliticaDivision from '../models/PoliticaDivision.model';
import MediaCoordsLogbook from '../models/mediaCoordsLogbook.model';
import moment from 'moment';
import Logbook from '../models/logbook.model';
import CoordsLogbook from '../models/coordsLogbook.model';
import { generateFileName } from '../helpers/utils';
import { UserRoles } from '../enums/user.enum';
import { generateSignedUrlGCS, uploadFileGCS } from '../helpers/gc-storage';
import { getExtension } from '../helpers/upload-file';
import Subzone from '../models/subzone.model';

export const postLogbook = async (req: Request, res: Response) => {
  try {
    const { data, date_until, hour_until, zone_id, subzone_id } = req.body;

    if (data.role_id !== 4) return customResponse(false, res, 401, `Acceso denegado`, null);

    const log = await Logbook.findOne({
      where: {
        user_id: data.id,
        status: { [Op.in]: ['started', 'created'] },
      },
    });

    if (log) {
      return customResponse(false, res, 400, `Ya tiene una solicitud creada o en curso`, null);
    }

    const newLogBook = await Logbook.create({ date_until, hour_until, zone_id, user_id: data.id, subzone_id });

    customResponse(true, res, 200, 'Bitacora creada', newLogBook);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const postCoordsLogbook = async (req: Request, res: Response) => {
  try {
    const { data, lat, lng, logbook_id, address } = req.body;

    if (data.role_id !== 4) return customResponse(false, res, 401, `Acceso denegado`, null);

    const photos = req.files?.photos;

    const logbook = await Logbook.findOne({
      where: {
        id: logbook_id,
        status: { [Op.notIn]: ['cancel', 'completed'] },
      },
      attributes: ['id', 'date_until', 'hour_until'],
    });

    if (!logbook) {
      return customResponse(false, res, 404, `No existe la bitacora`, null);
    }

    const datelog = moment(new Date()).isSameOrAfter(`${logbook.get().date_until} ${logbook.get().hour_until}`);

    if (datelog) {
      logbook.update({ status: 'completed' });
      return customResponse(false, res, 400, `La fecha de registro de bitacora a caducado. Fecha hasta: ${logbook.get().date_until} ${logbook.get().hour_until}`, null);
    }

    const newCoordLogBook = await CoordsLogbook.create({ lat, lng, logbook_id, address });

    if (photos) {
      if (photos instanceof Array) {
        for (let p of photos) {
          const extension = getExtension(p);
          const nameFile = `coordLog_${data.identification}_${generateFileName()}`;
          await uploadFileGCS(p, nameFile, 'logbooks');
          await MediaCoordsLogbook.create({ coord_logbook_id: newCoordLogBook.get().id, url: `${nameFile}.${extension}` });
        }
      } else {
        const extension = getExtension(photos);
        const nameFile = `coordLog_${data.identification}_${generateFileName()}`;
        await uploadFileGCS(photos, nameFile, 'logbooks');
        await MediaCoordsLogbook.create({ coord_logbook_id: newCoordLogBook.get().id, url: `${nameFile}.${extension}` });
      }
    }

    customResponse(true, res, 200, 'Bitacora creada', newCoordLogBook);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getAllLogbooks = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    const { zone_id, offset, limit, searchName } = req.body;

    const zoneId = parseInt(zone_id);

    if (data.role_id !== UserRoles.SubAdmin && data.role_id !== UserRoles.Superadmin && data.role_id !== UserRoles.Subscriber) return customResponse(false, res, 401, `Acceso denegado`, null);

    let logbooks:
      | {
          rows: Model<any, any>[];
          count: number;
        }
      | undefined;

    if (data.role_id === UserRoles.Superadmin) {
      logbooks = await Logbook.findAndCountAll({
        where: { is_deleted: 0, zone_id: zoneId === 0 ? { [Op.ne]: null } : zoneId },
        attributes: ['id', 'date_until', 'hour_until', 'status'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'full_name', 'phone', 'email', 'identification'],
            where: { full_name: searchName ? { [Op.substring]: searchName } : { [Op.not]: null } },
          },
          {
            model: PoliticaDivision,
            as: 'zone',
            attributes: ['id', 'name'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    }
    if (data.role_id === UserRoles.SubAdmin) {
      const zonesAdmin: number[] = await getZonesByAdmin(data.id);
      logbooks = await Logbook.findAndCountAll({
        where: { is_deleted: 0, zone_id: zoneId === 0 ? { [Op.in]: zonesAdmin } : zoneId },
        attributes: ['id', 'date_until', 'hour_until', 'status', 'created_at'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'full_name', 'phone', 'email', 'identification'],
            where: { full_name: searchName ? { [Op.substring]: searchName } : { [Op.not]: null } },
          },
          {
            model: PoliticaDivision,
            as: 'zone',
            attributes: ['id', 'name'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
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

      logbooks = await Logbook.findAndCountAll({
        where: { is_deleted: 0, subzone_id: { [Op.in]: subzones } },
        attributes: ['id', 'date_until', 'hour_until', 'status', 'created_at'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'full_name', 'phone', 'email', 'identification'],
            where: { full_name: searchName ? { [Op.substring]: searchName } : { [Op.not]: null } },
          },
          {
            model: PoliticaDivision,
            as: 'zone',
            attributes: ['id', 'name'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    }

    if (!logbooks) return customResponse(false, res, 404, `No se encontraron registros`, null);

    logbooks.rows.map((log: Model<any, any>, idx: number) => {
      log.get().rowNumber = parseInt(offset) + idx + 1;
    });

    customResponse(true, res, 200, logbooks.count > 0 ? `Solicitudes encontradas` : 'No se encontraron registros', logbooks);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getLogbookById = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    const { idLogbook } = req.params;

    if (data.role_id !== UserRoles.SubAdmin && data.role_id !== UserRoles.Superadmin && data.role_id !== UserRoles.Subscriber) return customResponse(false, res, 401, `Acceso denegado`, null);

    const logbook = await Logbook.findOne({
      where: { id: idLogbook, is_deleted: 0 },
      attributes: ['id', 'date_until', 'hour_until', 'status', 'created_at'],
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'phone', 'email'],
        },
        {
          model: CoordsLogbook,
          attributes: ['id', 'lat', 'lng', 'created_at', 'address'],
          order: [['created_at', 'id']],
        },
      ],
    });
console.log(logbook);
    customResponse(true, res, 200, logbook ? `Solicitudes encontradas` : 'No se encontraron registros', logbook);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getMylastLogbook = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    if (data.role_id !== UserRoles.User) return customResponse(false, res, 401, `Acceso denegado`, null);

    const logbook = await Logbook.findAll({
      where: { is_deleted: 0, user_id: data.id, status: { [Op.notIn]: ['completed', 'cancel'] } },
      attributes: ['id', 'date_until', 'hour_until', 'status', 'created_at'],
      include: [
        {
          model: PoliticaDivision,
          attributes: ['id', 'name'],
          as: 'zone',
        },
        {
          model: CoordsLogbook,
          attributes: ['id', 'lat', 'lng', 'created_at', 'address'],
          include: [
            {
              model: MediaCoordsLogbook,
              attributes: ['url'],
              as: 'photos',
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: 1,
    });

    if (logbook.length === 0) return customResponse(false, res, 401, `No existen registros`, logbook);

    for (const coord of logbook[0].get().coords_logbooks) {
      for (const media of coord.photos) {
        media.url = await generateSignedUrlGCS(media.url, 'logbooks');
      }
    }

    customResponse(true, res, 200, `Solicitud encontrada`, logbook[0]);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getPhotosByPointId = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    const { idCoord } = req.params;

    if (data.role_id !== UserRoles.SubAdmin && data.role_id !== UserRoles.User && data.role_id !== UserRoles.Subscriber) return customResponse(false, res, 401, `Acceso denegado`, null);

    const logbook = await MediaCoordsLogbook.findAll({
      where: { coord_logbook_id: idCoord, is_deleted: 0 },
      attributes: ['id', 'url', 'created_at'],
    });

    for (let log of logbook) {
      log.get().url = await generateSignedUrlGCS(log.get().url, 'logbooks');
    }

    customResponse(true, res, 200, logbook.length > 0 ? `Fotos encontradas` : 'No se encontraron registros', logbook);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const updateLogbook = async (req: Request, res: Response) => {
  try {
    const { data, status } = req.body;
    const { id } = req.params;

    if (status !== 'cancel' && status !== 'completed') return customResponse(false, res, 401, `Solo puede completar o cancelar`, null);

    if (data.role_id !== UserRoles.User) return customResponse(false, res, 401, `Acceso denegado`, null);

    const log = await Logbook.findOne({
      where: {
        id: parseInt(id),
      },
    });

    if (!log) {
      return customResponse(false, res, 400, `No existe la bitocora`, null);
    }

    await log.update({ status });

    customResponse(true, res, 200, 'Bitacora actualizada', log);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getLogbookHistory = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    const { limit, offset } = req.params;

    if (data.role_id !== UserRoles.User) return customResponse(false, res, 401, `Acceso denegado`, null);

    const logbooks = await Logbook.findAndCountAll({
      where: {
        user_id: data.id,
        status: { [Op.in]: ['completed'] },
        is_deleted: 0,
      },
      attributes: ['id', 'date_until', 'hour_until', 'status', 'created_at'],
      include: [
        {
          model: PoliticaDivision,
          attributes: ['id', 'name'],
          as: 'zone',
        },
        {
          model: CoordsLogbook,
          attributes: ['id', 'lat', 'lng', 'created_at', 'address'],
          include: [
            {
              model: MediaCoordsLogbook,
              attributes: ['url'],
              as: 'photos',
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    for (let log of logbooks.rows) {
      for (const coord of log.get().coords_logbooks) {
        for (const p of coord.photos) {
          p.url = await generateSignedUrlGCS(p.url, 'logbooks');
        }
      }
    }

    customResponse(true, res, 200, logbooks.count > 0 ? 'Denuncias encontradas' : 'No existen denuncias', logbooks);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};
