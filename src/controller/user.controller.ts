import { Request, Response } from 'express';
import Role from '../models/rol.model';
import User from '../models/user.model';
import { customResponse, badResponse } from '../helpers/customResponses';
import TypeASC from '../models/typeASC.model';
import { Op } from 'sequelize';
import { sendEmail } from '../helpers/sendEmail';
import { emailConfirmation } from '../templates/userEmails';
import PoliticaDivision from '../models/PoliticaDivision.model';
import DetailZonesSubAdmin from '../models/detailZonesSubAdmin.model';
import { findCities } from '../helpers/findCity';
import { verifyDistanceUser } from '../helpers/geoLibMethods';
import Complaint from '../models/complaint.model';
import HelpRequest from '../models/helpRequest.model';
import Logbook from '../models/logbook.model';
import { UserRoles } from '../enums/user.enum';
import { generateFileName, getFolderUserPhotoProfile } from '../helpers/utils';
import AscSubscriber from '../models/ascSubscriber.model';
import Subzone from '../models/subzone.model';
import Subscription from '../models/subscription.model';
import { generateSignedUrlGCS, getFilesNameFromFolder, uploadFileGCS } from '../helpers/gc-storage';
import { getExtension } from '../helpers/upload-file';
import Payment from '../models/payment.model';
import Polygon from '../models/polygon.model';

/**
 * Obtiene un usuario por id y devuelve el usuario con el rol, la zona y el tipo ASC asociado
 */
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await User.findOne({
      where: { id, is_active: 1, is_deleted: 0 },
      attributes: ['id', 'address', 'email', 'full_name', 'identification', 'online', 'phone', 'photo_home', 'photo_id_back', 'photo_id_front', 'photo_profile', 'whatsapp_group'],
      include: [
        {
          model: Role,
          attributes: ['id', 'rol_name'],
        },
        {
          model: PoliticaDivision,
          attributes: ['id', 'name', 'code'],
          as: 'zone',
        },
        {
          model: TypeASC,
          attributes: ['id', 'asc_name'],
        },
      ],
    });

    if (!user) {
      return customResponse(false, res, 401, 'no existe el usuario', null);
    }

    customResponse(true, res, 200, `Usuario encontrado`, user);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

/**
 * Recibe una solicitud y una respuesta, y devuelve una respuesta personalizada con los datos recibidos
 * en el cuerpo de la solicitud.
 */
export const geInfotUserLogged = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    if (!data) {
      return customResponse(false, res, 401, 'Email o contraseña incorrectos', null);
    }
    if (data.role_id === UserRoles.ASC) {
    }

    data.photo_home = data.photo_home ? await generateSignedUrlGCS(data.photo_home, 'users') : data.photo_home;
    data.photo_id_back = data.photo_id_back ? await generateSignedUrlGCS(data.photo_id_back, 'users') : data.photo_id_back;
    data.photo_id_front = data.photo_id_front ? await generateSignedUrlGCS(data.photo_id_front, 'users') : data.photo_id_front;
    data.photo_profile = data.photo_profile ? await generateSignedUrlGCS(data.photo_profile, getFolderUserPhotoProfile(data.photo_profile)) : data.photo_profile;

    const subscription =
      data.role_id === UserRoles.Subscriber
        ? await Subscription.findOne({
            attributes: ['id', 'num_asc', `num_subzones`, `total`, 'date_expiration'],
            where: { user_id: data.id, state: 1, is_deleted: 0 },
          })
        : null;

    customResponse(true, res, 200, `Usuario encontrado`, { ...data, subscription });
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

