import { DataTypes } from 'sequelize';
import db from '../db/connection';
import Complaint from './complaint.model';

const MediaComplaint = db.define('media_complaints', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  complaint_id: { type: DataTypes.NUMBER },
  created_at: { type: DataTypes.DATE },
  is_deleted: { type: DataTypes.BOOLEAN },
  updated_at: { type: DataTypes.DATE },
  url: { type: DataTypes.STRING },
});

MediaComplaint.belongsTo(Complaint, { foreignKey: 'complaint_id' });
Complaint.hasMany(MediaComplaint, { foreignKey: 'complaint_id' });

export default MediaComplaint;
