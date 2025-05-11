import { DataTypes } from 'sequelize';
import db from '../db/connection';

const Multipolygon = db.define('multipolygons', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ec_politica_division_id: { type: DataTypes.INTEGER },
  latitude: { type: DataTypes.BOOLEAN },
  longitude: { type: DataTypes.BOOLEAN },
});

export default Multipolygon;
