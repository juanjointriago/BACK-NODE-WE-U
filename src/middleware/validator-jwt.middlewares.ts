import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { customResponse } from '../helpers/customResponses';
import Role from '../models/rol.model';
import TypeASC from '../models/typeASC.model';
import User from '../models/user.model';
import PoliticaDivision from '../models/PoliticaDivision.model';
import Subzone from '../models/subzone.model';
import { UserRoles } from '../enums/user.enum';
import Subscription from '../models/subscription.model';

/**
 * Comprueba si el token está presente en la solicitud, si lo está, lo verifica y si es válido, agrega
 * los datos del usuario al cuerpo de la solicitud.
 * @param {Request} req - Solicitud: el objeto de la solicitud.
 * @param {Response} res - El objeto de respuesta.
 * @param {NextFunction} next - Esta es una función a la que llamamos cuando queremos pasar al
 * siguiente middleware.
 * @returns una función que se está utilizando como middleware.
 */
export const validatorJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.header('Authorization');

    if (!Authorization) {
      return res.status(401).json({
        msg: 'No hay el token en la petición',
      });
    }

    const { object }: any = jwt.verify(Authorization, `${process.env.SECRETORPRIVATEKEY}`);

    const { id } = object;

    const user = await User.findOne({
      where: { id, is_active: 1, is_deleted: 0 },
      attributes: { exclude: ['accessed_at', 'is_deleted', 'password', 'updated_at'] },
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
          model: Subzone,
          attributes: ['id', 'name'],
          as: 'subzone',
        },
        {
          model: TypeASC,
          attributes: ['id', 'asc_name'],
        },
        {
          model: Subscription,
          attributes: ['id', 'date_expiration', 'state'],
        },
      ],
    });

    if (!user) {
      return customResponse(false, res, 401, 'Acceso denegado', null);
    }

    if (req.originalUrl === '/api/subscription/payment') {
      req.body.data = user.toJSON();

      return next();
    }

    if (user.get().role_id === UserRoles.Subscriber) {
      if (user.get().subscription.state === false) {
        return customResponse(false, res, 402, 'Tu suscripción ha expirado, renuevala', null);
      }

      const dateExpiration = new Date(user.get().subscription.date_expiration);
      const now = new Date();

      if (dateExpiration < now) {
        await Subscription.update({ state: false }, { where: { user_id: id } });
        return customResponse(false, res, 402, 'Tu suscripción ha expirado, renuevala', null);
      }
    }
    req.body.data = user.toJSON();

    next();
  } catch (error) {
    console.log(error);

    return customResponse(false, res, 401, 'Acceso denegado', null);
  }
};
