import { DataTypes } from 'sequelize';
import db from '../db/connection';
import Subscription from './subscription.model';

const PurchasedProduct = db.define('purchased_products', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  subscription_id: { type: DataTypes.NUMBER },
  units: { type: DataTypes.NUMBER },
  price_unit: { type: DataTypes.DOUBLE },
  subtotal: { type: DataTypes.DOUBLE },
  tax: { type: DataTypes.DOUBLE },
  iva: { type: DataTypes.DOUBLE },
  total: { type: DataTypes.DOUBLE },
  product: { type: DataTypes.STRING },
  is_deleted: { type: DataTypes.BOOLEAN },
  is_active: { type: DataTypes.BOOLEAN },
  is_integraded_subscription: { type: DataTypes.BOOLEAN },
  created_at: { type: DataTypes.DATE },
  updated_at: { type: DataTypes.DATE },
});

PurchasedProduct.belongsTo(Subscription, { foreignKey: 'subscription_id' });
Subscription.hasMany(PurchasedProduct, { foreignKey: 'subscription_id' });

export default PurchasedProduct;
