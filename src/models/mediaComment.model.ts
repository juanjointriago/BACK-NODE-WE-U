import { DataTypes } from 'sequelize';
import db from '../db/connection';
import Comment from './comments.model';

const MediaComment = db.define('media_comments', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  comment_id: { type: DataTypes.NUMBER },
  created_at: { type: DataTypes.DATE },
  is_deleted: { type: DataTypes.BOOLEAN },
  updated_at: { type: DataTypes.DATE },
  url: { type: DataTypes.STRING },
});

MediaComment.belongsTo(Comment, { foreignKey: 'comment_id' });
Comment.hasMany(MediaComment, { foreignKey: 'comment_id' });

export default MediaComment;
