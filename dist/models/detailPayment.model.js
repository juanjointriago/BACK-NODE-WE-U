"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const payment_model_1 = __importDefault(require("./payment.model"));
const DetailPayment = connection_1.default.define('detail_payments', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    payment_id: { type: sequelize_1.DataTypes.NUMBER },
    units: { type: sequelize_1.DataTypes.NUMBER },
    price_unit: { type: sequelize_1.DataTypes.DOUBLE },
    subtotal: { type: sequelize_1.DataTypes.DOUBLE },
    tax: { type: sequelize_1.DataTypes.DOUBLE },
    iva: { type: sequelize_1.DataTypes.DOUBLE },
    total: { type: sequelize_1.DataTypes.DOUBLE },
    item: { type: sequelize_1.DataTypes.STRING },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN },
    is_active: { type: sequelize_1.DataTypes.BOOLEAN },
    created_at: { type: sequelize_1.DataTypes.DATE },
    updated_at: { type: sequelize_1.DataTypes.DATE },
});
DetailPayment.belongsTo(payment_model_1.default, { foreignKey: 'payment_id' });
payment_model_1.default.hasMany(DetailPayment, { foreignKey: 'payment_id' });
exports.default = DetailPayment;
//# sourceMappingURL=detailPayment.model.js.map