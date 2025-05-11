import { DataTypes } from 'sequelize';
import db from '../db/connection';
import Subzone from './subzone.model';

const Polygon = db.define('polygons', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  subzone_id: { type: DataTypes.INTEGER },
  lat: { type: DataTypes.DOUBLE },
  lng: { type: DataTypes.DOUBLE },
});

Polygon.belongsTo(Subzone, { as: 'polygon', foreignKey: 'subzone_id' });
Subzone.hasMany(Polygon, { foreignKey: 'subzone_id' });

export default Polygon;
