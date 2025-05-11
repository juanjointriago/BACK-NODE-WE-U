"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const Code = connection_1.default.define('code_users', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    code: { type: sequelize_1.DataTypes.STRING },
    user_id: { type: sequelize_1.DataTypes.NUMBER },
    created_at: { type: sequelize_1.DataTypes.DATE },
});
exports.default = Code;
//# sourceMappingURL=code.model.js.map