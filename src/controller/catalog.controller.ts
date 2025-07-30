import { Request, Response } from 'express';
import Role from '../models/rol.model';
import { customResponse, badResponse } from '../helpers/customResponses';
import TypeASC from '../models/typeASC.model';
import PoliticaDivision from '../models/PoliticaDivision.model';
import { Op } from 'sequelize';
import DetailZonesSubAdmin from '../models/detailZonesSubAdmin.model';
import { UserRoles } from '../enums/user.enum';

/**
 * Obtiene todos los roles de la base de datos y los devuelve en formato JSON
 * @returns Una matriz de objetos que tiene la siguiente estructura:
 * [
 *   {
 *     "identificación": 1,
 *     "role_name": "Administrador"
 *   },
 *   {
 *     "identificación": 2,
 *     "role_name": "Usuario"
 *   } }
 * ]
 */
export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.findAll({
      where: { is_deleted: 0 },
      attributes: ['id', 'rol_name'],
    });

    if (roles.length === 0) {
      return customResponse(false, res, 404, 'No existen roles', null);
    }

    customResponse(true, res, 200, `Roles encontrados`, roles);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

/**
 * Obtiene todos los tipos de ASC de la base de datos y los devuelve en formato JSON.
 * @returns [
 *   {
 *     "id": 1,
 *     "asc_name": "Ascensor"
 *   },
 *   {
 *     "id": 2,
 *     "asc_name": "Escalera"
 *   },
 *   {
 *     "id": 3,
 *     "asc_name": "Escalera mecánica"
 */
export const getTypesASC = async (req: Request, res: Response) => {
  try {
    const typesASC = await TypeASC.findAll({
      where: { is_deleted: 0 },
      attributes: ['id', 'asc_name'],
    });

    if (typesASC.length === 0) {
      return customResponse(false, res, 404, 'No existen tipos de ASC', null);
    }

    customResponse(true, res, 200, `Tipos de ASC encontrados`, typesASC);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getProvinceByCode = async (req: Request, res: Response) => {
  try {
    const { codeProvince } = req.params;

    const province = await PoliticaDivision.findOne({
      where: { code: codeProvince },
      attributes: ['id', 'name', 'code'],
      include: [{ model: PoliticaDivision, as: 'cities', attributes: ['id', 'name', 'code'] }],
    });

    if (!province) {
      return customResponse(false, res, 404, 'No existe la provincia', null);
    }

    customResponse(true, res, 200, `Provincia encontrada`, province);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getProvinceByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    const province = await PoliticaDivision.findOne({
      where: { name: name.toUpperCase() },
      attributes: ['id', 'name', 'code'],
      include: [{ model: PoliticaDivision, as: 'cities', attributes: ['id', 'name', 'code'] }],
    });

    if (!province) {
      return customResponse(false, res, 404, 'No existe la provincia', null);
    }

    customResponse(true, res, 200, `Provincia encontrada`, province);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getProvincesAndtheirCities = async (req: Request, res: Response) => {
  try {
    const province = await PoliticaDivision.findAll({
      where: { id_parent: null, id: { [Op.ne]: 25 } },
      attributes: ['id', 'name', 'code'],
      include: [{ model: PoliticaDivision, as: 'cities', attributes: ['id', 'name', 'code'] }],
    });

    if (!province) {
      return customResponse(false, res, 404, 'No existe la provincia', null);
    }

    customResponse(true, res, 200, `Provincia encontrada`, province);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const myZonesSelected = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    if (data.role_id !== UserRoles.Superadmin && data.role_id !== UserRoles.SubAdmin && data.role_id !== UserRoles.Subscriber) return customResponse(false, res, 404, 'No tiene autorización para esta petición', null);

    const cities =
      data.role_id === UserRoles.Superadmin
        ? await DetailZonesSubAdmin.findAll({
            where: { is_deleted: 0 },
            attributes: ['id'],
            include: [
              {
                model: PoliticaDivision,
                as: 'city',
                attributes: ['id', 'name', 'code'],
                include: [
                  {
                    model: PoliticaDivision,
                    as: 'province',
                    attributes: ['id', 'name', 'code'],
                  },
                ],
              },
            ],
          })
        : await DetailZonesSubAdmin.findAll({
            where: { user_id: data.id, is_deleted: 0 },
            attributes: ['id', 'is_active'],
            include: [
              {
                model: PoliticaDivision,
                as: 'city',
                attributes: ['id', 'name', 'code'],
                include: [
                  {
                    model: PoliticaDivision,
                    as: 'province',
                    attributes: ['id', 'name', 'code'],
                  },
                ],
              },
            ],
          });

    if (!cities || cities.length === 0) {
      return customResponse(false, res, 404, 'No tiene cantones seleccionados o aprobados para administrar', null);
    }

    return customResponse(true, res, 200, `Provincia encontrada`, cities);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const zonesSelected = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    if (data.role_id !== 2) return customResponse(false, res, 404, 'No tiene autorización para esta petición', null);

    const cities = await DetailZonesSubAdmin.findAll({
      where: { is_deleted: 0 },
      attributes: ['id'],
      include: [
        {
          model: PoliticaDivision,
          as: 'city',
          attributes: ['id', 'name', 'code'],
          include: [
            {
              as: 'province',
              model: PoliticaDivision,
              attributes: ['id', 'name', 'code'],
            },
          ],
        },
      ],
    });

    if (!cities || cities.length === 0) {
      return customResponse(false, res, 404, 'No tiene cantones seleccionados o aprobados para administrar', null);
    }

    return customResponse(true, res, 200, `Ciudades encontradas`, cities);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};
