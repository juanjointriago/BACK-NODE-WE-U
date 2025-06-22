import { NextFunction, Request, Response } from 'express';
import { NODE_ENV } from '../config/config';

/**
 * Middleware function to handle errors.
 *
 * @param {Error} error - The error object to be handled.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Determine the status code based on the response status code
  const statusCode = res.statusCode < 400 ? 400 : res.statusCode || 500;

  // Create the response payload
  const response = {
    ok: false,
    msg: error.message,
    stack: NODE_ENV === 'dev' ? error.stack : undefined,
  };

  // Set the response status code and send the response
  res.status(statusCode).json(response);
};
