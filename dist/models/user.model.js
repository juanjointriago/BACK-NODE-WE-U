"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const rol_model_1 = __importDefault(require("./rol.model"));
const typeASC_model_1 = __importDefault(require("./typeASC.model"));
const PoliticaDivision_model_1 = __importDefault(require("./PoliticaDivision.model"));
const subzone_model_1 = __importDefault(require("./subzone.model"));
const User = connection_1.default.define('users', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    accessed_at: { type: sequelize_1.DataTypes.DATE },
    address: { type: sequelize_1.DataTypes.STRING },
    created_at: { type: sequelize_1.DataTypes.DATE },
    email: { type: sequelize_1.DataTypes.STRING },
    expo_token: { type: sequelize_1.DataTypes.STRING },
    full_name: { type: sequelize_1.DataTypes.STRING },
    identification: { type: sequelize_1.DataTypes.STRING },
    is_active: { type: sequelize_1.DataTypes.BOOLEAN },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN },
    lat: { type: sequelize_1.DataTypes.FLOAT, allowNull: true },
    lng: { type: sequelize_1.DataTypes.FLOAT, allowNull: true },
    online: { type: sequelize_1.DataTypes.BOOLEAN },
    is_available: { type: sequelize_1.DataTypes.BOOLEAN },
    password: { type: sequelize_1.DataTypes.STRING },
    phone: { type: sequelize_1.DataTypes.STRING },
    photo_home: { type: sequelize_1.DataTypes.STRING },
    photo_id_back: { type: sequelize_1.DataTypes.STRING },
    photo_id_front: { type: sequelize_1.DataTypes.STRING },
    photo_profile: { type: sequelize_1.DataTypes.STRING },
    role_id: { type: sequelize_1.DataTypes.INTEGER },
    type_asc_id: { type: sequelize_1.DataTypes.INTEGER },
    updated_at: { type: sequelize_1.DataTypes.DATE },
    whatsapp_group: { type: sequelize_1.DataTypes.STRING },
    zone_id: { type: sequelize_1.DataTypes.INTEGER },
    subzone_id: { type: sequelize_1.DataTypes.INTEGER },
});
User.belongsTo(rol_model_1.default, { foreignKey: 'role_id' });
rol_model_1.default.hasOne(User, { foreignKey: 'role_id' });
User.belongsTo(typeASC_model_1.default, { foreignKey: 'type_asc_id' });
typeASC_model_1.default.hasMany(User, { foreignKey: 'type_asc_id' });
User.belongsTo(PoliticaDivision_model_1.default, { as: 'zone', foreignKey: 'zone_id' });
PoliticaDivision_model_1.default.hasOne(User, { foreignKey: 'zone_id' });
User.belongsTo(subzone_model_1.default, { as: 'subzone', foreignKey: 'subzone_id' });
subzone_model_1.default.hasMany(User, { foreignKey: 'subzone_id' });
exports.default = User;
//# sourceMappingURL=user.model.js.map