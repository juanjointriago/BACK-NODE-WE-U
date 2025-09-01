import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

/**
 * Toma una solicitud, una respuesta y la siguiente función como argumentos, y si hay algún error en la
 * solicitud, devuelve un código de estado 400 con los errores. De lo contrario, llama a la siguiente
 * función.
 * @param {Request} req - Solicitud - El objeto de la solicitud
 * @param {Response} res - Respuesta - el objeto de respuesta
 * @param {NextFunction} next - Esta es una función a la que llamamos cuando queremos pasar al
 * siguiente middleware.
 * @returns los errores si los hay.
 */
export const validatorField = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Errores de validación:", errors.array()); 
    return res.status(400).json(errors);
  }
  next();
  return;
};
