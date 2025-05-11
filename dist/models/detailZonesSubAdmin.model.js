"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const user_model_1 = __importDefault(require("./user.model"));
const PoliticaDivision_model_1 = __importDefault(require("./PoliticaDivision.model"));
const DetailZonesSubAdmin = connection_1.default.define('detail_subAdmin_cities', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    created_at: { type: sequelize_1.DataTypes.DATE },
    is_active: { type: sequelize_1.DataTypes.BOOLEAN },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN },
    updated_at: { type: sequelize_1.DataTypes.DATE },
    user_id: { type: sequelize_1.DataTypes.NUMBER },
    zone_id: { type: sequelize_1.DataTypes.NUMBER },
});
DetailZonesSubAdmin.belongsTo(user_model_1.default, { foreignKey: 'user_id' });
user_model_1.default.hasMany(DetailZonesSubAdmin, { foreignKey: 'user_id' });
DetailZonesSubAdmin.belongsTo(PoliticaDivision_model_1.default, { as: 'city', foreignKey: 'zone_id' });
PoliticaDivision_model_1.default.hasMany(DetailZonesSubAdmin, { foreignKey: 'zone_id' });
exports.default = DetailZonesSubAdmin;
//# sourceMappingURL=detailZonesSubAdmin.model.js.map