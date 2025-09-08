import { DataTypes } from 'sequelize';
import db from '../db/connection';
import Role from './rol.model';
import TypeASC from './typeASC.model';
import PoliticaDivision from './PoliticaDivision.model';
import Subzone from './subzone.model';

const User = db.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  accessed_at: { type: DataTypes.DATE },
  address: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE },
  email: { type: DataTypes.STRING },
  expo_token: { type: DataTypes.STRING },
  full_name: { type: DataTypes.STRING },
  identification: { type: DataTypes.STRING },
  is_active: { type: DataTypes.BOOLEAN },
  is_deleted: { type: DataTypes.BOOLEAN },
  lat: { type: DataTypes.FLOAT, allowNull: true },
  lng: { type: DataTypes.FLOAT, allowNull: true },
  online: { type: DataTypes.BOOLEAN },
  is_available: { type: DataTypes.BOOLEAN },
  password: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  photo_home: { type: DataTypes.STRING },
  photo_id_back: { type: DataTypes.STRING },
  photo_id_front: { type: DataTypes.STRING },
  photo_profile: { type: DataTypes.STRING },
  role_id: { type: DataTypes.INTEGER },
  type_asc_id: { type: DataTypes.INTEGER },
  updated_at: { type: DataTypes.DATE },
  whatsapp_group: { type: DataTypes.STRING },
  zone_id: { type: DataTypes.INTEGER },
  subzone_id: { type: DataTypes.INTEGER },
  avatar: { type: DataTypes.STRING },
  avatar_params: { type: DataTypes.STRING}
});

User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasOne(User, { foreignKey: 'role_id' });

User.belongsTo(TypeASC, { foreignKey: 'type_asc_id' });
TypeASC.hasMany(User, { foreignKey: 'type_asc_id' });

User.belongsTo(PoliticaDivision, { as: 'zone', foreignKey: 'zone_id' });
PoliticaDivision.hasOne(User, { foreignKey: 'zone_id' });

User.belongsTo(Subzone, { as: 'subzone', foreignKey: 'subzone_id' });
Subzone.hasMany(User, { foreignKey: 'subzone_id' });

export default User;
