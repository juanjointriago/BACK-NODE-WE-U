import { check } from 'express-validator';
import { validatorField } from '../validator-field.middlewares';

/* Una validación de los campos de solicitud. */
export const validateFieldsPostZone = [
  check('zone_name', 'Campo obligatorio').not().isEmpty(),
  check('zone_name', 'Tipo de dato es incorrecto debe ser una cadena de texto').isString(),
  check('latlngs', 'Campo obligatorio').not().isEmpty(),
  check('latlngs', 'Tipo de dato es incorrecto debe ser una cadena de texto').isString(),
  validatorField,
  //
];

/* Una validación de los campos de la solicitud. */
export const validateFieldsPutZone = [
  check('id', 'Campo obligatorio').not().isEmpty(),
  check('id', 'Tipo de dato es incorrecto debe ser un entero').isNumeric(),
  check('zone_name', 'Campo obligatorio').not().isEmpty(),
  check('zone_name', 'Tipo de dato es incorrecto debe ser una cadena de texto').isString(),
  check('latlngs', 'Campo obligatorio').not().isEmpty(),
  check('latlngs', 'Tipo de dato es incorrecto debe ser una cadena de texto').isString(),
  validatorField,
  //
];
export const validateFieldsUpdateZonesSelected = [
  check('is_active', 'Campo obligatorio').not().isEmpty(),
  check('is_active', 'Tipo de dato es incorrecto debe ser un boleano').isBoolean(),
  check('zoneSelectedId', 'Campo obligatorio').not().isEmpty(),

  validatorField,
  //
];
