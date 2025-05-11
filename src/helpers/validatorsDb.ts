import { PaymentMethod } from '../enums/payment_enum';
import { typeASC, UserRoles } from '../enums/user.enum';
import User from '../models/user.model';

/**
 * Si el número de teléfono existe en la base de datos, arroja un error.
 * @param {string} phone - número telefonico 10 caracteres
 */
export const phoneExist = async (phone: string) => {
  const phoneExist = await User.findOne({ where: { phone, is_deleted: 0 } });
  if (phoneExist) {
    throw new Error(`El numero de teléfono ${phone} ya se encuentra registrado`);
  }
};

export const phoneExistUpdate = async (phone: string) => {
  if (phone) {
    const phoneExist = await User.findOne({ where: { phone, is_deleted: 0 } });
    if (phoneExist) {
      throw new Error(`El numero de teléfono ${phone} ya se encuentra registrado`);
    }
  }
};

/**
 * Esta función comprueba si un usuario existe en la base de datos por su número de identificación, y
 * si existe arroja un error.
 * @param {string} identification - cédula
 */
export const identificationExist = async (identification: string) => {
  const phoneExist = await User.findOne({ where: { identification, is_deleted: 0 } });
  if (phoneExist) {
    throw new Error(`El número de cédula ${identification} ya se encuentra registrado`);
  }
};

/**
 * verifica una cédula válida
 * @param {string} identification - cédula
 */
export const validIdentificationEC = async (identification: string) => {
  const resp = verify(identification);

  if (!resp) {
    throw new Error(`El número de cédula ${identification} no es válido`);
  }
};

/**
 * Si el rol es 1, lanza un error.
 * @param {string} role - número
 */
export const validRole = async (role: string) => {
  if (parseInt(role) === UserRoles.ASC) {
    throw new Error(`No puede registrar un usuario con el este rol`);
  }
};

/**
 * Checks if a given payment method is valid.
 * @param paymentMethod - The payment method to be checked.
 * @throws {Error} - Throws an error if the payment method is not valid.
 */
export const validPaymentMethod = async (paymentMethod: string) => {
  // List of valid payment methods
  const validMethods = [PaymentMethod.creditCard, PaymentMethod.transfer];

  // Check if the payment method is in the list of valid methods
  if (!validMethods.includes(parseInt(paymentMethod))) {
    // Throw an error if the payment method is not valid
    throw new Error(`No es un mêtodo de pago válido, el mêtodo de pago debe ser uno de los siguientes: ${validMethods.join(', ')}`);
  }
};

/**
 * Validates if a number is a valid ASC.
 * Throws an error if the number is not positive or not a multiple of 5.
 *
 * @param num - The number to be validated.
 * @throws Error - If the number is not positive or not a multiple of 5.
 */
export const validNumACS = async (num: number) => {
  if (num <= 0) {
    throw new Error(`El ASC debe ser un número positivo y mayor a 0`);
  }
};

export const validNumsubzones = async (num: number) => {
  if (num < 0) {
    throw new Error(`El ASC debe ser un número positivo y mayor a 0`);
  }
};

/**
 * Validates if a given ASC type is valid.
 *
 * @param {number} type - The ASC type to validate.
 * @throws {Error} Throws an error if the ASC type is not valid.
 */
export const validTypeASC = async (type: string) => {
  // List of valid payment methods
  const typesASC = [typeASC.PUBLIC, typeASC.PRIVATE, typeASC.ORG_NEIGHBOUR_OR_COMUN_PERSON];

  // Check if the payment method is in the list of valid methods
  if (!typesASC.includes(parseInt(type))) {
    // Throw an error if the payment method is not valid
    throw new Error(`No es un tipo de ASC válido, el tipo de ASC debe ser uno de los siguientes: ${typesASC.join(', ')}`);
  }
};

/**
 * Verifies the validity of an identification number.
 * @param {string} id - The identification number to be verified.
 * @returns {boolean} - True if the identification number is valid, false otherwise.
 */
const verify = (id: string) => {
  // Check if the identification number has the correct length
  if (id.length === 10) {
    // Extract the third digit of the identification number
    const thirdNumber = parseInt(id.substring(2, 3));
    // Define the coefficient values for each character
    const coefValCedula = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    // Extract the very last digit of the identification number
    const veryLastNUmber = parseInt(id.substring(9, 10));
    let suma = 0;
    let digito = 0;

    // Check if the third digit is less than 6
    if (thirdNumber <= 6) {
      // Iterate over each character of the identification number
      for (let i = 0; i < id.length - 1; i++) {
        // Multiply each character by its corresponding coefficient value
        digito = parseInt(id.substring(i, i + 1)) * coefValCedula[i];
        // Sum the resulting values
        suma += parseInt((digito % 10) + '') + parseInt(digito / 10 + '');
      }

      // Round the sum to the nearest integer
      suma = Math.round(suma);

      // Check if the rounded sum modulo 10 is equal to the very last digit
      if (Math.round(suma % 10) === 0 && Math.round(suma % 10) === veryLastNUmber) {
        return true;
      } else if (10 - Math.round(suma % 10) === veryLastNUmber) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
};

export const validCodeCity = async (code: string) => {
  if (code)
    if (code.length !== 4) {
      throw new Error(`No es un código válido, el código debe tener 4 caracteres`);
    }
};

/**
 * Validates the status type.
 *
 * @param {string} status - The status to be validated.
 * @throws {Error} - Throws an error if the status is not valid.
 */
export const validTypeStatus = (status: string) => {
  // List of valid status types
  const typeStatus = ['pending', 'accepted', 'completed', 'cancel'];

  // Check if the status is in the list of valid types
  if (!typeStatus.includes(status)) {
    // Throw an error if the status is not valid
    throw new Error(`El estado que quiere ingresar no existe solo puede ingresar`);
  }
};

/**
 * Check if the given status is a valid type status.
 * @param {string} status - The status to be checked.
 * @returns {object} - An object with the result of the validation.
 *    - ok: A boolean indicating if the status is valid or not.
 *    - msg: A message describing the result of the validation.
 */
export const validTypeStatusEnd = (status: string) => {
  // Define the valid type status options.
  const typeStatus = ['pending', 'accepted', 'completed', 'cancel'];

  // Check if the given status is not included in the valid type status options.
  if (!typeStatus.includes(status)) {
    // Return an object indicating that the status is invalid.
    return {
      ok: false,
      msg: `El estado que quiere ingresar no existe solo puede ingresar ${typeStatus}`,
    };
  }

  // Return an object indicating that the status is valid.
  return { ok: true, msg: 'ok' };
};
