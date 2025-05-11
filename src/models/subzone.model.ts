import { DataTypes } from 'sequelize';
import db from '../db/connection';
import PoliticaDivision from './PoliticaDivision.model';

const Subzone = db.define('subzones', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  zone_id: { type: DataTypes.INTEGER },
  subs_id: { type: DataTypes.INTEGER },
  name: { type: DataTypes.STRING },
  state: { type: DataTypes.BOOLEAN },
  is_deleted: { type: DataTypes.BOOLEAN },
  created_at: { type: DataTypes.DATE },
  updated_at: { type: DataTypes.DATE },
});

Subzone.belongsTo(PoliticaDivision, { as: 'zone', foreignKey: 'zone_id' });
PoliticaDivision.hasOne(Subzone, { foreignKey: 'zone_id' });

export default Subzone;
