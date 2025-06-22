"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const user_model_1 = __importDefault(require("./user.model"));
const PoliticaDivision_model_1 = __importDefault(require("./PoliticaDivision.model"));
const Logbook = connection_1.default.define('logbooks', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    created_at: { type: sequelize_1.DataTypes.DATE },
    date_until: { type: sequelize_1.DataTypes.DATEONLY },
    hour_until: { type: sequelize_1.DataTypes.TIME },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN },
    status: { type: sequelize_1.DataTypes.STRING },
    updated_at: { type: sequelize_1.DataTypes.DATE },
    user_id: { type: sequelize_1.DataTypes.INTEGER },
    zone_id: { type: sequelize_1.DataTypes.INTEGER },
    subzone_id: { type: sequelize_1.DataTypes.INTEGER },
});
Logbook.belongsTo(user_model_1.default, { foreignKey: 'user_id' });
user_model_1.default.hasMany(Logbook, { foreignKey: 'user_id' });
Logbook.belongsTo(PoliticaDivision_model_1.default, { as: 'zone', foreignKey: 'zone_id' });
PoliticaDivision_model_1.default.hasOne(Logbook, { foreignKey: 'zone_id' });
exports.default = Logbook;
//# sourceMappingURL=logbook.model.js.map