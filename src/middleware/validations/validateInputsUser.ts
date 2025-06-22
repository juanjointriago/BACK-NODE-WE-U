import { check } from 'express-validator';
import { validatorField } from '../validator-field.middlewares';
import { validCodeCity, phoneExistUpdate, identificationExist, validIdentificationEC, validTypeASC, phoneExist } from '../../helpers/validatorsDb';

/* Este es un middleware que valida los campos del cuerpo de la solicitud. */
export const validateFieldsResetPassword = [
  check('newPassword', 'Contraseña nueva de tener mínimo 6 caracteres y maximo 6 caracteres').isString().isLength({ min: 6, max: 10 }),
  validatorField,
  //
];

/* Este es un middleware que valida los campos del cuerpo de la solicitud. */
export const validateFieldsChangeStatusUserById = [
  check('id', 'El tipo de datos es incorrecto debe ser un número').isNumeric(),
  check('id', 'Campo obligatorio').exists(),
  check('status', 'El tipo de datos es incorrecto debe ser un boolean').isBoolean(),
  check('status', 'Campo obligatorio').exists(),
  validatorField,
  //
];

/* Un middleware que valida los campos del cuerpo de la solicitud. */
export const validateFieldsGetUsers = [
  check('offset', 'El tipo de datos es incorrecto debe ser un número').isNumeric(),
  check('offset', 'Campo obligatorio').exists(),
  check('limit', 'El tipo de datos es incorrecto debe ser un boolean').isNumeric(),
  check('limit', 'Campo obligatorio').exists(),
  validatorField,
  //
];

/* Este es un middleware que valida los campos del cuerpo de la solicitud. */
export const validateFieldsCreateUser = [
  check('email', 'El correo es un campo obligatorio').exists(),
  check('email', 'El correo es inválido').isEmail(),
  check('phone', 'El número de celular es un campo obligatorio').exists(),
  check('phone', 'Número de celular inválido').isLength({ min: 10, max: 10 }),
  check('identification', 'Número de identificacion es un campo obligatorio').exists(),
  check('identification', 'Número de identificacion es inválido').isLength({ min: 10, max: 13 }),
  check('charge', 'El cargo es un campo obligatorio').exists(),
  validatorField,
  //
];

export const validateFieldsUpdateInfoUser = [
  check('phone').custom(phoneExistUpdate),
  validatorField,
  //
];

export const validateFieldsUpdateAddressAndCoords = [
  check('lat', 'El tipo de datos es incorrecto debe ser un número').isNumeric(),
  check('lat', 'Campo obligatorio').not().isEmpty(),
  check('lng', 'El tipo de datos es incorrecto debe ser un número').isNumeric(),
  check('lng', 'Campo obligatorio').not().isEmpty(),
  check('codeCity').custom(validCodeCity),
  validatorField,
  //
];
export const validateFieldsUpdateAddressAndCoordsIdCity = [
  check('lat', 'El tipo de datos es incorrecto debe ser un número').isNumeric(),
  check('lat', 'Campo obligatorio').not().isEmpty(),
  check('lng', 'El tipo de datos es incorrecto debe ser un número').isNumeric(),
  check('lng', 'Campo obligatorio').not().isEmpty(),
  validatorField,
  //
];

export const validateCreateUserASC = [
  check('email', 'El correo electronico no es válido').isEmail(),
  check('email', 'El correo electronico es obligatorio').not().isEmpty(),
  check('full_name', 'El nombre es un campo obligatorio').not().isEmpty(),
  check('phone', 'El número telefónico no es válido').custom(phoneExist).isLength({ min: 10, max: 10 }),
  check('phone', 'El número telefónico es obligatorio').not().isEmpty(),
  // check('identification').custom(identificationExist),
  check('identification').custom(validIdentificationEC),
  check('type_asc_id', 'El campo debe ser un número').isNumeric(),
  check('type_asc_id', 'El campo es obligatorio').not().isEmpty(),
  check('subzone_id', 'El campo es obligatorio').not().isEmpty(),
  check('type_asc_id').custom(validTypeASC),
  validatorField,
  //
];
