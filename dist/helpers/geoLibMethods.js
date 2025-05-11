"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCoordsInPolygon = exports.verifyDistanceUser = void 0;
const geolib_1 = require("geolib");
/**
 * Verifies if the distance between the user's position and a given position
 * is within a specified radius.
 *
 * @param {any} user - The user object containing latitude and longitude coordinates.
 * @param {any} position - The position object containing latitude and longitude coordinates.
 * @param {number} radio - The maximum distance in kilometers.
 * @return {any} Returns the user object if the distance is within the specified radius, otherwise undefined.
 */
const verifyDistanceUser = (user, position, radio) => {
    const dis = (0, geolib_1.getDistance)({ latitude: parseFloat(position.lat), longitude: parseFloat(position.lng) }, { latitude: parseFloat(user.lat), longitude: parseFloat(user.lng) });
    const distanceKM = dis * (1 / 1000);
    if (distanceKM <= radio) {
        return user;
    }
};
exports.verifyDistanceUser = verifyDistanceUser;
/**
 * Check if the given coordinates are inside the given polygon.
 * @param {Coords} coords - The coordinates to check.
 * @param {Coords[]} polygon - The polygon to check against.
 * @returns {boolean} - True if the coordinates are inside the polygon, false otherwise.
 */
const isCoordsInPolygon = (coords, polygon) => {
    // Call the isPointInPolygon function to check if the coordinates are inside the polygon
    return (0, geolib_1.isPointInPolygon)(coords, polygon);
};
exports.isCoordsInPolygon = isCoordsInPolygon;
//# sourceMappingURL=geoLibMethods.js.map