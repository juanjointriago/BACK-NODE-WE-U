import { DataTypes } from 'sequelize';
import db from '../db/connection';

const Role = db.define('roles', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  created_at: { type: DataTypes.DATE },
  is_deleted: { type: DataTypes.BOOLEAN },
  rol_name: { type: DataTypes.STRING },
  updated_at: { type: DataTypes.DATE },
});

export default Role;
