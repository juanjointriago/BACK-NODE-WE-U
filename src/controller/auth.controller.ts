import { decodeJWT, generateJWTObjectWhiteTime } from './../helpers/generate-jwt';
import { sendEmail } from './../helpers/sendEmail';
import { Request, Response } from 'express';
import { badResponse, customResponse } from '../helpers/customResponses';
import { generatePassword, ValidadPassword } from '../helpers/password';
import User from '../models/user.model';
import { emailConfirmAccount, emailRecoverPassword } from '../templates/authEmails';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';

import { generateFileName, generatorCode, savePhotosCreateUser } from '../helpers/utils';
import { UserRoles } from '../enums/user.enum';
import Code from '../models/code.model';
import { sendSMS } from '../helpers/twillio';
import fileUpload from 'express-fileupload';
import { getExtension } from '../helpers/upload-file';

/**
 * Inicia sesión en un usuario
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: { email, is_deleted: 0, role_id: { [Op.not]: [UserRoles.Superadmin, UserRoles.SubAdmin, UserRoles.Subscriber] } },
    });

    if (!user) {
      return customResponse(false, res, 401, 'Email o contraseña incorrectos', null);
    }

    const validate = ValidadPassword(password, user.getDataValue('password'));

    if (!validate) {
      return customResponse(false, res, 401, 'Email o contraseña incorrectos', null);
    }

    if (!user.get().is_active) {
      if (user.get().role_id === 4) {
        return customResponse(false, res, 401, 'Te enviamos un correo electrónico para confirmar y activar la cuenta, por favor revise su bandeja de entrada', null);
      }
      if (user.get().role_id === 3) {
        return customResponse(false, res, 401, 'Tu cuenta esta inactiva. Espera que el adiministrador active tu cuenta.', null);
      }
    }

    await user.update({ accessed_at: new Date() });

    const token = await generateJWTObjectWhiteTime({ id: user.get().id, full_name: user.get().full_name }, '1d');

    customResponse(true, res, 200, `Bienvenido`, { token });
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};
export const loginSMS = async (req: Request, res: Response) => {
  const { phone } = req.body;

  const user = await User.findOne({
    where: { phone, is_deleted: 0, role_id: { [Op.not]: [1, 2] } },
  });

  if (!user) {
    return customResponse(false, res, 401, 'No se encuentro el usuario', null);
  }

  if (!user.get().is_active) {
    if (user.get().role_id === UserRoles.User) {
      return customResponse(false, res, 401, 'Te enviamos un correo electrónico para confirmar y activar la cuenta, por favor revise su bandeja de entrada', null);
    }
    if (user.get().role_id === UserRoles.ASC) {
      return customResponse(false, res, 401, 'Tu cuenta esta inactiva. Espera que el administrador active tu cuenta.', null);
    }
  }

  // await user.update({ accessed_at: new Date() });

  const codeGenerated = generatorCode();

  await Code.create({
    code: codeGenerated,
    user_id: user.get().id,
  });

  await sendSMS({ msg: codeGenerated, to: user.get().phone });

  customResponse(true, res, 200, `Le enviamos un mensaje de con un código para iniciar sesión`, undefined);
};

/**
 * Crea un nuevo usuario
 */