/**
 * Estoy tratando de obtener todos los usuarios de una base de datos, pero quiero filtrarlos por
 * zoneId, roleId, isActive, searchName, limit, offset y data
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { zoneId, subzoneId, roleId, isActive, searchName, limit, offset, data } = req.body;

    if (data.role_id !== UserRoles.Superadmin && data.role_id !== UserRoles.SubAdmin && data.role_id !== UserRoles.Subscriber) return customResponse(false, res, 404, 'No tiene autorización para esta petición', null);

    let users: any;

    if (data.role_id === UserRoles.Subscriber) {
      const subzones = [];

      if (subzoneId) {
        const subzone = await Subzone.findOne({
          where: {
            id: subzoneId,
            subs_id: data.subscription.id,
          },
        });

        if (!subzone) return customResponse(false, res, 404, 'No existe la subzona', null);

        subzones.push(subzone.get().id);
      } else {
        const subzonesDB = await Subzone.findAll({
          where: {
            subs_id: data.subscription.id,
          },
        });

        if (subzonesDB.length > 0) {
          subzonesDB.forEach((subzone) => {
            subzones.push(subzone.get().id);
          });
        }
      }

      users = await User.findAndCountAll({
        where: {
          id: { [Op.ne]: data.id },
          role_id: {
            [Op.and]: [
              //
              { [Op.ne]: UserRoles.Subscriber },
              roleId ? { [Op.in]: roleId } : { [Op.ne]: null },
            ],
          },
          is_active: isActive !== null ? isActive : { [Op.not]: null },
          is_deleted: 0,
          subzone_id: { [Op.in]: subzones },
          full_name: searchName ? { [Op.substring]: searchName } : { [Op.not]: null },
        },
        attributes: ['id', 'full_name', 'email', 'is_active', 'phone', 'photo_home', 'photo_id_back', 'photo_id_front', 'photo_profile', 'lat', 'lng', 'created_at'],
        include: [
          {
            model: Role,
            attributes: ['id', 'rol_name'],
          },
          {
            model: PoliticaDivision,
            as: 'zone',
            attributes: ['id', 'name', 'code'],
          },
          {
            model: Subzone,
            as: 'subzone',
            attributes: ['id', 'name'],
          },
          {
            model: DetailZonesSubAdmin,
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
          },
          {
            model: Complaint,
            attributes: ['id'],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
      });
    }

    if (data.role_id === UserRoles.Superadmin) {
      if (zoneId) {
        if (subzoneId) {
          users = await User.findAndCountAll({
            where: {
              id: { [Op.ne]: data.id },
              role_id: { [Op.and]: [{ [Op.ne]: data.role_id }, roleId ? { [Op.in]: roleId } : { [Op.ne]: null }] },
              is_active: isActive !== null ? isActive : { [Op.not]: null },
              is_deleted: 0,
              zone_id: zoneId,
              subzone_id: subzoneId,
              full_name: searchName ? { [Op.substring]: searchName } : { [Op.not]: null },
            },
            attributes: ['id', 'full_name', 'email', 'is_active', 'phone', 'photo_home', 'photo_id_back', 'photo_id_front', 'photo_profile', 'lat', 'lng', 'created_at'],
            include: [
              {
                model: Role,
                attributes: ['id', 'rol_name'],
              },
              {
                model: PoliticaDivision,
                as: 'zone',
                attributes: ['id', 'name', 'code'],
              },
              {
                model: Subzone,
                as: 'subzone',
                attributes: ['id', 'name'],
              },
              {
                model: DetailZonesSubAdmin,
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
              },
              {
                model: Complaint,
                attributes: ['id'],
              },
              {
                model: Subscription,
                as: 'subscription',
                attributes: ['id', 'state', 'photo_ticket'],
              },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
          });
        } else {
          users = await User.findAndCountAll({
            where: {
              id: { [Op.ne]: data.id },
              role_id: { [Op.and]: [{ [Op.ne]: data.role_id }, roleId ? { [Op.in]: roleId } : { [Op.ne]: null }] },
              is_active: isActive !== null ? isActive : { [Op.not]: null },
              is_deleted: 0,
              zone_id: zoneId,
              full_name: searchName ? { [Op.substring]: searchName } : { [Op.not]: null },
            },
            attributes: ['id', 'full_name', 'email', 'is_active', 'phone', 'photo_home', 'photo_id_back', 'photo_id_front', 'photo_profile', 'lat', 'lng', 'created_at'],
            include: [
              {
                model: Role,
                attributes: ['id', 'rol_name'],
              },
              {
                model: PoliticaDivision,
                as: 'zone',
                attributes: ['id', 'name', 'code'],
              },
              {
                model: Subzone,
                as: 'subzone',
                attributes: ['id', 'name'],
              },
              {
                model: DetailZonesSubAdmin,
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
              },
              {
                model: Complaint,
                attributes: ['id'],
              },
              {
                model: Subscription,
                as: 'subscription',
                attributes: ['id', 'state', 'photo_ticket'],
              },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
          });
        }
      } else {
        users = await User.findAndCountAll({
          where: {
            id: { [Op.ne]: data.id },
            role_id: { [Op.and]: [{ [Op.ne]: data.role_id === 1 ? 1 : data.role_id === 2 ? [1, 2] : null }, roleId ? { [Op.in]: roleId } : { [Op.ne]: null }] },
            is_active: isActive !== null ? isActive : { [Op.not]: null },
            is_deleted: 0,
            full_name: searchName ? { [Op.substring]: searchName } : { [Op.not]: null },
          },
          attributes: ['id', 'full_name', 'email', 'is_active', 'phone', 'photo_home', 'photo_id_back', 'photo_id_front', 'photo_profile', 'lat', 'lng', 'created_at'],
          include: [
            {
              model: Role,
              attributes: ['id', 'rol_name'],
            },
            {
              model: PoliticaDivision,
              as: 'zone',
              attributes: ['id', 'name', 'code'],
            },
            {
              model: Subzone,
              as: 'subzone',
              attributes: ['id', 'name'],
            },
            {
              model: DetailZonesSubAdmin,
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
            },
            {
              model: Complaint,
              attributes: ['id'],
            },
            {
              model: HelpRequest,
              attributes: ['id'],
            },
            {
              model: Subscription,
              as: 'subscription',
              attributes: ['id', 'state', 'photo_ticket'],
            },
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['created_at', 'DESC']],
        });
      }
    }

    if (data.role_id === UserRoles.SubAdmin) {
      users = zoneId
        ? await User.findAndCountAll({
            where: {
              id: { [Op.ne]: data.id },
              role_id: { [Op.and]: [{ [Op.ne]: data.role_id }, roleId ? { [Op.in]: roleId } : { [Op.ne]: null }] },
              is_active: isActive !== null ? isActive : { [Op.not]: null },
              is_deleted: 0,
              zone_id: zoneId,
              full_name: searchName ? { [Op.substring]: searchName } : { [Op.not]: null },
            },
            attributes: ['id', 'full_name', 'email', 'is_active', 'phone', 'photo_home', 'photo_id_back', 'photo_id_front', 'photo_profile', 'lat', 'lng', 'created_at'],
            include: [
              {
                model: Role,
                attributes: ['id', 'rol_name'],
              },
              {
                model: PoliticaDivision,
                as: 'zone',
                attributes: ['id', 'name', 'code'],
              },
              {
                model: Subzone,
                as: 'subzone',
                attributes: ['id', 'name'],
              },
              {
                model: DetailZonesSubAdmin,
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
              },
              {
                model: Complaint,
                attributes: ['id'],
              },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
          })
        : await User.findAndCountAll({
            where: {
              id: { [Op.ne]: data.id },
              role_id: { [Op.and]: [{ [Op.ne]: data.role_id === 1 ? 1 : data.role_id === 2 ? [1, 2] : null }, roleId ? { [Op.in]: roleId } : { [Op.ne]: null }] },
              is_active: isActive !== null ? isActive : { [Op.not]: null },
              is_deleted: 0,
              full_name: searchName ? { [Op.substring]: searchName } : { [Op.not]: null },
            },
            attributes: ['id', 'full_name', 'email', 'is_active', 'phone', 'photo_home', 'photo_id_back', 'photo_id_front', 'photo_profile', 'lat', 'lng', 'created_at'],
            include: [
              {
                model: Role,
                attributes: ['id', 'rol_name'],
              },
              {
                model: PoliticaDivision,
                as: 'zone',
                attributes: ['id', 'name', 'code'],
              },
              {
                model: Subzone,
                as: 'subzone',
                attributes: ['id', 'name'],
              },
              {
                model: DetailZonesSubAdmin,
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
              },
              {
                model: Complaint,
                attributes: ['id'],
              },
              {
                model: HelpRequest,
                attributes: ['id'],
              },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
          });
    }

    if (users.count === 0) return customResponse(false, res, 404, 'No existen registro de usuarios', null);

    users.rows.map((user: any, idx: number) => {
      user.get().rowNumber = offset + idx + 1;
    });

    for (const user of users.rows) {
      const countCancelLogBook = await Logbook.count({
        where: {
          user_id: user.get().id,
          status: 'cancel',
        },
      });
      const countCancelHelp = await HelpRequest.count({
        where: {
          cancel_user_id: user.get().id,
          status: 'cancel',
        },
      });
      const countCancelComplaint = await Complaint.count({
        where: {
          cancel_user_id: user.get().id,
          status: 'cancel',
        },
      });

      user.get().countCancel = countCancelLogBook + countCancelHelp + countCancelComplaint;

      user.get().photo_home = user.get().photo_home ? await generateSignedUrlGCS(user.get().photo_home, 'users') : '';
      user.get().photo_id_back = user.get().photo_id_back ? await generateSignedUrlGCS(user.get().photo_id_back, 'users') : '';
      user.get().photo_id_front = user.get().photo_id_front ? await generateSignedUrlGCS(user.get().photo_id_front, 'users') : '';
      user.get().photo_profile = user.get().photo_profile ? await generateSignedUrlGCS(user.get().photo_profile, getFolderUserPhotoProfile(user.get().photo_profile)) : '';
      if (user.get().subscription) user.get().subscription.photo_ticket = user.get().subscription.photo_ticket ? await generateSignedUrlGCS(user.get().subscription.photo_ticket, 'vouchers') : '';
    }

    customResponse(true, res, 200, `Usuarios encontrados`, users);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

/**
 * Cambia el estado de un usuario (activo o inactivo) y envía un correo electrónico al usuario
 * @param {Request} req - Solicitud, res: Respuesta
 * @param {Response} res - Respuesta
 * @returns id del usuario
 */
