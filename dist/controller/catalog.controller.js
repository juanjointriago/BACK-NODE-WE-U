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
exports.zonesSelected = exports.myZonesSelected = exports.getProvincesAndtheirCities = exports.getProvinceByName = exports.getProvinceByCode = exports.getTypesASC = exports.getRoles = void 0;
const rol_model_1 = __importDefault(require("../models/rol.model"));
const customResponses_1 = require("../helpers/customResponses");
const typeASC_model_1 = __importDefault(require("../models/typeASC.model"));
const PoliticaDivision_model_1 = __importDefault(require("../models/PoliticaDivision.model"));
const sequelize_1 = require("sequelize");
const detailZonesSubAdmin_model_1 = __importDefault(require("../models/detailZonesSubAdmin.model"));
const user_enum_1 = require("../enums/user.enum");
/**
 * Obtiene todos los roles de la base de datos y los devuelve en formato JSON
 * @returns Una matriz de objetos que tiene la siguiente estructura:
 * [
 *   {
 *     "identificación": 1,
 *     "role_name": "Administrador"
 *   },
 *   {
 *     "identificación": 2,
 *     "role_name": "Usuario"
 *   } }
 * ]
 */
const getRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield rol_model_1.default.findAll({
            where: { is_deleted: 0 },
            attributes: ['id', 'rol_name'],
        });
        if (roles.length === 0) {
            return (0, customResponses_1.customResponse)(false, res, 404, 'No existen roles', null);
        }
        (0, customResponses_1.customResponse)(true, res, 200, `Roles encontrados`, roles);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getRoles = getRoles;
/**
 * Obtiene todos los tipos de ASC de la base de datos y los devuelve en formato JSON.
 * @returns [
 *   {
 *     "id": 1,
 *     "asc_name": "Ascensor"
 *   },
 *   {
 *     "id": 2,
 *     "asc_name": "Escalera"
 *   },
 *   {
 *     "id": 3,
 *     "asc_name": "Escalera mecánica"
 */
const getTypesASC = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const typesASC = yield typeASC_model_1.default.findAll({
            where: { is_deleted: 0 },
            attributes: ['id', 'asc_name'],
        });
        if (typesASC.length === 0) {
            return (0, customResponses_1.customResponse)(false, res, 404, 'No existen tipos de ASC', null);
        }
        (0, customResponses_1.customResponse)(true, res, 200, `Tipos de ASC encontrados`, typesASC);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getTypesASC = getTypesASC;
const getProvinceByCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codeProvince } = req.params;
        const province = yield PoliticaDivision_model_1.default.findOne({
            where: { code: codeProvince },
            attributes: ['id', 'name', 'code'],
            include: [{ model: PoliticaDivision_model_1.default, as: 'cities', attributes: ['id', 'name', 'code'] }],
        });
        if (!province) {
            return (0, customResponses_1.customResponse)(false, res, 404, 'No existe la provincia', null);
        }
        (0, customResponses_1.customResponse)(true, res, 200, `Provincia encontrada`, province);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getProvinceByCode = getProvinceByCode;
const getProvinceByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.params;
        const province = yield PoliticaDivision_model_1.default.findOne({
            where: { name: name.toUpperCase() },
            attributes: ['id', 'name', 'code'],
            include: [{ model: PoliticaDivision_model_1.default, as: 'cities', attributes: ['id', 'name', 'code'] }],
        });
        if (!province) {
            return (0, customResponses_1.customResponse)(false, res, 404, 'No existe la provincia', null);
        }
        (0, customResponses_1.customResponse)(true, res, 200, `Provincia encontrada`, province);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getProvinceByName = getProvinceByName;
const getProvincesAndtheirCities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const province = yield PoliticaDivision_model_1.default.findAll({
            where: { id_parent: null, id: { [sequelize_1.Op.ne]: 25 } },
            attributes: ['id', 'name', 'code'],
            include: [{ model: PoliticaDivision_model_1.default, as: 'cities', attributes: ['id', 'name', 'code'] }],
        });
        if (!province) {
            return (0, customResponses_1.customResponse)(false, res, 404, 'No existe la provincia', null);
        }
        (0, customResponses_1.customResponse)(true, res, 200, `Provincia encontrada`, province);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getProvincesAndtheirCities = getProvincesAndtheirCities;
const myZonesSelected = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        if (data.role_id !== user_enum_1.UserRoles.Superadmin && data.role_id !== user_enum_1.UserRoles.SubAdmin && data.role_id !== user_enum_1.UserRoles.Subscriber)
            return (0, customResponses_1.customResponse)(false, res, 404, 'No tiene autorización para esta petición', null);
        const cities = data.role_id === user_enum_1.UserRoles.Superadmin
            ? yield detailZonesSubAdmin_model_1.default.findAll({
                where: { is_deleted: 0 },
                attributes: ['id'],
                include: [
                    {
                        model: PoliticaDivision_model_1.default,
                        as: 'city',
                        attributes: ['id', 'name', 'code'],
                        include: [
                            {
                                model: PoliticaDivision_model_1.default,
                                as: 'province',
                                attributes: ['id', 'name', 'code'],
                            },
                        ],
                    },
                ],
            })
            : yield detailZonesSubAdmin_model_1.default.findAll({
                where: { user_id: data.id, is_deleted: 0 },
                attributes: ['id', 'is_active'],
                include: [
                    {
                        model: PoliticaDivision_model_1.default,
                        as: 'city',
                        attributes: ['id', 'name', 'code'],
                        include: [
                            {
                                model: PoliticaDivision_model_1.default,
                                as: 'province',
                                attributes: ['id', 'name', 'code'],
                            },
                        ],
                    },
                ],
            });
        if (cities.length === 0) {
            return (0, customResponses_1.customResponse)(false, res, 404, 'No tiene cantones seleccionados o aprobados para administrar', null);
        }
        return (0, customResponses_1.customResponse)(true, res, 200, `Provincia encontrada`, cities);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.myZonesSelected = myZonesSelected;
const zonesSelected = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        if (data.role_id !== 2)
            return (0, customResponses_1.customResponse)(false, res, 404, 'No tiene autorización para esta petición', null);
        const cities = yield detailZonesSubAdmin_model_1.default.findAll({
            where: { is_deleted: 0 },
            attributes: ['id'],
            include: [
                {
                    model: PoliticaDivision_model_1.default,
                    as: 'city',
                    attributes: ['id', 'name', 'code'],
                    include: [
                        {
                            as: 'province',
                            model: PoliticaDivision_model_1.default,
                            attributes: ['id', 'name', 'code'],
                        },
                    ],
                },
            ],
        });
        if (cities.length === 0) {
            return (0, customResponses_1.customResponse)(false, res, 404, 'No tiene cantones seleccionados o aprobados para administrar', null);
        }
        return (0, customResponses_1.customResponse)(true, res, 200, `Ciudades encontradas`, cities);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.zonesSelected = zonesSelected;
//# sourceMappingURL=catalog.controller.js.map