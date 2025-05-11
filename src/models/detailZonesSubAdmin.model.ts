import { DataTypes } from 'sequelize';
import db from '../db/connection';
import User from './user.model';
import PoliticaDivision from './PoliticaDivision.model';

const DetailZonesSubAdmin = db.define('detail_subAdmin_cities', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  created_at: { type: DataTypes.DATE },
  is_active: { type: DataTypes.BOOLEAN },
  is_deleted: { type: DataTypes.BOOLEAN },
  updated_at: { type: DataTypes.DATE },
  user_id: { type: DataTypes.NUMBER },
  zone_id: { type: DataTypes.NUMBER },
});

DetailZonesSubAdmin.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(DetailZonesSubAdmin, { foreignKey: 'user_id' });

DetailZonesSubAdmin.belongsTo(PoliticaDivision, { as: 'city', foreignKey: 'zone_id' });
PoliticaDivision.hasMany(DetailZonesSubAdmin, { foreignKey: 'zone_id' });

export default DetailZonesSubAdmin;
