import { Request, Response } from 'express';
import { customResponse } from '../helpers/customResponses';
import { UserRoles } from '../enums/user.enum';
import User from '../models/user.model';
import PoliticaDivision from '../models/PoliticaDivision.model';
import Role from '../models/rol.model';

export const numberUsersZoneByIdProvince = async (req: Request, res: Response) => {
  const { data, is_active, idProvince } = req.body;

  if (data.role_id !== UserRoles.Superadmin) return customResponse(false, res, 401, `Acceso denegado`, null);

  const zones = await PoliticaDivision.findAll({
    where: {
      id_parent: idProvince,
    },
    attributes: ['id', 'name', 'code'],
  });

  if (zones.length === 0) return customResponse(false, res, 404, `La provincia ${idProvince} no tiene cantones`, null);

  for (const zone of zones) {
    const users = await User.findAll({
      attributes: ['id', 'full_name', 'lat', 'lng', 'address'],
      where: {
        zone_id: zone.get().id,
        is_deleted: 0,
        role_id: UserRoles.ASC,
        is_active: is_active,
      },
    });

    zone.get().count = users.length;
    zone.get().users = users;
  }

  customResponse(true, res, 200, 'Reporte de numero de usuario por canton descriminando por provincia', zones);
};
