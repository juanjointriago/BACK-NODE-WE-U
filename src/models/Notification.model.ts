import { DataTypes } from 'sequelize';
import db from '../db/connection';
import User from './user.model';

const Notification = db.define('notifications', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  body: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE },
  data: { type: DataTypes.STRING },
  is_deleted: { type: DataTypes.BOOLEAN },
  receiver_id: { type: DataTypes.INTEGER },
  sender_id: { type: DataTypes.INTEGER },
  title: { type: DataTypes.STRING },
  type: { type: DataTypes.INTEGER },
  updated_at: { type: DataTypes.DATE },
  viewed: { type: DataTypes.BOOLEAN },
});

Notification.belongsTo(User, { as: 'receiver', foreignKey: 'receiver_id' });
User.hasMany(Notification, { foreignKey: 'receiver_id' });

Notification.belongsTo(User, { as: 'sender', foreignKey: 'sender_id' });
User.hasMany(Notification, { foreignKey: 'sender_id' });

export default Notification;
