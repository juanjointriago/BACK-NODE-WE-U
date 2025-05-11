import { DataTypes } from 'sequelize';
import db from '../db/connection';
import User from './user.model';
import Complaint from './complaint.model';
import PoliticaDivision from './PoliticaDivision.model';

const Comment = db.define('comments', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  address: { type: DataTypes.STRING },
  complaint_id: { type: DataTypes.NUMBER },
  created_at: { type: DataTypes.DATE },
  description: { type: DataTypes.STRING },
  is_deleted: { type: DataTypes.BOOLEAN },
  lat: { type: DataTypes.DOUBLE },
  lng: { type: DataTypes.DOUBLE },
  updated_at: { type: DataTypes.DATE },
  user_id: { type: DataTypes.NUMBER },
  zone_id: { type: DataTypes.NUMBER },
});

Comment.belongsTo(Complaint, { foreignKey: 'complaint_id' });
Complaint.hasMany(Comment, { foreignKey: 'complaint_id' });

Comment.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Comment, { foreignKey: 'user_id' });

Comment.belongsTo(PoliticaDivision, { as: 'zone', foreignKey: 'zone_id' });
PoliticaDivision.hasMany(Comment, { foreignKey: 'zone_id' });

export default Comment;
