import { DataTypes } from 'sequelize';
import db from '../db/connection';
import Logbook from './logbook.model';

const CoordsLogbook = db.define('coords_logbooks', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  address: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE },
  is_deleted: { type: DataTypes.BOOLEAN },
  lat: { type: DataTypes.DOUBLE },
  lng: { type: DataTypes.DOUBLE },
  logbook_id: { type: DataTypes.INTEGER },
});

CoordsLogbook.belongsTo(Logbook, { foreignKey: 'logbook_id' });
Logbook.hasMany(CoordsLogbook, { foreignKey: 'logbook_id' });

export default CoordsLogbook;
