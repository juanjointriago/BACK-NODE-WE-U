import { DataTypes } from 'sequelize';
import db from '../db/connection';
import User from './user.model';
import PoliticaDivision from './PoliticaDivision.model';

const Logbook = db.define('logbooks', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  created_at: { type: DataTypes.DATE },
  date_until: { type: DataTypes.DATEONLY },
  hour_until: { type: DataTypes.TIME },
  is_deleted: { type: DataTypes.BOOLEAN },
  status: { type: DataTypes.STRING },
  updated_at: { type: DataTypes.DATE },
  user_id: { type: DataTypes.INTEGER },
  zone_id: { type: DataTypes.INTEGER },
  subzone_id: { type: DataTypes.INTEGER },
});

Logbook.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Logbook, { foreignKey: 'user_id' });

Logbook.belongsTo(PoliticaDivision, { as: 'zone', foreignKey: 'zone_id' });
PoliticaDivision.hasOne(Logbook, { foreignKey: 'zone_id' });

export default Logbook;
