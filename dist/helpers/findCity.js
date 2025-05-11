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
exports.findCities = void 0;
const PoliticaDivision_model_1 = __importDefault(require("../models/PoliticaDivision.model"));
const findCities = (code) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!code)
            throw new Error('No tiene el código');
        const codeProvinceCity = getCodeProvinceAndCity(code);
        if (!codeProvinceCity.province)
            return [];
        const province = yield PoliticaDivision_model_1.default.findOne({
            where: {
                code: codeProvinceCity.province,
                id_parent: null,
            },
            attributes: ['id', 'code', 'name'],
            include: [
                {
                    model: PoliticaDivision_model_1.default,
                    attributes: ['id', 'code', 'name'],
                    as: 'cities',
                },
            ],
        });
        if (!province)
            return [];
        const provinceToJSON = province.toJSON();
        if (codeProvinceCity.city) {
            const city = provinceToJSON.cities.find((city) => city.code === codeProvinceCity.city);
            if (!city)
                return [];
            return [{ id: city.id, code: city.code, name: city.name }];
        }
        else {
            return [...provinceToJSON.cities];
        }
    }
    catch (error) {
        return [];
    }
});
exports.findCities = findCities;
const getCodeProvinceAndCity = (code) => {
    if (code.length > 2) {
        const province = code.slice(0, 2);
        const city = code.slice(2, 4);
        return {
            province,
            city,
        };
    }
    else {
        return {
            province: code,
            city: '',
        };
    }
};
//# sourceMappingURL=findCity.js.map