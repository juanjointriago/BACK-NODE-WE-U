"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const TypeASC = connection_1.default.define('types_asc', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    asc_name: { type: sequelize_1.DataTypes.STRING },
    created_at: { type: sequelize_1.DataTypes.DATE },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN },
    updated_at: { type: sequelize_1.DataTypes.DATE },
}, { freezeTableName: true });
exports.default = TypeASC;
//# sourceMappingURL=typeASC.model.js.map