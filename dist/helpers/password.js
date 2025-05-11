"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPassword = exports.ValidadPassword = exports.generatePassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Generates a password hash using bcrypt.
 * @param {string} password - The password to encode.
 * @returns {string} - The encoded password.
 */
const generatePassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    // Generate a salt
    const salt = yield bcryptjs_1.default.genSalt();
    // Hash the password with the salt
    const encodedPassword = bcryptjs_1.default.hash(password, salt);
    return encodedPassword;
});
exports.generatePassword = generatePassword;
/**
 * Toma una contraseña y un hash, y devuelve verdadero si la contraseña coincide con el hash y falso si
 * no lo hace.
 * @param {string} password - La contraseña que el usuario ingresó.
 * @param {string} hash - El hash generado por la función bcryptjs.hashSync().
 * @returns Un valor booleano.
 */
const ValidadPassword = (password, hash) => {
    const validPassword = bcryptjs_1.default.compareSync(password, hash);
    if (!validPassword) {
        return false;
    }
    else {
        return true;
    }
};
exports.ValidadPassword = ValidadPassword;
/**
 * "Crear una contraseña aleatoria de una longitud determinada".
 *
 * La función toma un solo argumento, plength, que es la longitud de la contraseña que se creará
 * @param {number} plength - La longitud de la contraseña que desea crear.
 * @returns Una cadena de caracteres aleatorios.
 */
const createPassword = (plength) => {
    const chars = 'abcdefghijklmnopqrstubwsyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let password = '';
    for (let i = 0; i < plength; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    console.log(password);
    return password;
};
exports.createPassword = createPassword;
//# sourceMappingURL=password.js.map