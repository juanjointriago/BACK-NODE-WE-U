"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const user_model_1 = __importDefault(require("./user.model"));
const PoliticaDivision_model_1 = __importDefault(require("./PoliticaDivision.model"));
const subzone_model_1 = __importDefault(require("./subzone.model"));
const HelpRequest = connection_1.default.define('help_requests', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    address: { type: sequelize_1.DataTypes.STRING },
    agent_id: { type: sequelize_1.DataTypes.INTEGER },
    cancel_user_id: { type: sequelize_1.DataTypes.INTEGER },
    created_at: { type: sequelize_1.DataTypes.DATE },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN },
    lat: { type: sequelize_1.DataTypes.DOUBLE },
    lng: { type: sequelize_1.DataTypes.DOUBLE },
    status: { type: sequelize_1.DataTypes.STRING },
    updated_at: { type: sequelize_1.DataTypes.DATE },
    user_id: { type: sequelize_1.DataTypes.INTEGER },
    zone_id: { type: sequelize_1.DataTypes.INTEGER },
    subzone_id: { type: sequelize_1.DataTypes.INTEGER },
});
HelpRequest.belongsTo(user_model_1.default, { as: 'user', foreignKey: 'user_id' });
user_model_1.default.hasMany(HelpRequest, { foreignKey: 'user_id' });
HelpRequest.belongsTo(user_model_1.default, { as: 'asc', foreignKey: 'agent_id' });
user_model_1.default.hasMany(HelpRequest, { foreignKey: 'agent_id' });
HelpRequest.belongsTo(user_model_1.default, { as: 'canceledBy', foreignKey: 'cancel_user_id' });
user_model_1.default.hasMany(HelpRequest, { foreignKey: 'cancel_user_id' });
HelpRequest.belongsTo(PoliticaDivision_model_1.default, { as: 'zone', foreignKey: 'zone_id' });
PoliticaDivision_model_1.default.hasOne(HelpRequest, { foreignKey: 'zone_id' });
HelpRequest.belongsTo(subzone_model_1.default, { as: 'subzone', foreignKey: 'subzone_id' });
subzone_model_1.default.hasOne(HelpRequest, { foreignKey: 'subzone_id' });
exports.default = HelpRequest;
//# sourceMappingURL=helpRequest.model.js.map