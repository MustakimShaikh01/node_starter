import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import { sequelize } from './config/db.js';
import './models/index.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`);
      console.log(`Server started on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server', { message: err.message, stack: err.stack });
    console.error(err);
    process.exit(1);
  }
}

start();
