"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const PoliticaDivision_model_1 = __importDefault(require("./PoliticaDivision.model"));
const user_model_1 = __importDefault(require("./user.model"));
const subzone_model_1 = __importDefault(require("./subzone.model"));
const Complaint = connection_1.default.define('complaints', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    address: { type: sequelize_1.DataTypes.STRING },
    agent_id: { type: sequelize_1.DataTypes.NUMBER },
    cancel_user_id: { type: sequelize_1.DataTypes.NUMBER },
    created_at: { type: sequelize_1.DataTypes.DATE },
    description: { type: sequelize_1.DataTypes.STRING },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN },
    lat: { type: sequelize_1.DataTypes.DOUBLE },
    lng: { type: sequelize_1.DataTypes.DOUBLE },
    status: { type: sequelize_1.DataTypes.STRING },
    title: { type: sequelize_1.DataTypes.STRING },
    updated_at: { type: sequelize_1.DataTypes.DATE },
    user_id: { type: sequelize_1.DataTypes.NUMBER },
    zone_id: { type: sequelize_1.DataTypes.NUMBER },
    subzone_id: { type: sequelize_1.DataTypes.NUMBER },
});
Complaint.belongsTo(user_model_1.default, { as: 'asc', foreignKey: 'agent_id' });
user_model_1.default.hasMany(Complaint, { foreignKey: 'agent_id' });
Complaint.belongsTo(user_model_1.default, { as: 'user', foreignKey: 'user_id' });
user_model_1.default.hasMany(Complaint, { foreignKey: 'user_id' });
Complaint.belongsTo(user_model_1.default, { as: 'canceledBy', foreignKey: 'cancel_user_id' });
user_model_1.default.hasMany(Complaint, { foreignKey: 'cancel_user_id' });
Complaint.belongsTo(PoliticaDivision_model_1.default, { as: 'zone', foreignKey: 'zone_id' });
PoliticaDivision_model_1.default.hasOne(Complaint, { foreignKey: 'zone_id' });
Complaint.belongsTo(subzone_model_1.default, { as: 'subzone', foreignKey: 'subzone_id' });
subzone_model_1.default.hasOne(Complaint, { foreignKey: 'subzone_id' });
exports.default = Complaint;
//# sourceMappingURL=complaint.model.js.map