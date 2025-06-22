import bcryptjs from 'bcryptjs';

/**
 * Generates a password hash using bcrypt.
 * @param {string} password - The password to encode.
 * @returns {string} - The encoded password.
 */
export const generatePassword = async (password: string): Promise<string> => {
  // Generate a salt
  const salt = await bcryptjs.genSalt();

  // Hash the password with the salt
  const encodedPassword = bcryptjs.hash(password, salt);

  return encodedPassword;
};

/**
 * Toma una contraseña y un hash, y devuelve verdadero si la contraseña coincide con el hash y falso si
 * no lo hace.
 * @param {string} password - La contraseña que el usuario ingresó.
 * @param {string} hash - El hash generado por la función bcryptjs.hashSync().
 * @returns Un valor booleano.
 */
export const ValidadPassword = (password: string, hash: string) => {
  const validPassword = bcryptjs.compareSync(password, hash);
  if (!validPassword) {
    return false;
  } else {
    return true;
  }
};

/**
 * "Crear una contraseña aleatoria de una longitud determinada".
 *
 * La función toma un solo argumento, plength, que es la longitud de la contraseña que se creará
 * @param {number} plength - La longitud de la contraseña que desea crear.
 * @returns Una cadena de caracteres aleatorios.
 */
export const createPassword = (plength: number) => {
  const chars = 'abcdefghijklmnopqrstubwsyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let password = '';
  for (let i = 0; i < plength; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  console.log(password);
  return password;
};
