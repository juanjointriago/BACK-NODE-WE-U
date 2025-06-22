import { Response } from 'express';

/**
 * Toma un objeto de respuesta y devuelve una función que toma un mensaje y envía un código de estado
 * 500 con un objeto JSON que contiene el mensaje.
 * @param {Response} res - Respuesta: Este es el objeto de respuesta que obtenemos del servidor
 * express.
 */
export const badResponse = (res: Response) => {
  res.status(500).json({
    ok: false,
    msg: `Ha ocurrido un error vuelva a intentarlo`,
  });
};

/**
 * @param {boolean} ok - booleano: este es un valor booleano que indica si la solicitud fue exitosa o
 * no.
 * @param {Response} res - Respuesta: este es el objeto de respuesta que obtenemos del servidor
 * express.
 * @param {number} status - El código de estado HTTP.
 * @param {string} msg - El mensaje que desea devolver al cliente.
 * @param {any} data - Los datos que desea devolver al cliente.
 */
export const customResponse = (ok: boolean, res: Response, status: number, msg: string, data: any) => {
  res.status(status).json({
    ok,
    msg,
    data,
  });
};
