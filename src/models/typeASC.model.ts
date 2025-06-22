import { DataTypes } from 'sequelize';
import db from '../db/connection';

const TypeASC = db.define(
  'types_asc',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    asc_name: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE },
    is_deleted: { type: DataTypes.BOOLEAN },
    updated_at: { type: DataTypes.DATE },
  },
  { freezeTableName: true }
);

export default TypeASC;
