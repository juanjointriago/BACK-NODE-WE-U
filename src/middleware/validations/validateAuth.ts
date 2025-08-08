import { check } from 'express-validator';
import { validatorField } from '../validator-field.middlewares';
import { phoneExist, validIdentificationEC, identificationExist, validRole } from '../../helpers/validatorsDb';

/* Un middleware que valida los campos del inicio de sesión. */
export const validateFieldsLogin = [
  check('email', 'email incorrecto').isEmail(),
  check('password', 'Contraseña incorrecta').not().isEmpty(),
  validatorField,
  //
];

/* Un middleware que valida los campos del inicio de sesión. */
export const validateFieldsLoginSMS = [
  check('phone', 'El número de celular es obligatorio').not().isEmpty(),
  validatorField,
  //
];

/* Una serie de validaciones. */
export const validateFieldsRegister = [
  check('full_name', 'El nombre es un campo obligatorio').not().isEmpty(),
  check('email', 'El correo electronico no es válido').isEmail(),
  check('email', 'El correo electronico es obligatorio').not().isEmpty(),
  check('password', 'El password es obligatorio').not().isEmpty(),
  check('password', 'Ingrese al menos 6 caracteres').isLength({ min: 6 }),
  check('phone', 'El número telefónico no es válido').isLength({ min: 10, max: 10 }),
  check('phone', 'El número telefónico es obligatorio').not().isEmpty(),
  // check('identification').custom(identificationExist),
  check('identification').custom(validIdentificationEC),
  check('role_id').custom(validRole),
  // check('role_id', 'El role_id es un entero').isNumeric(),
  check('role_id', 'el rol es un campo obligatorio').not().isEmpty(),
  validatorField,
  //
];

/* Un middleware que valida los campos de la contraseña de recuperación. */
export const validateFieldsRecoverPassword = [
  check('email', 'El correo es un campo obligatorio').exists(),
  check('email', 'El correo es inválido').isEmail(),
  check('identification', 'Número de identificacion es un campo obligatorio').exists(),
  check('identification', 'Número de identificacion es inválido').isLength({ min: 10, max: 13 }),
  validatorField,
  //
];

/* Un middleware que valida los campos de la recuperación de contraseña. */
export const validateFieldsResetPassword = [
  check('token', 'El token es obligatorio').not().isEmpty(),
  check('password', 'El password es obligatorio').not().isEmpty(),
  check('password', 'Contraseña incorrecta').isString().isLength({ min: 6 }),
  validatorField,
  //
];
