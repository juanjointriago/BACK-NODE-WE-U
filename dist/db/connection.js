"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = require("../config/config");
const db = new sequelize_1.Sequelize(
//
config_1.DB, config_1.USERDB, config_1.PASSWORDDB, {
    host: config_1.HOSTDB,
    dialect: 'mysql',
    define: {
        timestamps: false,
    },
    logging: false,
});
exports.default = db;
//# sourceMappingURL=connection.js.map