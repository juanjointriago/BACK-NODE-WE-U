import { DataTypes } from 'sequelize';
import db from '../db/connection';

const AscSubscriber = db.define('asc_subscribers', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  subscriber_id: { type: DataTypes.NUMBER },
  asc_id: { type: DataTypes.NUMBER },
  subzone_id: { type: DataTypes.NUMBER },
});

export default AscSubscriber;
