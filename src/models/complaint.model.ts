import { DataTypes } from 'sequelize';
import db from '../db/connection';
import PoliticaDivision from './PoliticaDivision.model';
import User from './user.model';
import Subzone from './subzone.model';

const Complaint = db.define('complaints', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  address: { type: DataTypes.STRING },
  agent_id: { type: DataTypes.NUMBER },
  cancel_user_id: { type: DataTypes.NUMBER },
  created_at: { type: DataTypes.DATE },
  description: { type: DataTypes.STRING },
  is_deleted: { type: DataTypes.BOOLEAN },
  lat: { type: DataTypes.DOUBLE },
  lng: { type: DataTypes.DOUBLE },
  status: { type: DataTypes.STRING },
  title: { type: DataTypes.STRING },
  updated_at: { type: DataTypes.DATE },
  user_id: { type: DataTypes.NUMBER },
  zone_id: { type: DataTypes.NUMBER },
  subzone_id: { type: DataTypes.NUMBER },
});

Complaint.belongsTo(User, { as: 'asc', foreignKey: 'agent_id' });
User.hasMany(Complaint, { foreignKey: 'agent_id' });

Complaint.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
User.hasMany(Complaint, { foreignKey: 'user_id' });

Complaint.belongsTo(User, { as: 'canceledBy', foreignKey: 'cancel_user_id' });
User.hasMany(Complaint, { foreignKey: 'cancel_user_id' });

Complaint.belongsTo(PoliticaDivision, { as: 'zone', foreignKey: 'zone_id' });
PoliticaDivision.hasOne(Complaint, { foreignKey: 'zone_id' });

Complaint.belongsTo(Subzone, { as: 'subzone', foreignKey: 'subzone_id' });
Subzone.hasOne(Complaint, { foreignKey: 'subzone_id' });

export default Complaint;