export const registerUsers = async (req: Request, res: Response) => {
  try {
    const { address, avatar, email, full_name, identification, lat, lng, password, phone, role_id, type_asc_id, whatsapp_group, zone_id } = req.body;

    const photo_profile = req.files?.photo_profile;

    if (photo_profile) {
      if (photo_profile instanceof Array === true) {
        return customResponse(false, res, 400, 'Solo puede subir un archivo', null);
      }
    }

    // if (parseInt(role_id) === 3) {
    //   if (type_asc_id === null) {
    //     return customResponse(false, res, 400, `El tipo de agente es requerido`, null);
    //   }
    // }

    if (parseInt(role_id) === 1) {
      const userSuperAdmin = await User.findOne({ where: { role_id: 1, is_active: 1, is_deleted: 0 } });
      if (userSuperAdmin) {
        return customResponse(false, res, 400, `No puede registrar un super administrador`, null);
      }
    }

    const userPivote = await User.findOne({ where: { email: email, is_active: 1, is_deleted: 0 } });

    if (userPivote) {
      return customResponse(false, res, 400, `Un usuario con este '${email}' ya existe`, null);
    }

    const passEncript = await generatePassword(password);

    const user = await User.create({ password: passEncript, address, email: email.trim().toLowerCase(), full_name, identification, lat: lat ? lat : null, lng: lng ? lng : null, phone, role_id: parseInt(role_id), type_asc_id, whatsapp_group, zone_id: zone_id ? zone_id : null });

    if (user) {
      if (photo_profile) {
        const nameFile = `${identification}_${generateFileName()}`;
        await savePhotosCreateUser({ identification: nameFile, photo_profile });
        const extension = getExtension(photo_profile);
        await user.update({
          photo_profile: photo_profile ? `photo_profile_${nameFile}.${extension}` : null,
        });
      } else {
        if (avatar) await user.update({ photo_profile: avatar });
      }
    }

    const token = await generateJWTObjectWhiteTime({ id: user.get().id }, '7d');

    if (user.get().role_id === 4) {
      await sendEmail(
        //
        'We-u',
        [email],
        'Confirmar cuenta',
        `Confirmar cuenta`,
        emailConfirmAccount(user.get().full_name, token)
      );
    }

    const msg = user.get().role_id === 4 ? `El Usuario ${user.get().full_name} creado correctamente. Te enviamos un correo electrónico para confirmar y activar la cuenta, por favor revise su bandeja de entrada` : `El Usuario "${user.get().full_name}" creado correctamente. Espera que el Administrador acepte tu registro`;

    customResponse(true, res, 200, msg, { id: user.get().id });
  } catch (error) {
    console.error('-->', error);
    badResponse(res);
  }
};

/**
 * Recibe una solicitud y un objeto de respuesta, luego obtiene el correo electrónico y la contraseña
 * del cuerpo de la solicitud, luego intenta encontrar un usuario con el correo electrónico y la
 * contraseña proporcionados, si no lo encuentra, devuelve una respuesta personalizada con un Código de
 * estado 401 y un mensaje, si lo encuentra, valida la contraseña, si no es válido, devuelve una
 * respuesta personalizada con un código de estado 401 y un mensaje, si es válido, verifica si el
 * usuario está activo, si es no, devuelve una respuesta personalizada con un código de estado 401 y un
 * mensaje, si está activo, actualiza el campo accessed_at del usuario, luego genera un token JWT con
 * la identificación y el nombre completo del usuario, y finalmente devuelve una respuesta
 * personalizada con un 200 código de estado y un mensaje
 * @param {Request} req - Solicitud: el objeto de la solicitud.
 * @param {Response} res - El objeto de respuesta.
 * @returns Una función que recibe una solicitud y una respuesta como parámetros.
 */
export const loginAdmin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: {
        email: email.trim(),
        role_id: { [Op.or]: [1, 2, 5] },
        is_deleted: 0,
      },
    });

    if (!user) {
      return customResponse(false, res, 401, 'Usuario o contraseña incorrectos', null);
    }

    const validate = ValidadPassword(password, user.getDataValue('password'));

    if (!validate) {
      return customResponse(false, res, 401, 'Usuario o contraseña incorrectos', null);
    }

    if (!user.get().is_active) {
      return customResponse(false, res, 401, 'Por favor espere que el administrador active su cuenta', null);
    }

    await user.update({ accessed_at: new Date() });

    const token = await generateJWTObjectWhiteTime({ id: user.get().id, full_name: user.get().full_name }, '1d');

    customResponse(true, res, 200, `Bienvenido`, { token });
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

/**
 * Recibe una solicitud y una respuesta, obtiene los datos del cuerpo de la solicitud, genera un nuevo
 * token con los datos y lo envía de vuelta al cliente
 * @param {Request} req - Solicitud: este es el objeto de solicitud que se pasa al controlador de ruta.
 * @param {Response} res - Respuesta: el objeto de respuesta que se enviará al cliente.
 */
export const renewToken = async (req: Request, res: Response) => {
  const data = req.body.data;

  const token = await generateJWTObjectWhiteTime({ id: data.id, full_name: data.full_name }, '1d');
  customResponse(true, res, 200, 'Token renovado', { token });
};

