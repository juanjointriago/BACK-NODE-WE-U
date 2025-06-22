"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const Payment = connection_1.default.define('payments', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    num_order: { type: sequelize_1.DataTypes.STRING },
    cod_transaction_payment: { type: sequelize_1.DataTypes.STRING },
    payment_method: { type: sequelize_1.DataTypes.INTEGER },
    subscription_id: { type: sequelize_1.DataTypes.INTEGER },
    subtotal: { type: sequelize_1.DataTypes.DOUBLE },
    iva: { type: sequelize_1.DataTypes.DOUBLE },
    total: { type: sequelize_1.DataTypes.DOUBLE },
    voucher: { type: sequelize_1.DataTypes.STRING },
    created_at: { type: sequelize_1.DataTypes.DATE },
    detail: { type: sequelize_1.DataTypes.STRING },
});
exports.default = Payment;
//# sourceMappingURL=payment.model.js.map