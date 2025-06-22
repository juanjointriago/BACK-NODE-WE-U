"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const subzone_model_1 = __importDefault(require("./subzone.model"));
const Polygon = connection_1.default.define('polygons', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    subzone_id: { type: sequelize_1.DataTypes.INTEGER },
    lat: { type: sequelize_1.DataTypes.DOUBLE },
    lng: { type: sequelize_1.DataTypes.DOUBLE },
});
Polygon.belongsTo(subzone_model_1.default, { as: 'polygon', foreignKey: 'subzone_id' });
subzone_model_1.default.hasMany(Polygon, { foreignKey: 'subzone_id' });
exports.default = Polygon;
//# sourceMappingURL=polygon.model.js.map