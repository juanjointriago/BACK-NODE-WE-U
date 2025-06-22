"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const coordsLogbook_model_1 = __importDefault(require("./coordsLogbook.model"));
const MediaCoordsLogbook = connection_1.default.define('media_coords_logbooks', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    coord_logbook_id: { type: sequelize_1.DataTypes.NUMBER },
    created_at: { type: sequelize_1.DataTypes.DATE },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN },
    url: { type: sequelize_1.DataTypes.STRING },
});
MediaCoordsLogbook.belongsTo(coordsLogbook_model_1.default, { foreignKey: 'coord_logbook_id' });
coordsLogbook_model_1.default.hasMany(MediaCoordsLogbook, { as: 'photos', foreignKey: 'coord_logbook_id' });
exports.default = MediaCoordsLogbook;
//# sourceMappingURL=mediaCoordsLogbook.model.js.map