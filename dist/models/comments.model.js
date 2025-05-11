"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const user_model_1 = __importDefault(require("./user.model"));
const complaint_model_1 = __importDefault(require("./complaint.model"));
const PoliticaDivision_model_1 = __importDefault(require("./PoliticaDivision.model"));
const Comment = connection_1.default.define('comments', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    address: { type: sequelize_1.DataTypes.STRING },
    complaint_id: { type: sequelize_1.DataTypes.NUMBER },
    created_at: { type: sequelize_1.DataTypes.DATE },
    description: { type: sequelize_1.DataTypes.STRING },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN },
    lat: { type: sequelize_1.DataTypes.DOUBLE },
    lng: { type: sequelize_1.DataTypes.DOUBLE },
    updated_at: { type: sequelize_1.DataTypes.DATE },
    user_id: { type: sequelize_1.DataTypes.NUMBER },
    zone_id: { type: sequelize_1.DataTypes.NUMBER },
});
Comment.belongsTo(complaint_model_1.default, { foreignKey: 'complaint_id' });
complaint_model_1.default.hasMany(Comment, { foreignKey: 'complaint_id' });
Comment.belongsTo(user_model_1.default, { foreignKey: 'user_id' });
user_model_1.default.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(PoliticaDivision_model_1.default, { as: 'zone', foreignKey: 'zone_id' });
PoliticaDivision_model_1.default.hasMany(Comment, { foreignKey: 'zone_id' });
exports.default = Comment;
//# sourceMappingURL=comments.model.js.map