import nodemailer from 'nodemailer';
import { EMAIL, PASSWORDEMAIL, HOSTEMAIL, PORTEMAIL } from '../config/config';

/**
 * Envía un correo electrónico utilizando las credenciales que proporciona
 * @param {string} from - La dirección de correo electrónico del remitente. Todas las direcciones de
 * correo electrónico pueden ser simplemente 'remitente@servidor.com' o con el formato 'Nombre del
 * remitente <remitente@servidor.com>', consulte aquí para obtener más detalles.
 * @param {string[]} to - La dirección de correo electrónico del destinatario.
 * @param {string} subject - El asunto del correo electrónico
 * @param {string} text - La versión de texto sin formato del correo electrónico.
 * @param {string} html - El cuerpo HTML del correo electrónico.
 * @returns Una promesa que se resuelve en un objeto con las siguientes propiedades:
 */
export const sendEmail = async (from: string, to: string[], subject: string, text: string, html: string) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: HOSTEMAIL,
      port: Number(PORTEMAIL),
      secure: true,
      auth: {
        user: EMAIL,
        pass: PASSWORDEMAIL,
      },
    });
    transporter.sendMail(
      {
        from: EMAIL,
        to,
        subject,
        text,
        html,
      },
      (error, info) => {
        if (error) {
          resolve(error);
        } else {
          resolve(info);
        }
      }
    );
  });
};
