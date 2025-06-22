"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const PoliticaDivision = connection_1.default.define('ec_politica_division', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_parent: { type: sequelize_1.DataTypes.INTEGER },
    name: { type: sequelize_1.DataTypes.STRING },
    code: { type: sequelize_1.DataTypes.STRING },
    updated_at: { type: sequelize_1.DataTypes.DATE },
    created_at: { type: sequelize_1.DataTypes.DATE },
}, { freezeTableName: true });
PoliticaDivision.belongsTo(PoliticaDivision, { as: 'province', foreignKey: 'id_parent' });
PoliticaDivision.hasMany(PoliticaDivision, { as: 'cities', foreignKey: 'id_parent' });
exports.default = PoliticaDivision;
//# sourceMappingURL=PoliticaDivision.model.js.map