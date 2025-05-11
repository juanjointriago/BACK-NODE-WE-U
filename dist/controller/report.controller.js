"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberUsersZoneByIdProvince = void 0;
const customResponses_1 = require("../helpers/customResponses");
const user_enum_1 = require("../enums/user.enum");
const user_model_1 = __importDefault(require("../models/user.model"));
const PoliticaDivision_model_1 = __importDefault(require("../models/PoliticaDivision.model"));
const numberUsersZoneByIdProvince = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, is_active, idProvince } = req.body;
    if (data.role_id !== user_enum_1.UserRoles.Superadmin)
        return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
    const zones = yield PoliticaDivision_model_1.default.findAll({
        where: {
            id_parent: idProvince,
        },
        attributes: ['id', 'name', 'code'],
    });
    if (zones.length === 0)
        return (0, customResponses_1.customResponse)(false, res, 404, `La provincia ${idProvince} no tiene cantones`, null);
    for (const zone of zones) {
        const users = yield user_model_1.default.findAll({
            attributes: ['id', 'full_name', 'lat', 'lng', 'address'],
            where: {
                zone_id: zone.get().id,
                is_deleted: 0,
                role_id: user_enum_1.UserRoles.ASC,
                is_active: is_active,
            },
        });
        zone.get().count = users.length;
        zone.get().users = users;
    }
    (0, customResponses_1.customResponse)(true, res, 200, 'Reporte de numero de usuario por canton descriminando por provincia', zones);
});
exports.numberUsersZoneByIdProvince = numberUsersZoneByIdProvince;
//# sourceMappingURL=report.controller.js.map