/**
 * Recibe un token, lo verifica y si es válido activa al usuario
 * @param {Request} req - Solicitud: este es el objeto de solicitud que contiene los datos enviados por
 * el cliente.
 * @param {Response} res - Respuesta: este es el objeto de respuesta que se enviará de vuelta al
 * cliente.
 * @returns una respuesta con un código de estado de 200 y un mensaje de 'Usuario activado'
 */
export const confirmAccount = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const { object }: any = jwt.verify(token, `${process.env.SECRETORPRIVATEKEY}`);

    if (!object) return customResponse(false, res, 401, 'Su solicitud ha expirado', null);

    const user = await User.findByPk(object.id);

    if (user) {
      await user.update({ is_active: 1 });

      customResponse(true, res, 200, 'Usuario activado', null);
    } else {
      customResponse(false, res, 400, 'El usuario no existe', null);
    }
  } catch (error) {
    console.error('-->', error);
    return customResponse(false, res, 410, 'Su solicitud ha expirado', null);
  }
};

/**
 * Recibe un token y una contraseña, decodifica el token, encuentra al usuario, genera una nueva
 * contraseña, actualiza la contraseña del usuario y devuelve una respuesta
 * @param {Request} req - Solicitud: el objeto de la solicitud.
 * @param {Response} res - El objeto de respuesta.
 */
export const resetPassword = async (req: Request, res: Response) => {
  const { password, token } = req.body;

  try {
    const { object }: any = jwt.verify(token, `${process.env.SECRETORPRIVATEKEY}`);
    // const { object }: any = await decodeJWT(token);

    if (!object) return customResponse(false, res, 401, 'Su solicitud ha expirado', null);

    const user = await User.findOne({ where: { id: object.id } });

    if (!user) return customResponse(false, res, 400, 'Identificación y/o correo electrónico inválidos o inactivos. Por favor comuniquese con su Ejecutivo de cuenta', null);

    const passEncript = await generatePassword(password);

    await user.update({ password: passEncript });

    customResponse(true, res, 200, 'Su contraseña se restableció', null);
  } catch (error) {
    console.error('-->', error);
    return customResponse(false, res, 410, 'Su solicitud ha expirado', null);
  }
};

/**
 * Envía un correo electrónico al usuario con un enlace para restablecer su contraseña
 */
export const sendEmailResetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email: email, is_active: 1, is_deleted: 0 } });

    if (!user) {
      return customResponse(false, res, 400, 'El usuario con ese email no existe', null);
    }

    const token = await generateJWTObjectWhiteTime(user.get(), '10 minutes');

    const send = await sendEmail(
      //
      'We-u',
      [email],
      'Restablecer contraseña',
      `¿Hola, ${user.get().full_name} solicitaste restablecer tu contraseña?`,
      emailRecoverPassword(token, user.get().full_name)
    );

    customResponse(true, res, 200, 'Te enviamos un correo electronico, revisa tu bandeja de entrada', send);
  } catch (error) {
    console.error('-->', error);
    badResponse(res);
  }
};

export const sendEmailExample = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const send = await sendEmail(
      //
      'We-u',
      [email],
      'Restablecer contraseña',
      `¿Hola, Ejemplo ?`,
      emailConfirmAccount('token', 'Ejemplo')
    );

    customResponse(true, res, 200, 'We send you a email, please check your inbox', send);
  } catch (error) {
    console.error('-->', error);
    badResponse(res);
  }
};

export const generaToken = async (req: Request, res: Response) => {
  const token = await generateJWTObjectWhiteTime({ email: 'alejandro03@gmail.com' }, '1d');
  return customResponse(true, res, 200, 'token', token);
};

export const decodeToken = async (req: Request, res: Response) => {
  try {
    const { data, token } = req.body;

    if (token) {
      const { object }: any = await decodeJWT(token);

      if (!object) {
        return customResponse(false, res, 401, 'No se pudo decodificar el token', null);
      }
      return customResponse(true, res, 200, 'token decodificado', object);
    }

    customResponse(true, res, 200, 'token decodificado', data);
  } catch (error) {
    console.error('-->', error);
    badResponse(res);
  }
};
