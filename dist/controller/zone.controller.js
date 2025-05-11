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
exports.updateSubzone = exports.getSubzoneByPoint = exports.getPolygonBySubzone = exports.getMultipolygonsByIdZone = exports.getSubZonesPolygonByIdZone = exports.getSubZonesByIdZone = exports.getMySubZone = exports.getZonesByAdmin = exports.getAdminSubZone = exports.getSubAdmin = exports.updateZonesSelected = exports.addZonesToSubAdmin = void 0;
const customResponses_1 = require("../helpers/customResponses");
const PoliticaDivision_model_1 = __importDefault(require("../models/PoliticaDivision.model"));
const detailZonesSubAdmin_model_1 = __importDefault(require("../models/detailZonesSubAdmin.model"));
const findCity_1 = require("../helpers/findCity");
const subzone_model_1 = __importDefault(require("../models/subzone.model"));
const polygon_model_1 = __importDefault(require("../models/polygon.model"));
const user_enum_1 = require("../enums/user.enum");
const subscription_model_1 = __importDefault(require("../models/subscription.model"));
const multipolygon_model_1 = __importDefault(require("../models/multipolygon.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const geoLibMethods_1 = require("../helpers/geoLibMethods");
const addZonesToSubAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, zones } = req.body;
        if (data.role_id !== 2)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        // const valid = await validDetailsSubadmin(zones);
        yield Promise.all(zones.map((zone) => __awaiter(void 0, void 0, void 0, function* () {
            const codes = yield (0, findCity_1.findCities)(zone);
            codes.map((code) => __awaiter(void 0, void 0, void 0, function* () {
                const detail = yield detailZonesSubAdmin_model_1.default.findOne({
                    where: { zone_id: code.id },
                    attributes: ['id'],
                });
                if (!detail) {
                    yield detailZonesSubAdmin_model_1.default.create({ user_id: data.id, zone_id: code.id });
                }
            }));
        })));
        return (0, customResponses_1.customResponse)(true, res, 200, 'Zonas guardadas para admministrar', null);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.addZonesToSubAdmin = addZonesToSubAdmin;
const updateZonesSelected = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, zoneSelectedId, is_active } = req.body;
        if (data.role_id !== 1)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        // const valid = await validDetailsSubadmin(zones);
        const zoneSelected = yield detailZonesSubAdmin_model_1.default.findOne({
            where: {
                id: zoneSelectedId,
            },
        });
        if (!zoneSelected)
            return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
        yield zoneSelected.update({ is_active });
        return (0, customResponses_1.customResponse)(true, res, 200, 'Zona actualizada', null);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.updateZonesSelected = updateZonesSelected;
const validDetailsSubadmin = (zones) => __awaiter(void 0, void 0, void 0, function* () {
    const [city] = yield Promise.all(zones.map((zone) => __awaiter(void 0, void 0, void 0, function* () {
        const codes = yield (0, findCity_1.findCities)(zone);
        const cityExist = codes.map((code) => __awaiter(void 0, void 0, void 0, function* () {
            const detailExist = yield detailZonesSubAdmin_model_1.default.findOne({
                where: { zone_id: code.id },
                attributes: ['id'],
                include: [
                    {
                        model: PoliticaDivision_model_1.default,
                        attributes: ['name'],
                        as: 'city',
                    },
                ],
            });
            if (detailExist) {
                return detailExist.toJSON();
            }
        }));
        console.log('valid--->', cityExist);
        return cityExist;
    })));
    return city;
});
const getSubAdmin = (idCity) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subAdmin = yield detailZonesSubAdmin_model_1.default.findOne({
            where: {
                zone_id: idCity,
                is_active: 1,
                is_deleted: 0,
            },
            attributes: ['user_id'],
        });
        if (!subAdmin)
            return null;
        return subAdmin.get().user_id;
    }
    catch (error) {
        return null;
    }
});
exports.getSubAdmin = getSubAdmin;
const getAdminSubZone = (subzone_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subAdmin = yield user_model_1.default.findOne({
            where: {
                subzone_id,
                role_id: user_enum_1.UserRoles.Subscriber,
                is_active: 1,
                is_deleted: 0,
            },
            attributes: ['id'],
        });
        if (!subAdmin)
            return null;
        return subAdmin.get().id;
    }
    catch (error) {
        return null;
    }
});
exports.getAdminSubZone = getAdminSubZone;
const getZonesByAdmin = (idAdmin) => __awaiter(void 0, void 0, void 0, function* () {
    const detailAdminZones = yield detailZonesSubAdmin_model_1.default.findAll({
        where: { user_id: idAdmin },
        attributes: ['zone_id'],
    });
    return [...detailAdminZones.map((zone) => zone.get().zone_id)];
});
exports.getZonesByAdmin = getZonesByAdmin;
/**
 * Retrieves the subzone associated with the authenticated user.
 *
 * @param req - The request object.
 * @param res - The response object.
 */
const getMySubZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = req.body;
    // Check if the user role is Subscriber
    if (data.role_id !== user_enum_1.UserRoles.Subscriber) {
        return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, null);
    }
    const subscription = yield subscription_model_1.default.findOne({
        where: { user_id: data.id },
        attributes: ['id'],
    });
    if (!subscription) {
        return (0, customResponses_1.customResponse)(false, res, 401, `Su suscripción no existe`, null);
    }
    // Find the subzone with the user's id
    const subzone = yield subzone_model_1.default.findAll({
        where: { subs_id: subscription.get().id, is_deleted: 0 },
        attributes: ['id', 'name', 'zone_id'],
        include: [
            {
                model: PoliticaDivision_model_1.default,
                attributes: ['id', 'name'],
                as: 'zone',
            },
            {
                model: polygon_model_1.default,
                attributes: ['lat', 'lng'],
            },
        ],
    });
    // If subzone is not found, return 404 error
    if (!subzone) {
        return (0, customResponses_1.customResponse)(false, res, 404, `No se encontraron zonas`, null);
    }
    // Return the found subzone
    (0, customResponses_1.customResponse)(true, res, 200, `Subzona encontrada`, subzone);
});
exports.getMySubZone = getMySubZone;
/**
 * Retrieves the subzones by the ID of the zone.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the subzones are retrieved.
 */
const getSubZonesByIdZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract the data and idZone from the request body and params
    const { data } = req.body;
    const { idZone } = req.params;
    // Find all subzones with the specified zone_id
    const subzone = yield subzone_model_1.default.findAll({
        where: { zone_id: idZone, is_deleted: 0 },
        attributes: ['id', 'name'],
    });
    // If no subzone is found, return a custom error response
    if (!subzone) {
        return (0, customResponses_1.customResponse)(false, res, 404, `No se encontraron zonas`, null);
    }
    // Return a custom success response with the retrieved subzone
    (0, customResponses_1.customResponse)(true, res, 200, `Subzona encontrada`, subzone);
});
exports.getSubZonesByIdZone = getSubZonesByIdZone;
/**
 * Retrieves the subzones and their polygons for a specified zone ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns A Promise that resolves to void.
 */
const getSubZonesPolygonByIdZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract the data and idZone from the request body and params
    const { data } = req.body;
    const { idZone } = req.params;
    // Find all subzones with the specified zone_id
    const subzone = yield subzone_model_1.default.findAll({
        where: { zone_id: idZone, is_deleted: 0 },
        attributes: ['id', 'name'],
        include: [
            {
                model: polygon_model_1.default,
                attributes: ['lat', 'lng'],
            },
        ],
    });
    // If no subzone is found, return a custom error response
    if (!subzone) {
        return (0, customResponses_1.customResponse)(false, res, 404, `No se encontraron zonas`, null);
    }
    // Return a custom success response with the retrieved subzone
    (0, customResponses_1.customResponse)(true, res, 200, `Subzona encontrada`, subzone);
});
exports.getSubZonesPolygonByIdZone = getSubZonesPolygonByIdZone;
/**
 * Retrieves multipolygons by zone ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns A promise that resolves to void.
 */
const getMultipolygonsByIdZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract idZone from the request params
    const { idZone } = req.params;
    // Find all multipolygons with the specified zone ID and include the id, latitude, and longitude attributes
    const multipolygons = yield multipolygon_model_1.default.findAll({
        where: { ec_politica_division_id: idZone },
        attributes: ['latitude', 'longitude'],
    });
    // If no multipolygons are found, return a custom error response
    if (!multipolygons || multipolygons.length === 0) {
        return (0, customResponses_1.customResponse)(false, res, 404, `No se encontraron multipolígonos`, null);
    }
    // Return a custom success response with the retrieved multipolygons
    (0, customResponses_1.customResponse)(true, res, 200, `Multipolígonos encontrados`, multipolygons);
});
exports.getMultipolygonsByIdZone = getMultipolygonsByIdZone;
const getPolygonBySubzone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract idSubzone from the request params
    const { idSubzone } = req.params;
    const polygon = yield polygon_model_1.default.findAll({
        attributes: [
            ['lat', 'latitude'],
            ['lng', 'longitude'],
        ],
        where: { subzone_id: idSubzone },
    });
    (0, customResponses_1.customResponse)(true, res, 200, `Polígono encontrado`, polygon);
});
exports.getPolygonBySubzone = getPolygonBySubzone;
const getSubzoneByPoint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { zone_id, latitude, longitude } = req.body;
    const subzonesAndPolygons = yield subzone_model_1.default.findAll({
        attributes: ['id', 'name'],
        where: { zone_id, is_deleted: 0 },
        include: [
            {
                model: PoliticaDivision_model_1.default,
                as: 'zone',
                attributes: ['id', 'name'],
            },
            {
                model: polygon_model_1.default,
                attributes: [
                    ['lat', 'latitude'],
                    ['lng', 'longitude'],
                ],
            },
        ],
    });
    if (subzonesAndPolygons.length === 0)
        return (0, customResponses_1.customResponse)(false, res, 404, `No se encontro subzonas`, undefined);
    for (const subzone of subzonesAndPolygons) {
        const isPointInPolygon = (0, geoLibMethods_1.isCoordsInPolygon)({ latitude: parseFloat(latitude), longitude: parseFloat(longitude) }, subzone.get().polygons.map((polygon) => ({
            latitude: parseFloat(polygon.get().latitude),
            longitude: parseFloat(polygon.get().longitude),
        })));
        if (isPointInPolygon) {
            delete subzone.dataValues.polygons;
            return (0, customResponses_1.customResponse)(true, res, 200, `Subzona encontrada`, subzone);
        }
    }
    return (0, customResponses_1.customResponse)(false, res, 404, `Subzona no encontrada`, undefined);
});
exports.getSubzoneByPoint = getSubzoneByPoint;
/**
 * Update subzone with provided data
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @returns {Promise<void>}
 */
const updateSubzone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Destructure the data from request body
    const { data, zone_id, name, polygon, subzone_id } = req.body;
    // Check if the user role is Subscriber
    if (data.role_id !== user_enum_1.UserRoles.Subscriber) {
        return (0, customResponses_1.customResponse)(false, res, 401, `Acceso denegado`, undefined);
    }
    // Check if the polygon has points
    if (polygon.length === 0) {
        return (0, customResponses_1.customResponse)(false, res, 401, 'No hay puntos de la subzona', undefined);
    }
    // Find the subscription for the user
    const subscription = yield subscription_model_1.default.findOne({
        where: { user_id: data.id },
        attributes: ['id'],
    });
    // If subscription does not exist, return error
    if (!subscription) {
        return (0, customResponses_1.customResponse)(false, res, 401, `Su suscripción no existe`, null);
    }
    // Find the zone with the provided zone_id
    const zone = yield PoliticaDivision_model_1.default.findByPk(zone_id);
    // If zone does not exist, return error
    if (!zone) {
        return (0, customResponses_1.customResponse)(false, res, 401, 'La subzona no existe', undefined);
    }
    // Find the subzone for the user's subscription
    const subzone = yield subzone_model_1.default.findOne({
        where: { id: subzone_id, subs_id: subscription.get().id, is_deleted: 0 },
        attributes: ['id', 'name'],
        include: [
            {
                model: polygon_model_1.default,
                attributes: ['id', 'lat', 'lng'],
            },
        ],
    });
    // If subzone does not exist, return 404 error
    if (!subzone) {
        return (0, customResponses_1.customResponse)(false, res, 404, `No se encontraron zonas`, null);
    }
    // Delete existing points in subzone
    for (const point of subzone.get().polygons) {
        yield point.destroy();
    }
    // Update subzone name and zone_id if provided
    if (name)
        yield subzone.update({ name });
    if (zone_id)
        yield subzone.update({ zone_id });
    // Create polygons for each point in the polygon array
    for (const pol of polygon) {
        yield polygon_model_1.default.create({
            subzone_id: subzone.get().id,
            lat: pol.lat,
            lng: pol.lng,
        });
    }
    // Return success response
    return (0, customResponses_1.customResponse)(true, res, 200, `Subzona modificada`, subzone);
});
exports.updateSubzone = updateSubzone;
//# sourceMappingURL=zone.controller.js.map