export const changeStatusUserById = async (req: Request, res: Response) => {
  try {
    const { id, status, data } = req.body;

    if (data.role_id !== UserRoles.Superadmin && data.role_id !== UserRoles.SubAdmin && data.role_id !== UserRoles.Subscriber) return customResponse(false, res, 404, 'No tiene autorización para esta petición', null);

    const user = await User.findOne({
      where: {
        id,
        is_deleted: 0,
      },
      attributes: ['id', 'email', 'full_name', 'role_id', 'is_active', 'role_id', 'subzone_id'],
    });

    if (!user) return customResponse(false, res, 404, 'No existe el usuario', null);

    if (user.get().role_id === UserRoles.Subscriber) {
      const subscription = await Subscription.findOne({
        where: {
          user_id: user.get().id,
        },
      });

      if (!subscription) return customResponse(false, res, 404, 'No existe la suscripción', null);

      subscription.update({ state: 1 });
    }

    await user.update({ is_active: status });

    if (user.get().is_active) {
      await sendEmail(
        //
        'We-u',
        [user.get().email],
        'Su cuenta ha sido activada',
        `Hola ${user.get().full_name}, su cuenta ha sido activada`,
        emailConfirmation(user.get().full_name, user.get().role_id)
      );
    }

    customResponse(true, res, 200, `Usuario actualizado`, user.get().id);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

/**
 * Elimina un usuario de la base de datos.
 * @param {Request} req - Solicitud
 * @param {Response} res - Respuesta
 * @returns El objeto de usuario
 */
export const deleteUser = async (req: Request, res: Response) => {
  const { data } = req.body;

  try {
    const user = await User.findOne({
      where: { id: data.id, is_deleted: 0 },
      attributes: ['id', 'role_id'],
    });

    if (!user) return customResponse(false, res, 404, `No existe el usuario`, null);

    await user.update({ is_deleted: 1, is_active: 0, subzone_id: null });

    if (user.get().role_id === UserRoles.Subscriber) {
      const subscription = await Subscription.findOne({
        where: {
          user_id: user.get().id,
          is_deleted: 0,
        },
      });
      if (subscription) {
        await subscription.update({ state: 0, is_deleted: 1 });

        const subzone = await Subzone.findOne({
          where: {
            subs_id: subscription.get().id,
          },
        });
        if (subzone) {
          await subzone.update({ is_deleted: 1, state: 0 });
          await User.update({ is_active: 0, is_deleted: 1 }, { where: { role_id: UserRoles.ASC, subzone_id: subzone.get().id } });
          await User.update({ subzone_id: null }, { where: { role_id: UserRoles.User, subzone_id: subzone.get().id } });
          await AscSubscriber.destroy({ where: { subscriber_id: subscription.get().id, subzone_id: subzone.get().id } });
          await Polygon.destroy({ where: { subzone_id: subzone.get().id } });
        }
      }
    }
    customResponse(true, res, 200, 'Usuario eliminado', { id: user.get().id, zone_name: user.get().full_name });
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const updateInfoUser = async (req: Request, res: Response) => {
  try {
    const { data, avatar, expo_token, full_name, phone, whatsapp_group, lat, lng } = req.body;

    const user = await User.findOne({
      where: { id: data.id, is_deleted: 0, is_active: 1 },
      attributes: ['id'],
    });

    if (!user) return customResponse(false, res, 404, `No existe el usuario`, null);

    const photo_profile = req.files?.photo_profile;

    if (photo_profile) {
      if (photo_profile instanceof Array === true) {
        return customResponse(false, res, 400, 'Solo puede subir un archivo', null);
      }
    }

    if (phone) {
      const userPhone = await User.findOne({
        where: { phone },
        attributes: ['id'],
      });

      if (userPhone) {
        if (userPhone.get().id === data.id) {
          await user.update({ phone });
        } else {
          return customResponse(false, res, 404, `Ya existe ese numero de teléfono`, null);
        }
      }
    }

    if (photo_profile) {
      // await deleteFileGCS(user.get().photo_profile, 'users');

      const nameFile = `photo_profile_${data.identification}_${generateFileName()}`;
      await uploadFileGCS(photo_profile, nameFile, 'users');

      const extension = getExtension(photo_profile);
      await user.update({ photo_profile: photo_profile ? `${nameFile}.${extension}` : null });
    } else {
      if (avatar) await user.update({ photo_profile: avatar });
    }

    await user.update({ expo_token, full_name, phone, whatsapp_group, lat, lng });
    return customResponse(true, res, 200, `Usuario actualizado`, user);
  } catch (error) {
    console.error('---->', error);
    return null;
  }
};

export const updateOnlineUser = async (id: number) => {
  try {
    const user = await User.findOne({
      where: { id, is_deleted: 0 },
      attributes: ['id', 'full_name', 'role_id'],
    });

    if (!user) return null;

    await user.update({ online: 1 });

    return user;
  } catch (error) {
    console.error('---->', error);
    return null;
  }
};

export const updateOfflineUser = async (id: number) => {
  try {
    const user = await User.findOne({
      where: { id, is_deleted: 0 },
      attributes: ['id', 'full_name', 'role_id'],
    });

    if (!user) return null;

    await user.update({ online: 0 });

    return user;
  } catch (error) {
    console.error('---->', error);
    return null;
  }
};

export const updateAddressAndCoords = async (req: Request, res: Response) => {
  try {
    const { data, lat, lng, address, codeCity } = req.body;
    const { idCity } = req.params;

    if (idCity) {
      const city = await PoliticaDivision.findOne({
        where: { id: parseInt(idCity), id_parent: { [Op.ne]: null } },
      });

      if (!city) return customResponse(false, res, 404, 'No existe la zona o ciudad', null);
    }

    const codes = await findCities(codeCity);

    const zone_id = codes.length > 0 ? codes[0].id : undefined;

    const user = await User.findOne({
      where: { id: data.id, is_deleted: 0, is_active: 1 },
      attributes: ['id', 'full_name'],
    });

    if (!user) return customResponse(false, res, 404, `No existe el usuario`, null);

    await user.update({ lat, lng, address, zone_id: idCity ? parseInt(idCity) : zone_id, subzone_id: null });

    return customResponse(true, res, 200, 'Ubicacion actualizada', user);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getUsersFiveKmAround = async (req: Request, res: Response) => {
  try {
    const { data, lat, lng } = req.body;

    const users = await User.findAll({
      where: {
        id: { [Op.ne]: data.id },
        is_active: 1,
        is_deleted: 0,
        role_id: { [Op.in]: [UserRoles.ASC, UserRoles.User] },
      },
      attributes: ['id', 'full_name', 'identification', 'phone', 'address', 'whatsapp_group', 'photo_profile', 'lat', 'lng', 'role_id'],
    });

    if (users.length === 0) return customResponse(false, res, 404, `No existen usuarios`, null);

    const usersFiltered = users.filter((user: any) => verifyDistanceUser(user.get(), { lat, lng }, 5));

    const asc = usersFiltered.filter((asc: any) => asc.role_id === 3);
    const citizens = usersFiltered.filter((user: any) => user.role_id === 4);

    return customResponse(true, res, 200, 'Usuarios encontrados', { asc, citizens });
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

/**
 * Retrieves the ASCs by zone ID.
 *
 * This function handles a request to find all ASCs associated with a given zone,
 * identified by its ID. It checks if the user has the correct role to access this information.
 * If the user has the correct role and the zone exists, it retrieves and returns the ASCs.
 * Otherwise, it responds with the appropriate error message.
 *
 * @param req - The incoming request object containing the zone ID in the params and user data in the body.
 * @param res - The outgoing response object used to send back the custom response.
 */
export const getAscByZone = async (req: Request, res: Response) => {
  // Extract user data and zone ID from the request
  const { data } = req.body;
  const { zone_id } = req.params;

  // Check if the user has the role of 'User'
  if (data.role_id !== UserRoles.User) {
    // If not, deny access and return a 401 response
    return customResponse(false, res, 401, 'Acceso denegado', null);
  }

  // Find the zone by ID
  const zone = await PoliticaDivision.findOne({ where: { id: parseInt(zone_id) } });

  // If the zone does not exist, return a 404 response
  if (!zone) {
    return customResponse(false, res, 404, 'No existe la zona', null);
  }

  // Retrieve ASCs by the zone ID
  const ascs = await await User.findAll({
    where: {
      zone_id: parseInt(zone_id),
      role_id: 3,
      is_active: 1,
      is_deleted: 0,
    },
    attributes: ['id', 'full_name', 'zone_id', 'identification', 'phone', 'expo_token', 'lat', 'lng'],
  });

  // Return the ASCs found with a 200 response
  return customResponse(true, res, 200, 'ASC encontrados por zona', ascs);
};

/**
 * Retrieves ASCs (Agentes de Soporte Comunitario) by a given subzone ID.
 *
 * This function handles the incoming HTTP request to find all ASCs associated
 * with a specified subzone. It first checks if the requesting user has the
 * appropriate role, then it queries the database for the subzone and its ASCs.
 * If the subzone exists and ASCs are found, they are returned in the response.
 *
 * @param req - The incoming request object containing the subzone ID in the params and user data in the body.
 * @param res - The outgoing response object used to send back the custom response.
 */
export const getAscBySubzone = async (req: Request, res: Response) => {
  // Extract user data and subzone ID from the request
  const { data } = req.body;
  const { subzone_id } = req.params;

  // Check if the user has the role of 'User'
  if (data.role_id !== UserRoles.User) {
    // If not, deny access and return a 401 response
    return customResponse(false, res, 401, 'Acceso denegado', null);
  }

  // Find the subzone by ID and check it's active and not deleted
  const subzone = await Subzone.findOne({
    where: {
      id: parseInt(subzone_id),
      state: 1,
      is_deleted: 0,
    },
  });

  // If the subzone does not exist, return a 404 response
  if (!subzone) {
    return customResponse(false, res, 404, 'No existe la subzona', null);
  }

  // Retrieve ASCs by the subzone ID
  const ascs = await getASCBySubZoneId(parseInt(subzone_id));

  // Return the ASCs found with a 200 response
  return customResponse(true, res, 200, 'ASC encontrados por subzona', ascs);
};

export const getASCOnline = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    if (data.role_id !== UserRoles.SubAdmin && data.role_id !== UserRoles.Superadmin && data.role_id !== UserRoles.Subscriber) {
      return customResponse(false, res, 401, 'Acceso denegado', null);
    }

    if (data.role_id === UserRoles.Superadmin) {
      const usersASCOnline = await User.findAndCountAll({
        where: {
          is_active: 1,
          is_deleted: 0,
          online: 1,
          role_id: 3,
        },
        attributes: ['id', 'full_name', 'zone_id', 'lat', 'lng', 'email', 'phone', 'photo_profile'],
      });

      for (const user of usersASCOnline.rows) {
        if (user.get().photo_profile) user.get().photo_profile = await generateSignedUrlGCS(user.get().photo_profile, getFolderUserPhotoProfile(user.get().photo_profile));
      }

      if (usersASCOnline.rows.length > 0) {
        for (const user of usersASCOnline.rows) {
          const u = await getUserStatusAssignedById(user.get().id);
          user.get().assigned = u ? u.get().assigned : false;
        }
      }

      return customResponse(true, res, 200, `Agentes de control`, usersASCOnline);
    }

    if (data.role_id === UserRoles.SubAdmin) {
      const zonesAdminstrated = await DetailZonesSubAdmin.findAll({
        where: {
          user_id: data.id,
          is_active: 1,
          is_deleted: 0,
        },
        attributes: ['zone_id'],
      });

      const zones = zonesAdminstrated.map((item) => item.get().zone_id);

      const usersASCOnline = await User.findAndCountAll({
        where: {
          is_active: 1,
          is_deleted: 0,
          online: 1,
          role_id: 3,
          zone_id: { [Op.in]: zones },
        },
        attributes: ['id', 'full_name', 'zone_id', 'lat', 'lng', 'email', 'phone', 'photo_profile'],
      });

      for (const user of usersASCOnline.rows) {
        if (user.get().photo_profile) user.get().photo_profile = await generateSignedUrlGCS(user.get().photo_profile, getFolderUserPhotoProfile(user.get().photo_profile));
      }

      if (usersASCOnline.rows.length > 0) {
        for (const user of usersASCOnline.rows) {
          const u = await getUserStatusAssignedById(user.get().id);
          user.get().assigned = u ? u.get().assigned : false;
        }
      }

      return customResponse(true, res, 200, `Agentes de control`, usersASCOnline);
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

      const usersASCOnline = await User.findAndCountAll({
        where: {
          is_active: 1,
          is_deleted: 0,
          online: 1,
          role_id: 3,
          subzone_id: { [Op.in]: subzones },
        },
        attributes: ['id', 'full_name', 'zone_id', 'lat', 'lng', 'email', 'phone', 'photo_profile'],
      });

      for (const user of usersASCOnline.rows) {
        if (user.get().photo_profile) user.get().photo_profile = await generateSignedUrlGCS(user.get().photo_profile, getFolderUserPhotoProfile(user.get().photo_profile));
      }

      if (usersASCOnline.rows.length > 0) {
        for (const user of usersASCOnline.rows) {
          const u = await getUserStatusAssignedById(user.get().id);
          user.get().assigned = u ? u.get().assigned : false;
        }
      }

      return customResponse(true, res, 200, `Agentes de control`, usersASCOnline);
    }
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const getASCByZoneId = async (zone_id: number) => {
  return await User.findAll({
    where: {
      zone_id,
      subzone_id: null,
      role_id: 3,
      is_active: 1,
      is_deleted: 0,
    },
    attributes: ['id', 'full_name', 'zone_id', 'identification', 'phone', 'expo_token', 'lat', 'lng'],
  });
};

export const getASCBySubZoneId = async (subzone_id: number) => {
  return await User.findAll({
    where: {
      subzone_id,
      role_id: 3,
      is_active: 1,
      is_deleted: 0,
    },
    attributes: ['id', 'full_name', 'zone_id', 'identification', 'phone', 'expo_token', 'lat', 'lng'],
  });
};

export const getUserByIdForExpoNotification = async (id: number) => {
  return await User.findOne({
    where: { id, is_active: 1, is_deleted: 0 },
    attributes: ['id', 'full_name', 'expo_token'],
  });
};

export const getUserSuperAdmin = async () => {
  return await User.findOne({
    where: { role_id: 1, is_active: 1, is_deleted: 0 },
    attributes: ['id'],
  });
};

export const getUserByIdAndIsActive = async (id: number, is_active: boolean) => {
  return await User.findOne({
    where: { id, is_active, is_deleted: 0 },
    attributes: ['id', 'full_name', 'role_id', 'identification'],
  });
};

export const getUserStatusAssignedById = async (id: number) => {
  const user = await User.findOne({
    where: {
      id,
      is_active: 1,
      is_deleted: 0,
    },
    attributes: ['id', 'full_name', 'zone_id', 'lat', 'lng', 'email', 'phone', 'photo_profile'],
  });

  if (!user) return null;

  if (user.get().photo_profile) user.get().photo_profile = await generateSignedUrlGCS(user.get().photo_profile, getFolderUserPhotoProfile(user.get().photo_profile));

  const helpRequest = await HelpRequest.findOne({
    where: {
      agent_id: id,
      status: 'pending',
    },
    attributes: ['id'],
  });

  const complaint = await Complaint.findOne({
    where: {
      agent_id: id,
      status: 'pending',
    },
    attributes: ['id'],
  });

  const assigned = helpRequest || complaint;

  user.get().assigned = assigned ? true : false;

  return user;
};

export const updateSubzoneByUserId = async (req: Request, res: Response) => {
  const { data, zone_id, subzone_id } = req.body;

  if (data.role_id !== UserRoles.User) return customResponse(false, res, 401, 'No tiene permisos para realizar esta petición', null);

  const user = await User.findOne({
    where: { id: data.id, is_deleted: 0, is_active: 1 },
    attributes: ['id'],
  });

  if (!user) return customResponse(false, res, 404, `No existe el usuario`, null);

  const zone = await PoliticaDivision.findOne({
    where: { id: zone_id },
    attributes: ['id'],
  });

  if (!zone) return customResponse(false, res, 404, `No existe la zona`, null);

  const subzone = await Subzone.findOne({
    where: { id: subzone_id, is_deleted: 0, state: 1 },
    attributes: ['id'],
  });

  if (!subzone) return customResponse(false, res, 404, `No existe la subzona`, null);

  await user.update({ zone_id: zone.get().id, subzone_id: subzone.get().id });

  customResponse(true, res, 200, 'Subzona actualizada', user);
};

export const updateAvailableAsc = async (req: Request, res: Response) => {
  const { data } = req.body;
  if (data.role_id !== UserRoles.ASC) return customResponse(false, res, 401, `Acceso denegado`, null);

  const user = await User.findOne({
    where: { id: data.id, is_deleted: 0, is_active: 1 },
    attributes: ['id', 'is_available'],
  });

  if (!user) return customResponse(false, res, 404, `No existe el usuario`, null);

  await user.update({ state: !user.get().is_available });

  return customResponse(true, res, 200, `Usuario actualizado`, user);
};

/**
 * Retrieves payments made by a specific user
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
export const getPaymentsByUserId = async (req: Request, res: Response): Promise<void> => {
  const { idUser } = req.params;
  const { data } = req.body;

  // Check if the user has the subscriber role
  if (data.role_id !== UserRoles.Superadmin) {
    return customResponse(false, res, 401, 'No tiene permisos para realizar esta petición', null);
  }

  // Find the user
  const user = await User.findOne({
    where: { id: idUser, is_deleted: 0 },
    attributes: ['id', 'address', 'email', 'full_name', 'identification', 'phone'],
    include: [
      {
        model: Role,
        attributes: ['id', 'rol_name'],
      },
      {
        model: PoliticaDivision,
        attributes: ['id', 'name', 'code'],
        as: 'zone',
      },
    ],
  });

  // If the user is not found, return an error response
  if (!user) {
    return customResponse(false, res, 401, 'no existe el usuario', null);
  }

  // Find the user's subscription
  const subscription = await Subscription.findOne({
    attributes: { exclude: ['created_at', 'is_deleted', 'updated_at'] },
    where: { user_id: user.get().id, is_deleted: 0 },
  });

  // If the subscription is not found, return an error response
  if (!subscription) {
    return customResponse(false, res, 401, 'Suscripción no encontrada', null);
  }

  // Find the payments related to the subscription
  const payments = await Payment.findAll({
    where: { subscription_id: subscription.get().id },
    order: [['created_at', 'DESC']],
  });

  subscription.get().photo_ticket = subscription.get().photo_ticket ? await generateSignedUrlGCS(subscription.get().photo_ticket, 'vouchers') : '';

  for (const payment of payments) {
    payment.get().voucher = payment.get().voucher ? await generateSignedUrlGCS(payment.get().voucher, 'vouchers') : '';
  }

  // Return a success response with the subscription and payments
  return customResponse(true, res, 200, 'Usuario', { user, subscription, payments });
};

export const getAvatars = async (req: Request, res: Response) => {
  const avatares = await getFilesNameFromFolder('avatars');
  if (avatares.length === 0) return customResponse(false, res, 404, 'No existen avatares', null);
  const urlsAndNameFiles = await Promise.all(
    avatares
      .filter((avatar) => avatar !== '')
      .map(async (avatar) => {
        if (avatar) {
          return { url: await generateSignedUrlGCS(avatar, 'avatars'), name: avatar };
        }
      })
  );
  return customResponse(true, res, 200, 'Avatares', urlsAndNameFiles);
};
