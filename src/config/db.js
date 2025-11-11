import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const usePostgres = !!process.env.DATABASE_URL;
const storage = process.env.DATABASE_STORAGE || './database.sqlite';

const common = { logging: process.env.NODE_ENV === 'development' ? console.log : false };

export const sequelize = usePostgres
  ? new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', ...common })
  : new Sequelize({ dialect: 'sqlite', storage, ...common });
