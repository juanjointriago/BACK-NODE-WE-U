import { check } from 'express-validator';
import { validatorField } from '../validator-field.middlewares';
import { phoneExist, validIdentificationEC, validNumACS, validNumsubzones, validPaymentMethod } from '../../helpers/validatorsDb';

/* Una validación de los campos de solicitud. */
export const validateFieldsPostZone = [
  check('zone_name', 'Campo obligatorio').not().isEmpty(),
  check('zone_name', 'Tipo de dato es incorrecto debe ser una cadena de texto').isString(),
  check('latlngs', 'Campo obligatorio').not().isEmpty(),
  check('latlngs', 'Tipo de dato es incorrecto debe ser una cadena de texto').isString(),
  validatorField,
  //
];

/* Una validación de los campos de solicitud. */
export const validateRegisterSubscriber = [
  check('email', 'El correo electronico no es válido').isEmail(),
  check('email', 'El correo electronico es obligatorio').not().isEmpty(),
  check('password', 'El password es obligatorio').not().isEmpty(),
  check('password', 'Ingrese al menos 6 caracteres').isLength({ min: 6 }),
  check('full_name', 'El nombre es un campo obligatorio').not().isEmpty(),
  // check('identification').custom(identificationExist),
  check('identification').custom(validIdentificationEC),
  check('payment_method', 'El campo debe ser un número').isNumeric(),
  check('payment_method').custom(validPaymentMethod),
  check('phone', 'El número telefónico no es válido').custom(phoneExist).isLength({ min: 10, max: 10 }),
  check('phone', 'El número telefónico es obligatorio').not().isEmpty(),
  check('num_asc', 'El campo debe ser un número').isNumeric(),
  check('num_asc', 'El campo es obligatorio').not().isEmpty(),
  check('num_asc').custom(validNumACS),
  check('num_subzones_extra', 'El campo debe ser un número').isNumeric(),
  // check('num_subzones', 'El campo es obligatorio').not().isEmpty(),
  check('num_subzones_extra').custom(validNumsubzones),
  validatorField,
  //
];

export const preValidateRegisterSubscriber = [
  check('email', 'El correo electronico no es válido').isEmail(),
  check('email', 'El correo electronico es obligatorio').not().isEmpty(),
  check('password', 'El password es obligatorio').not().isEmpty(),
  check('password', 'Ingrese al menos 6 caracteres').isLength({ min: 6 }),
  check('full_name', 'El nombre es un campo obligatorio').not().isEmpty(),
  // check('identification').custom(identificationExist),
  check('identification').custom(validIdentificationEC),
  check('phone', 'El número telefónico no es válido').custom(phoneExist).isLength({ min: 10, max: 10 }),
  check('phone', 'El número telefónico es obligatorio').not().isEmpty(),
  validatorField,
  //
];

export const validatePayment = [
  check('payment_method', 'El campo debe ser un número').isNumeric(),
  check('payment_method').custom(validPaymentMethod),
  validatorField,
  //
];

export const validatePaymentSubzones = [
  check('payment_method', 'El campo debe ser un número').isNumeric(),
  check('payment_method').custom(validPaymentMethod),
  check('num_subzones', 'El campo debe ser un número').isNumeric(),
  check('num_subzones', 'El campo es obligatorio').not().isEmpty(),
  check('num_subzones').custom(validNumACS),
  validatorField,
  //
];

export const validateCreateSubZone = [
  check('name', 'El campo es obligatorio').not().isEmpty(),
  check('name', 'El campo debe ser una cadena de caracteres').isString(),
  check('polygon', 'El campo es obligatorio').not().isEmpty(),
  check('polygon', 'El campo debe ser una un arreglo').isArray(),
  validatorField,
  //
];

export const validateUpdateSubzoneByAscId = [
  check('asc_id', 'El campo es obligatorio').not().isEmpty(),
  check('asc_id', 'El campo debe ser un número').isNumeric(),
  check('subzone_id', 'El campo es obligatorio').not().isEmpty(),
  check('subzone_id', 'El campo debe ser un número').isNumeric(),
  validatorField,
  //
];
