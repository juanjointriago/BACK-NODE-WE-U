import { Request, Response } from 'express';
import { json, Op } from 'sequelize';
import { badResponse, customResponse } from '../helpers/customResponses';
import PoliticaDivision from '../models/PoliticaDivision.model';
import DetailZonesSubAdmin from '../models/detailZonesSubAdmin.model';
import { findCities } from '../helpers/findCity';
import Subzone from '../models/subzone.model';
import Polygon from '../models/polygon.model';
import { UserRoles } from '../enums/user.enum';
import Subscription from '../models/subscription.model';
import Multipolygon from '../models/multipolygon.model';
import User from '../models/user.model';
import { isCoordsInPolygon } from '../helpers/geoLibMethods';

export const addZonesToSubAdmin = async (req: Request, res: Response) => {
  try {
    const { data, zones } = req.body;

    if (data.role_id !== 2) return customResponse(false, res, 401, `Acceso denegado`, null);

    // const valid = await validDetailsSubadmin(zones);

    await Promise.all(
      zones.map(async (zone: string) => {
        const codes = await findCities(zone);

        codes.map(async (code) => {
          const detail = await DetailZonesSubAdmin.findOne({
            where: { zone_id: code.id },
            attributes: ['id'],
          });

          if (!detail) {
            await DetailZonesSubAdmin.create({ user_id: data.id, zone_id: code.id });
          }
        });
      })
    );

    return customResponse(true, res, 200, 'Zonas guardadas para admministrar', null);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const updateZonesSelected = async (req: Request, res: Response) => {
  try {
    const { data, zoneSelectedId, is_active } = req.body;

    if (data.role_id !== 1) return customResponse(false, res, 401, `Acceso denegado`, null);

    // const valid = await validDetailsSubadmin(zones);
    const zoneSelected = await DetailZonesSubAdmin.findOne({
      where: {
        id: zoneSelectedId,
      },
    });

    if (!zoneSelected) return customResponse(false, res, 401, `Acceso denegado`, null);

    await zoneSelected.update({ is_active });

    return customResponse(true, res, 200, 'Zona actualizada', null);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

const validDetailsSubadmin = async (zones: string[]) => {
  const [city] = await Promise.all(
    zones.map(async (zone: string) => {
      const codes = await findCities(zone);

      const cityExist = codes.map(async (code) => {
        const detailExist = await DetailZonesSubAdmin.findOne({
          where: { zone_id: code.id },
          attributes: ['id'],
          include: [
            {
              model: PoliticaDivision,
              attributes: ['name'],
              as: 'city',
            },
          ],
        });

        if (detailExist) {
          return detailExist.toJSON();
        }
      });
      console.log('valid--->', cityExist);
      return cityExist;
    })
  );
  return city;
};

export const getSubAdmin = async (idCity: number) => {
  try {
    const subAdmin = await DetailZonesSubAdmin.findOne({
      where: {
        zone_id: idCity,
        is_active: 1,
        is_deleted: 0,
      },
      attributes: ['user_id'],
    });

    if (!subAdmin) return null;

    return subAdmin.get().user_id;
  } catch (error) {
    return null;
  }
};

export const getAdminSubZone = async (subzone_id: number) => {
  try {
    const subAdmin = await User.findOne({
      where: {
        subzone_id,
        role_id: UserRoles.Subscriber,
        is_active: 1,
        is_deleted: 0,
      },
      attributes: ['id'],
    });

    if (!subAdmin) return null;

    return subAdmin.get().id;
  } catch (error) {
    return null;
  }
};

export const getZonesByAdmin = async (idAdmin: number) => {
  const detailAdminZones = await DetailZonesSubAdmin.findAll({
    where: { user_id: idAdmin },
    attributes: ['zone_id'],
  });

  return [...detailAdminZones.map((zone) => zone.get().zone_id)];
};

/**
 * Retrieves the subzone associated with the authenticated user.
 *
 * @param req - The request object.
 * @param res - The response object.
 */
export const getMySubZone = async (req: Request, res: Response) => {
  const { data } = req.body;

  // Check if the user role is Subscriber
  if (data.role_id !== UserRoles.Subscriber) {
    return customResponse(false, res, 401, `Acceso denegado`, null);
  }

  const subscription = await Subscription.findOne({
    where: { user_id: data.id },
    attributes: ['id'],
  });

  if (!subscription) {
    return customResponse(false, res, 401, `Su suscripción no existe`, null);
  }

  // Find the subzone with the user's id
  const subzone = await Subzone.findAll({
    where: { subs_id: subscription.get().id, is_deleted: 0 },
    attributes: ['id', 'name', 'zone_id'],
    include: [
      {
        model: PoliticaDivision,
        attributes: ['id', 'name'],
        as: 'zone',
      },
      {
        model: Polygon,
        attributes: ['lat', 'lng'],
      },
    ],
  });

  // If subzone is not found, return 404 error
  if (!subzone) {
    return customResponse(false, res, 404, `No se encontraron zonas`, null);
  }

  // Return the found subzone
  customResponse(true, res, 200, `Subzona encontrada`, subzone);
};

/**
 * Retrieves the subzones by the ID of the zone.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the subzones are retrieved.
 */
export const getSubZonesByIdZone = async (req: Request, res: Response): Promise<void> => {
  // Extract the data and idZone from the request body and params
  const { data } = req.body;
  const { idZone } = req.params;

  // Find all subzones with the specified zone_id
  const subzone = await Subzone.findAll({
    where: { zone_id: idZone, is_deleted: 0 },
    attributes: ['id', 'name'],
  });

  // If no subzone is found, return a custom error response
  if (!subzone) {
    return customResponse(false, res, 404, `No se encontraron zonas`, null);
  }

  // Return a custom success response with the retrieved subzone
  customResponse(true, res, 200, `Subzona encontrada`, subzone);
};

/**
 * Retrieves the subzones and their polygons for a specified zone ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns A Promise that resolves to void.
 */
export const getSubZonesPolygonByIdZone = async (req: Request, res: Response): Promise<void> => {
  // Extract the data and idZone from the request body and params
  const { data } = req.body;
  const { idZone } = req.params;

  // Find all subzones with the specified zone_id
  const subzone = await Subzone.findAll({
    where: { zone_id: idZone, is_deleted: 0 },
    attributes: ['id', 'name'],
    include: [
      {
        model: Polygon,
        attributes: ['lat', 'lng'],
      },
    ],
  });

  // If no subzone is found, return a custom error response
  if (!subzone) {
    return customResponse(false, res, 404, `No se encontraron zonas`, null);
  }

  // Return a custom success response with the retrieved subzone
  customResponse(true, res, 200, `Subzona encontrada`, subzone);
};

/**
 * Retrieves multipolygons by zone ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns A promise that resolves to void.
 */
export const getMultipolygonsByIdZone = async (req: Request, res: Response): Promise<void> => {
  // Extract idZone from the request params
  const { idZone } = req.params;

  // Find all multipolygons with the specified zone ID and include the id, latitude, and longitude attributes
  const multipolygons = await Multipolygon.findAll({
    where: { ec_politica_division_id: idZone },
    attributes: ['latitude', 'longitude'],
  });

  // If no multipolygons are found, return a custom error response
  if (!multipolygons || multipolygons.length === 0) {
    return customResponse(false, res, 404, `No se encontraron multipolígonos`, null);
  }

  // Return a custom success response with the retrieved multipolygons
  customResponse(true, res, 200, `Multipolígonos encontrados`, multipolygons);
};

export const getPolygonBySubzone = async (req: Request, res: Response): Promise<void> => {
  // Extract idSubzone from the request params
  const { idSubzone } = req.params;
  const polygon = await Polygon.findAll({
    attributes: [
      ['lat', 'latitude'],
      ['lng', 'longitude'],
    ],
    where: { subzone_id: idSubzone },
  });

  customResponse(true, res, 200, `Polígono encontrado`, polygon);
};

export const getSubzoneByPoint = async (req: Request, res: Response): Promise<void> => {
  const { zone_id, latitude, longitude } = req.body;

  const subzonesAndPolygons = await Subzone.findAll({
    attributes: ['id', 'name'],
    where: { zone_id, is_deleted: 0 },
    include: [
      {
        model: PoliticaDivision,
        as: 'zone',
        attributes: ['id', 'name'],
      },
      {
        model: Polygon,
        attributes: [
          ['lat', 'latitude'],
          ['lng', 'longitude'],
        ],
      },
    ],
  });

  if (subzonesAndPolygons.length === 0) return customResponse(false, res, 404, `No se encontro subzonas`, undefined);

  for (const subzone of subzonesAndPolygons) {
    const isPointInPolygon = isCoordsInPolygon(
      { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      subzone.get().polygons.map((polygon: any) => ({
        latitude: parseFloat(polygon.get().latitude),
        longitude: parseFloat(polygon.get().longitude),
      }))
    );

    if (isPointInPolygon) {
      delete subzone.dataValues.polygons;
      return customResponse(true, res, 200, `Subzona encontrada`, subzone);
    }
  }

  return customResponse(false, res, 404, `Subzona no encontrada`, undefined);
};

/**
 * Update subzone with provided data
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
export const updateSubzone = async (req: Request, res: Response): Promise<void> => {
  // Destructure the data from request body
  const { data, zone_id, name, polygon, subzone_id } = req.body;

  // Check if the user role is Subscriber
  if (data.role_id !== UserRoles.Subscriber) {
    return customResponse(false, res, 401, `Acceso denegado`, undefined);
  }

  // Check if the polygon has points
  if (polygon.length === 0) {
    return customResponse(false, res, 401, 'No hay puntos de la subzona', undefined);
  }

  // Find the subscription for the user
  const subscription = await Subscription.findOne({
    where: { user_id: data.id },
    attributes: ['id'],
  });

  // If subscription does not exist, return error
  if (!subscription) {
    return customResponse(false, res, 401, `Su suscripción no existe`, null);
  }

  // Find the zone with the provided zone_id
  const zone = await PoliticaDivision.findByPk(zone_id);

  // If zone does not exist, return error
  if (!zone) {
    return customResponse(false, res, 401, 'La subzona no existe', undefined);
  }

  // Find the subzone for the user's subscription
  const subzone = await Subzone.findOne({
    where: { id: subzone_id, subs_id: subscription.get().id, is_deleted: 0 },
    attributes: ['id', 'name'],
    include: [
      {
        model: Polygon,
        attributes: ['id', 'lat', 'lng'],
      },
    ],
  });

  // If subzone does not exist, return 404 error
  if (!subzone) {
    return customResponse(false, res, 404, `No se encontraron zonas`, null);
  }

  // Delete existing points in subzone
  for (const point of subzone.get().polygons) {
    await point.destroy();
  }

  // Update subzone name and zone_id if provided
  if (name) await subzone.update({ name });
  if (zone_id) await subzone.update({ zone_id });

  // Create polygons for each point in the polygon array
  for (const pol of polygon) {
    await Polygon.create({
      subzone_id: subzone.get().id,
      lat: pol.lat,
      lng: pol.lng,
    });
  }
  // Return success response
  return customResponse(true, res, 200, `Subzona modificada`, subzone);
};
