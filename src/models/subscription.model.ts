import { DataTypes } from 'sequelize';
import db from '../db/connection';
import User from './user.model';

const Subscription = db.define('subscriptions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  num_asc: { type: DataTypes.INTEGER },
  num_subzones: { type: DataTypes.INTEGER },
  user_id: { type: DataTypes.INTEGER },
  payment_method: { type: DataTypes.INTEGER },
  total: { type: DataTypes.DOUBLE },
  code_sub: { type: DataTypes.STRING },
  photo_ticket: { type: DataTypes.STRING },
  date_subscription: { type: DataTypes.DATEONLY },
  date_expiration: { type: DataTypes.DATEONLY },
  state: { type: DataTypes.BOOLEAN },
  is_deleted: { type: DataTypes.BOOLEAN },
  updated_at: { type: DataTypes.DATE },
});

Subscription.belongsTo(User, { as: 'subscription', foreignKey: 'user_id' });
User.hasOne(Subscription, { foreignKey: 'user_id' });

export default Subscription;
