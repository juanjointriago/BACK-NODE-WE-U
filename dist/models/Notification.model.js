"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const user_model_1 = __importDefault(require("./user.model"));
const Notification = connection_1.default.define('notifications', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    body: { type: sequelize_1.DataTypes.STRING },
    created_at: { type: sequelize_1.DataTypes.DATE },
    data: { type: sequelize_1.DataTypes.STRING },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN },
    receiver_id: { type: sequelize_1.DataTypes.INTEGER },
    sender_id: { type: sequelize_1.DataTypes.INTEGER },
    title: { type: sequelize_1.DataTypes.STRING },
    type: { type: sequelize_1.DataTypes.INTEGER },
    updated_at: { type: sequelize_1.DataTypes.DATE },
    viewed: { type: sequelize_1.DataTypes.BOOLEAN },
});
Notification.belongsTo(user_model_1.default, { as: 'receiver', foreignKey: 'receiver_id' });
user_model_1.default.hasMany(Notification, { foreignKey: 'receiver_id' });
Notification.belongsTo(user_model_1.default, { as: 'sender', foreignKey: 'sender_id' });
user_model_1.default.hasMany(Notification, { foreignKey: 'sender_id' });
exports.default = Notification;
//# sourceMappingURL=Notification.model.js.map