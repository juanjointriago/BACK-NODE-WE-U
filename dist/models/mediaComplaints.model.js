"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const complaint_model_1 = __importDefault(require("./complaint.model"));
const MediaComplaint = connection_1.default.define('media_complaints', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    complaint_id: { type: sequelize_1.DataTypes.NUMBER },
    created_at: { type: sequelize_1.DataTypes.DATE },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN },
    updated_at: { type: sequelize_1.DataTypes.DATE },
    url: { type: sequelize_1.DataTypes.STRING },
});
MediaComplaint.belongsTo(complaint_model_1.default, { foreignKey: 'complaint_id' });
complaint_model_1.default.hasMany(MediaComplaint, { foreignKey: 'complaint_id' });
exports.default = MediaComplaint;
//# sourceMappingURL=mediaComplaints.model.js.map