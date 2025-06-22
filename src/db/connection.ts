import { Sequelize } from 'sequelize';
import { USERDB, PASSWORDDB, HOSTDB, DB } from '../config/config';

const db = new Sequelize(
  //
  DB,
  USERDB,
  PASSWORDDB,
  {
    host: HOSTDB,
    dialect: 'mysql',
    define: {
      timestamps: false,
    },
    logging: false,
  }
);

export default db;
