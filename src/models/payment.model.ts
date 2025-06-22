import { DataTypes } from 'sequelize';
import db from '../db/connection';

const Payment = db.define('payments', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  num_order: { type: DataTypes.STRING },
  cod_transaction_payment: { type: DataTypes.STRING },
  payment_method: { type: DataTypes.INTEGER },
  subscription_id: { type: DataTypes.INTEGER },
  subtotal: { type: DataTypes.DOUBLE },
  iva: { type: DataTypes.DOUBLE },
  total: { type: DataTypes.DOUBLE },
  voucher: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE },
  detail: { type: DataTypes.STRING },
});

export default Payment;
