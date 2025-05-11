import { DataTypes } from 'sequelize';
import db from '../db/connection';
import Payment from './payment.model';

const DetailPayment = db.define('detail_payments', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  payment_id: { type: DataTypes.NUMBER },
  units: { type: DataTypes.NUMBER },
  price_unit: { type: DataTypes.DOUBLE },
  subtotal: { type: DataTypes.DOUBLE },
  tax: { type: DataTypes.DOUBLE },
  iva: { type: DataTypes.DOUBLE },
  total: { type: DataTypes.DOUBLE },
  item: { type: DataTypes.STRING },
  is_deleted: { type: DataTypes.BOOLEAN },
  is_active: { type: DataTypes.BOOLEAN },
  created_at: { type: DataTypes.DATE },
  updated_at: { type: DataTypes.DATE },
});

DetailPayment.belongsTo(Payment, { foreignKey: 'payment_id' });
Payment.hasMany(DetailPayment, { foreignKey: 'payment_id' });

export default DetailPayment;
