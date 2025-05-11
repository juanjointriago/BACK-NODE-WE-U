import { DataTypes } from 'sequelize';
import db from '../db/connection';

const Code = db.define('code_users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: { type: DataTypes.STRING },
  user_id: { type: DataTypes.NUMBER },
  created_at: { type: DataTypes.DATE },
});

export default Code;
