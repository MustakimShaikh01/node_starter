import { logger } from '../utils/logger.js';
export function errorHandler(err, req, res, next) { // eslint-disable-line
  logger.error({ message: err.message, stack: err.stack, path: req.path });
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}
