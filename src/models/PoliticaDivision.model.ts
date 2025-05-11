import { DataTypes } from 'sequelize';
import db from '../db/connection';

const PoliticaDivision = db.define(
  'ec_politica_division',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_parent: { type: DataTypes.INTEGER },
    name: { type: DataTypes.STRING },
    code: { type: DataTypes.STRING },
    updated_at: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE },
  },
  { freezeTableName: true }
);

PoliticaDivision.belongsTo(PoliticaDivision, { as: 'province', foreignKey: 'id_parent' });
PoliticaDivision.hasMany(PoliticaDivision, { as: 'cities', foreignKey: 'id_parent' });

export default PoliticaDivision;
