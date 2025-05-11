"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const PoliticaDivision_model_1 = __importDefault(require("./PoliticaDivision.model"));
const Subzone = connection_1.default.define('subzones', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    zone_id: { type: sequelize_1.DataTypes.INTEGER },
    subs_id: { type: sequelize_1.DataTypes.INTEGER },
    name: { type: sequelize_1.DataTypes.STRING },
    state: { type: sequelize_1.DataTypes.BOOLEAN },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN },
    created_at: { type: sequelize_1.DataTypes.DATE },
    updated_at: { type: sequelize_1.DataTypes.DATE },
});
Subzone.belongsTo(PoliticaDivision_model_1.default, { as: 'zone', foreignKey: 'zone_id' });
PoliticaDivision_model_1.default.hasOne(Subzone, { foreignKey: 'zone_id' });
exports.default = Subzone;
//# sourceMappingURL=subzone.model.js.map