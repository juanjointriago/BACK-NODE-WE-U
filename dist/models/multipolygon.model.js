"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const Multipolygon = connection_1.default.define('multipolygons', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ec_politica_division_id: { type: sequelize_1.DataTypes.INTEGER },
    latitude: { type: sequelize_1.DataTypes.BOOLEAN },
    longitude: { type: sequelize_1.DataTypes.BOOLEAN },
});
exports.default = Multipolygon;
//# sourceMappingURL=multipolygon.model.js.map