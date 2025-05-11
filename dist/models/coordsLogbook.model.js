"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const logbook_model_1 = __importDefault(require("./logbook.model"));
const CoordsLogbook = connection_1.default.define('coords_logbooks', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    address: { type: sequelize_1.DataTypes.STRING },
    created_at: { type: sequelize_1.DataTypes.DATE },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN },
    lat: { type: sequelize_1.DataTypes.DOUBLE },
    lng: { type: sequelize_1.DataTypes.DOUBLE },
    logbook_id: { type: sequelize_1.DataTypes.INTEGER },
});
CoordsLogbook.belongsTo(logbook_model_1.default, { foreignKey: 'logbook_id' });
logbook_model_1.default.hasMany(CoordsLogbook, { foreignKey: 'logbook_id' });
exports.default = CoordsLogbook;
//# sourceMappingURL=coordsLogbook.model.js.map