import { check } from 'express-validator';
import { validatorField } from '../validator-field.middlewares';

export const validateGetComplaints = [
  check('offset', 'Campo requerido').not().isEmpty(),
  check('offset', 'Tipo de dato incorrecto, se debe enviar un entero').isNumeric(),
  check('limit', 'Campo requerido').not().isEmpty(),
  check('limit', 'Tipo de dato incorrecto, se debe enviar un entero').isNumeric(),
  validatorField,
  //
];

export const validateCreateComplaint = [
  check('address', 'Campo requerido').not().isEmpty(),
  check('zone_id', 'Campo requerido').not().isEmpty(),
  check('lat', 'Campo requerido').not().isEmpty(),
  check('lng', 'Campo requerido').not().isEmpty(),
  check('title', 'Campo requerido').not().isEmpty(),
  check('description', 'Campo requerido').not().isEmpty(),
  validatorField,
  //
];

export const validatePostComment = [
  check('address', 'Campo requerido').not().isEmpty(),
  check('complaint_id', 'Campo requerido').not().isEmpty(),
  check('zone_id', 'Campo requerido').not().isEmpty(),
  check('lat', 'Campo requerido').not().isEmpty(),
  check('lng', 'Campo requerido').not().isEmpty(),
  check('description', 'Campo requerido').not().isEmpty(),
  validatorField,
  //
];
