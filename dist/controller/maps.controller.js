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
exports.getGeoCodeGoogleMaps = exports.getGeometryLocationGoogleMaps = exports.getPredictionsGoogleMaps = void 0;
const customResponses_1 = require("../helpers/customResponses");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config/config");
const urlGoogleMaps = 'https://maps.googleapis.com/maps/api';
/**
 * Retrieves predictions from the Google Maps API based on the provided input.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 */
const getPredictionsGoogleMaps = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { input } = req.params;
        // Prepare the request configuration
        const config = {
            method: 'get',
            url: `${urlGoogleMaps}/place/autocomplete/json?input=${input}&key=${config_1.KEY_MAPS}&language=${config_1.LANGUAGE}&components=${config_1.COMPONENTS}`,
        };
        // Send the request to the Google Maps API
        const resp = yield (0, axios_1.default)(config);
        // Handle error responses from the API
        if (resp.data.status !== 'OK')
            return (0, customResponses_1.customResponse)(false, res, 500, 'Ha ocurrido un error, vuelva a intentarlo', resp.data);
        // Format and send the successful response
        (0, customResponses_1.customResponse)(true, res, 200, 'Direcciones obtenidas', resp.data.predictions.map((prediction) => ({
            description: prediction.description,
            placeid: prediction.place_id,
        })));
    }
    catch (error) {
        console.error('--->', error);
        // Send a generic error response
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getPredictionsGoogleMaps = getPredictionsGoogleMaps;
/**
 * Retrieves the location geometry from Google Maps API based on a place ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns The location geometry if successful, or an error response if not.
 */
const getGeometryLocationGoogleMaps = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { placeid } = req.params;
        // Set up the API request config
        const config = {
            method: 'get',
            url: `${urlGoogleMaps}/place/details/json?placeid=${placeid}&key=${config_1.KEY_MAPS}`,
        };
        // Send the API request
        const resp = yield (0, axios_1.default)(config);
        // Check for errors in the API response
        if (resp.data.status !== 'OK')
            return (0, customResponses_1.customResponse)(false, res, 500, 'Ha ocurrido un error, vuelva a intentarlo', resp.data);
        // Return the location geometry
        (0, customResponses_1.customResponse)(true, res, 200, 'Locación obtenida', resp.data.result.geometry.location);
    }
    catch (error) {
        console.error('--->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getGeometryLocationGoogleMaps = getGeometryLocationGoogleMaps;
/**
 * Retrieves the geocode from Google Maps API based on latitude and longitude.
 * @param req - The request object containing latitude and longitude parameters.
 * @param res - The response object to send the geocode data or error message.
 */
const getGeoCodeGoogleMaps = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lat, lng } = req.params;
        // Set up the API request config
        const config = {
            method: 'get',
            url: `${urlGoogleMaps}/geocode/json?latlng=${lat},${lng}&key=${config_1.KEY_MAPS}`,
        };
        // Send the API request
        const resp = yield (0, axios_1.default)(config);
        // Check if the response status is not OK
        if (resp.data.status !== 'OK')
            return (0, customResponses_1.customResponse)(false, res, 500, 'Ha ocurrido un error, vuelva a intentarlo', resp.data);
        // Get province from result
        const province = resp.data.results[0].address_components.find((component) => component.types.includes('administrative_area_level_1'));
        const city = resp.data.results[0].address_components.find((component) => component.types.includes('administrative_area_level_2'));
        // Send the formatted address as the geocode response
        (0, customResponses_1.customResponse)(true, res, 200, 'Dirección obtenida', { province: province ? province.long_name : '', canton: city ? city.long_name : '', address: resp.data.results[0].formatted_address, location: resp.data.results[0].geometry.location });
    }
    catch (error) {
        console.error('--->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getGeoCodeGoogleMaps = getGeoCodeGoogleMaps;
//# sourceMappingURL=maps.controller.js.map