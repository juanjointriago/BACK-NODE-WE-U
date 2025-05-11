import PoliticaDivision from '../models/PoliticaDivision.model';

export const findCities = async (code: string) => {
  try {
    if (!code) throw new Error('No tiene el código');

    const codeProvinceCity = getCodeProvinceAndCity(code);

    if (!codeProvinceCity.province) return [];

    const province = await PoliticaDivision.findOne({
      where: {
        code: codeProvinceCity.province,
        id_parent: null,
      },
      attributes: ['id', 'code', 'name'],
      include: [
        {
          model: PoliticaDivision,
          attributes: ['id', 'code', 'name'],
          as: 'cities',
        },
      ],
    });

    if (!province) return [];

    const provinceToJSON: { id: number; code: string; cities: { id: number; code: string; name: string }[] } = province.toJSON();

    if (codeProvinceCity.city) {
      const city: { id: number; code: string; name: string } | undefined = provinceToJSON.cities.find((city) => city.code === codeProvinceCity.city);

      if (!city) return [];

      return [{ id: city.id, code: city.code, name: city.name }];
    } else {
      return [...provinceToJSON.cities];
    }
  } catch (error) {
    return [];
  }
};

const getCodeProvinceAndCity = (code: string) => {
  if (code.length > 2) {
    const province = code.slice(0, 2);
    const city = code.slice(2, 4);
    return {
      province,
      city,
    };
  } else {
    return {
      province: code,
      city: '',
    };
  }
};
