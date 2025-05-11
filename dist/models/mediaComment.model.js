"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const comments_model_1 = __importDefault(require("./comments.model"));
const MediaComment = connection_1.default.define('media_comments', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    comment_id: { type: sequelize_1.DataTypes.NUMBER },
    created_at: { type: sequelize_1.DataTypes.DATE },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN },
    updated_at: { type: sequelize_1.DataTypes.DATE },
    url: { type: sequelize_1.DataTypes.STRING },
});
MediaComment.belongsTo(comments_model_1.default, { foreignKey: 'comment_id' });
comments_model_1.default.hasMany(MediaComment, { foreignKey: 'comment_id' });
exports.default = MediaComment;
//# sourceMappingURL=mediaComment.model.js.map