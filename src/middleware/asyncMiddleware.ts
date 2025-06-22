import { NextFunction, Request, Response } from 'express';

/**
 * Wraps an async middleware function to handle any uncaught errors and pass them to the next middleware.
 *
 * @param {function} callback - The async middleware function to be wrapped.
 * @return {function} - The wrapped middleware function.
 */
export const asyncMiddleware = (callback: any) => (req: Request, res: Response, next: NextFunction) => callback(req, res, next).catch(next);
