import { check } from 'express-validator';
import { validatorField } from '../validator-field.middlewares';
import { validTypeStatus } from '../../helpers/validatorsDb';

/* Un middleware que valida los campos del inicio de sesión. */
export const validateFieldsUpdateHelpRequest = [
  check('id', 'Campo obligatorio').not().isEmpty(),
  // check('status').custom(validTypeStatus),
  check('status', 'Campo obligatorio').not().isEmpty(),
  validatorField,
  //
];

export const validateLimitOffset = [
  check('offset', 'Campo requerido').not().isEmpty(),
  check('offset', 'Tipo de dato incorrecto, se debe enviar un entero').isNumeric(),
  check('limit', 'Campo requerido').not().isEmpty(),
  check('limit', 'Tipo de dato incorrecto, se debe enviar un entero').isNumeric(),
  validatorField,
  //
];
