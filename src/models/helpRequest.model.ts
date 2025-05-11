import { DataTypes } from 'sequelize';
import db from '../db/connection';
import User from './user.model';
import PoliticaDivision from './PoliticaDivision.model';
import Subzone from './subzone.model';

const HelpRequest = db.define('help_requests', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  address: { type: DataTypes.STRING },
  agent_id: { type: DataTypes.INTEGER },
  cancel_user_id: { type: DataTypes.INTEGER },
  created_at: { type: DataTypes.DATE },
  is_deleted: { type: DataTypes.BOOLEAN },
  lat: { type: DataTypes.DOUBLE },
  lng: { type: DataTypes.DOUBLE },
  status: { type: DataTypes.STRING },
  updated_at: { type: DataTypes.DATE },
  user_id: { type: DataTypes.INTEGER },
  zone_id: { type: DataTypes.INTEGER },
  subzone_id: { type: DataTypes.INTEGER },
});

HelpRequest.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
User.hasMany(HelpRequest, { foreignKey: 'user_id' });

HelpRequest.belongsTo(User, { as: 'asc', foreignKey: 'agent_id' });
User.hasMany(HelpRequest, { foreignKey: 'agent_id' });

HelpRequest.belongsTo(User, { as: 'canceledBy', foreignKey: 'cancel_user_id' });
User.hasMany(HelpRequest, { foreignKey: 'cancel_user_id' });

HelpRequest.belongsTo(PoliticaDivision, { as: 'zone', foreignKey: 'zone_id' });
PoliticaDivision.hasOne(HelpRequest, { foreignKey: 'zone_id' });

HelpRequest.belongsTo(Subzone, { as: 'subzone', foreignKey: 'subzone_id' });
Subzone.hasOne(HelpRequest, { foreignKey: 'subzone_id' });

export default HelpRequest;
