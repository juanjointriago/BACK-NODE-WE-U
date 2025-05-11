import jwt, { decode } from 'jsonwebtoken';

/**
 * Toma un correo electrónico como parámetro, crea una carga útil con el correo electrónico y luego
 * firma la carga útil con una clave secreta
 * @param {string} email - El correo electrónico del usuario para el que queremos generar el token.
 * @returns Una promesa que se resolverá en un token o se rechazará con un mensaje.
 */
export const generateJWT = (email: string) => {
  return new Promise((resolve, reject) => {
    const payload = {
      email,
    };
    jwt.sign(payload, `${process.env.SECRETORPRIVATEKEY}`, (err, token) => {
      if (err) {
        console.log(err);
        reject('No se puedo genera el token');
      } else {
        resolve(token);
      }
    });
  });
};

/**
 * Toma un objeto como parámetro y devuelve una promesa que se resuelve en un token JWT
 * @param object - {}: este es el objeto que desea cifrar.
 * @returns Una promesa que se resolverá en un token o se rechazará con un mensaje.
 */
export const generateJWTObject = (object: {}) => {
  return new Promise((resolve, reject) => {
    const payload = {
      object,
    };
    jwt.sign(payload, `${process.env.SECRETORPRIVATEKEY}`, (err, token) => {
      if (err) {
        console.log(err);
        reject('No se puedo genera el token');
      } else {
        resolve(token);
      }
    });
  });
};

/**
 * Genera un token JWT con un tiempo de vencimiento personalizado
 * @param object - {}: este es el objeto que desea enviar al cliente.
 * @param {string | number | undefined} time - cadena | número | indefinido
 * @returns Una promesa que devolverá una ficha
 */
export const generateJWTObjectWhiteTime = (object: {}, time: string | number | undefined) => {
  return new Promise((resolve, reject) => {
    const payload = {
      object,
    };
    jwt.sign(
      payload,
      `${process.env.SECRETORPRIVATEKEY}`,
      {
        expiresIn: time,
      },
      (err, token) => {
        if (err) {
          console.log(err);
          reject('No se puedo genera el token');
        } else {
          resolve(token);
        }
      }
    );
  });
};

/**
 * Toma una carga útil de JWT como una cadena, la decodifica y devuelve los datos decodificados como
 * una promesa
 * @param {string} payload - La cadena JWT para decodificar.
 * @returns Una promesa que se resuelve en la carga útil decodificada.
 */
export const decodeJWT = (payload: string) => {
  return new Promise((resolve) => {
    const data = decode(payload);
    resolve(data);
  });
};

/**
 * Toma un token como parámetro y devuelve una matriz con un valor booleano y un objeto
 * @param {string} [token] - El token que se va a verificar.
 * @returns Una matriz con dos elementos. El primer elemento es un booleano y el segundo elemento es un
 * objeto.
 */
export const comprobarJWT = (token: string = '') => {
  try {
    const { object }: any = jwt.verify(token, `${process.env.SECRETORPRIVATEKEY}`);
    return [true, object];
  } catch (error) {
    return [false, null];
  }
};
