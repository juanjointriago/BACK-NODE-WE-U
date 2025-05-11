"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const user_model_1 = __importDefault(require("./user.model"));
const Subscription = connection_1.default.define('subscriptions', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    num_asc: { type: sequelize_1.DataTypes.INTEGER },
    num_subzones: { type: sequelize_1.DataTypes.INTEGER },
    user_id: { type: sequelize_1.DataTypes.INTEGER },
    payment_method: { type: sequelize_1.DataTypes.INTEGER },
    total: { type: sequelize_1.DataTypes.DOUBLE },
    code_sub: { type: sequelize_1.DataTypes.STRING },
    photo_ticket: { type: sequelize_1.DataTypes.STRING },
    date_subscription: { type: sequelize_1.DataTypes.DATEONLY },
    date_expiration: { type: sequelize_1.DataTypes.DATEONLY },
    state: { type: sequelize_1.DataTypes.BOOLEAN },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN },
    updated_at: { type: sequelize_1.DataTypes.DATE },
});
Subscription.belongsTo(user_model_1.default, { as: 'subscription', foreignKey: 'user_id' });
user_model_1.default.hasOne(Subscription, { foreignKey: 'user_id' });
exports.default = Subscription;
//# sourceMappingURL=subscription.model.js.map