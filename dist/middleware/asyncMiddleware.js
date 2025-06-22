"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncMiddleware = void 0;
/**
 * Wraps an async middleware function to handle any uncaught errors and pass them to the next middleware.
 *
 * @param {function} callback - The async middleware function to be wrapped.
 * @return {function} - The wrapped middleware function.
 */
const asyncMiddleware = (callback) => (req, res, next) => callback(req, res, next).catch(next);
exports.asyncMiddleware = asyncMiddleware;
//# sourceMappingURL=asyncMiddleware.js.map