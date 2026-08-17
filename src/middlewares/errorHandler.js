import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err.message);

  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  const body = {
    success: false,
    error: message,
  };
  if (err.details && typeof err.details === 'object') {
    Object.assign(body, err.details);
  }

  return res.status(status).json(body);
};
