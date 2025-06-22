import { DataTypes } from 'sequelize';
import db from '../db/connection';
import CoordsLogbook from './coordsLogbook.model';

const MediaCoordsLogbook = db.define('media_coords_logbooks', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  coord_logbook_id: { type: DataTypes.NUMBER },
  created_at: { type: DataTypes.DATE },
  is_deleted: { type: DataTypes.BOOLEAN },
  url: { type: DataTypes.STRING },
});

MediaCoordsLogbook.belongsTo(CoordsLogbook, { foreignKey: 'coord_logbook_id' });
CoordsLogbook.hasMany(MediaCoordsLogbook, { as: 'photos', foreignKey: 'coord_logbook_id' });

export default MediaCoordsLogbook;
