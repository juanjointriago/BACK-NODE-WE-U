import { Request, Response } from 'express';
import { customResponse } from '../helpers/customResponses';
import { generatePassword } from '../helpers/password';
import { getExtension, validExtension } from '../helpers/upload-file';
import { generateJWTObjectWhiteTime } from '../helpers/generate-jwt';
import { generateFileName, generateSerialNumber, savePhotosCreateUser } from '../helpers/utils';
import Subscription from '../models/subscription.model';
import User from '../models/user.model';
import { ARTICULES, PaymentMethod, Taxes } from '../enums/payment_enum';
import { UserRoles } from '../enums/user.enum';
import Subzone from '../models/subzone.model';
import Polygon from '../models/polygon.model';
import PoliticaDivision from '../models/PoliticaDivision.model';
import DetailZonesSubAdmin from '../models/detailZonesSubAdmin.model';
import Payment from '../models/payment.model';
import { sendEmail } from '../helpers/sendEmail';
import { emailPayment } from '../templates/userEmails';
import { generateSignedUrlGCS, uploadFileGCS } from '../helpers/gc-storage';
import AscSubscriber from '../models/ascSubscriber.model';
import { emailASCSubZone } from '../templates/authEmails';
import DetailPayment from '../models/detailPayment.model';
import PurchasedProduct from '../models/purchasedProducts.model';
import { uploadFileFirebase } from '../helpers/uploadFileFirebase';
/**
 * Registers a new subscriber.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
export const registerSubscriber = async (req: Request, res: Response) => {
  // Extract request body parameters
  const { email, full_name, identification, password, phone, payment_method, codePaymentApi, num_asc, num_subzones_extra } = req.body;

  // Parse payment method to integer
  const paymentMethod = parseInt(payment_method);
  const numASC = parseInt(num_asc);
  const numSubzones = parseInt(num_subzones_extra) || undefined;

  // Extract photo_ticket from request files
  const photo_ticket = req.files?.ticket;

  if (paymentMethod === PaymentMethod.transfer) {
    // Check if photo_ticket is provided
    if (photo_ticket) {
      // Check if only one image is uploaded
      if (photo_ticket instanceof Array) {
        return customResponse(false, res, 400, 'Solo puede cargar una imagen', null);
      } else {
        // Check if file extension is valid
        if (validExtension(photo_ticket)) return customResponse(false, res, 400, 'Solo se permite archivos .png, .jpg, .jpeg, .gif', null);
      }
    } else {
      return customResponse(false, res, 400, 'Debe cargar el comprobante de pago', null);
    }
  }

  // Check if user with the same email already exists
  const isExistUser = await User.findOne({ where: { email: email, is_deleted: 0 } });

  if (isExistUser) {
    // Return error response if user already exists
    return customResponse(false, res, 400, `Un usuario con este correo electrónico '${email}' ya existe`, null);
  }

  // Generate encrypted password
  const passEncript = await generatePassword(password);

  // Create new user
  const user = await User.create({ password: passEncript, email: email.trim(), full_name, identification, phone, role_id: UserRoles.Subscriber, is_active: paymentMethod === PaymentMethod.creditCard ? 1 : 0 });

  // Create new subscription
  const subscription = await Subscription.create({
    payment_method: paymentMethod,
    state: paymentMethod === PaymentMethod.creditCard ? 1 : 0,
    num_asc: ARTICULES.asc.amount * numASC,
    num_subzones: numSubzones ? numSubzones + 1 : 1,
    date_subscription: new Date(),
    date_expiration: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    code_sub: paymentMethod === PaymentMethod.creditCard ? codePaymentApi : null,
    user_id: user.get().id,
  });

  const payment = await postPayment({
    paymentMethod,
    amounts: {
      units_asc: numASC,
      units_subzones: numSubzones ? numSubzones : undefined,
    },
    subscriptionId: subscription.get().id,
    detailPayment: `Pago de registro de suscripción con ${subscription?.get().num_asc} agentes de seguridad ciudadana y ${subscription.get().num_subzones} subzonas`,
  });

  if (payment.get().payment_method === PaymentMethod.transfer) {
    // Check if photo_ticket is provided
    if (photo_ticket) {
      // Save photos and update subscription and payment
      const extension = getExtension(photo_ticket);
      const nameFile = `voucher_${identification}_${payment.get().num_order}`;
      // await uploadFileGCS(photo_ticket, nameFile, 'vouchers');
      await uploadFileFirebase(photo_ticket, nameFile, 'vouchers');
      await subscription?.update({
        photo_ticket: `${nameFile}.${extension}`,
      });

      await payment?.update({
        voucher: `${nameFile}.${extension}`,
      });
    }
  }

  await subscription?.update({
    total: payment.get().total,
  });

  const dateEmmit = new Date(subscription.get().date_subscription);
  const dateExpire = new Date(subscription.get().date_expiration);

  const detailsPayment = await DetailPayment.findAll({
    where: { payment_id: payment.get().id },
  });

  detailsPayment.length > 0 &&
    Promise.all(
      detailsPayment.map(async (detail) => {
        await PurchasedProduct.create({
          subscription_id: subscription.get().id,
          units: detail.get().units,
          price_unit: detail.get().price_unit,
          subtotal: detail.get().subtotal,
          tax: detail.get().tax,
          iva: detail.get().iva,
          total: detail.get().total,
          product: detail.get().item,
          is_integraded_subscription: true,
        });
      })
    );

  // send email payment
  await sendEmail(
    'We-u',
    [user.get().email],
    'Detalle de pago',
    `Detalle de pago`,
    emailPayment({
      name: user.get().full_name,
      identification: user.get().identification,
      numOrden: payment.get().num_order,
      total: payment.get().total,
      subtotal: payment.get().subtotal,
      detail: payment.get().detail,
      detailsPayment: detailsPayment,
      iva: payment.get().iva,
      date: `${dateEmmit.getDate()}/${dateEmmit.getMonth() + 1}/${dateEmmit.getFullYear()}`,
      dateUntil: `${dateExpire.getDate()}/${dateExpire.getMonth() + 1}/${dateExpire.getFullYear()}`,
    })
  );

  // Generate JWT token
  const token = await generateJWTObjectWhiteTime({ id: user.get().id }, '7d');

  // Generate success message
  const msg = paymentMethod === PaymentMethod.creditCard ? `Muchas gracias ${user.get().full_name} por elegir We-u.` : `Muchas gracias ${user.get().full_name} por elegir We-u. Espera que el Administrador revise el comprobante de transferencia y acepte tu registro`;

  // Return success response
  customResponse(true, res, 200, msg, paymentMethod === PaymentMethod.creditCard ? { token } : undefined);
};

/**
 * Validation of the fields of the registration of a subscriber.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the validation is finished.
 */
export const validationFieldRegisterSubscriber = async (req: Request, res: Response): Promise<void> => {
  // Extract the email from the request body
  const { email } = req.body;

  // Check if user with the same email already exists
  const isExistUser = await User.findOne({ where: { email: email, is_deleted: 0 } });

  if (isExistUser) {
    // Return error response if user already exists
    return customResponse(false, res, 400, `Un usuario con este '${email}' ya existe`, null);
  }

  // Return success response
  return customResponse(true, res, 200, 'Datos correctos', undefined);
};

/**
 * Create a new subzone.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the subzone is created.
 */
export const createSubZone = async (req: Request, res: Response): Promise<void> => {
  const { data, zone_id, name, polygon } = req.body;

  if (data.role_id !== UserRoles.Subscriber) return customResponse(false, res, 401, `Acceso denegado`, null);

  // Check if there are any points in the polygon
  if (polygon.length === 0) {
    return customResponse(false, res, 401, 'No hay puntos de la subzona', undefined);
  }

  // Find the zone with the provided zone_id
  const zone = await PoliticaDivision.findByPk(zone_id);

  // Check if the zone exists
  if (!zone) {
    return customResponse(false, res, 401, 'La zona no existe', undefined);
  }
  // Check if the zone has a parent
  if (zone.get().id_parent === null) {
    return customResponse(false, res, 401, 'Se necesita el id del cantón', undefined);
  }

  // Find the user with the provided user id
  const user = await User.findByPk(data.id);

  // Check if the user exists
  if (!user) {
    return customResponse(false, res, 401, 'El usuario no existe', undefined);
  }

  // Find the subscription of the user
  const subscription = await Subscription.findOne({ where: { user_id: user.get().id } });

  // Check if the user has a subscription
  if (!subscription) {
    return customResponse(false, res, 401, 'El usuario no tiene una suscripción', undefined);
  }

  const subzones = await Subzone.findAll({ where: { subs_id: subscription.get().id, is_deleted: 0 } });

  if (subzones && subzones.length >= subscription.get().num_subzones) {
    return customResponse(false, res, 401, 'No puedes crear más zonas, en tu suscripción solo puedes crear ' + subscription.get().num_subzones + ' zonas', undefined);
  }

  // Create a new subzone
  const newSubzone = await Subzone.create({
    zone_id,
    subs_id: subscription.get().id,
    name,
  });

  // Update the user's zone_id
  await user.update({
    zone_id,
    //subzone_id: newSubzone.get().id, //Todo: revisar donde usa esto el subscriptor como filtros
  });

  // create detailZonesSubAdmin
  await DetailZonesSubAdmin.create({
    user_id: user.get().id,
    zone_id,
  });

  // Create polygons for each point in the polygon array
  for (const pol of polygon) {
    await Polygon.create({
      subzone_id: newSubzone.get().id,
      lat: pol.lat,
      lng: pol.lng,
    });
  }

  return customResponse(true, res, 200, 'Subzona creada', newSubzone);
};

/**
 * Get the user's subscription information and payment history.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A promise that resolves to void.
 */
export const getMySubscription = async (req: Request, res: Response): Promise<void> => {
  // Extract the data from the request body
  const { data } = req.body;

  // Check if the user has the subscriber role
  if (data.role_id !== UserRoles.Subscriber) {
    return customResponse(false, res, 401, 'No tiene permisos para realizar esta petición', null);
  }

  // Find the user's subscription
  const subscription = await Subscription.findOne({
    attributes: { exclude: ['is_deleted', 'updated_at'] },
    where: { user_id: data.id, is_deleted: 0 },
  });

  // If the subscription is not found, return an error response
  if (!subscription) {
    return customResponse(false, res, 401, 'Suscripción no encontrada', null);
  }

  // Find the payments related to the subscription
  const purchasedProducts = await PurchasedProduct.findAll({
    where: { subscription_id: subscription.get().id, is_deleted: 0, is_integraded_subscription: 1 },
    order: [['created_at', 'DESC']],
  });

  // set photo_ticket with SignedUrlGCS
  subscription.get().photo_ticket = subscription.get().photo_ticket ? await generateSignedUrlGCS(subscription.get().photo_ticket, 'vouchers') : '';

  // Return a success response with the subscription and payments
  return customResponse(true, res, 200, 'Tu suscripción', { subscription, purchasedProducts });
};

/**
 * Handle payment request
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns Promise<void>
 *
 * This function handles the payment request. It gets the payment method, the user's subscription, and the payment details from the request body.
 * It then checks if the payment method is transfer, and if so, it checks if the ticket photo is provided and if it is a valid file extension.
 * If the payment method is transfer, it saves the photo and updates the subscription and payment.
 * Finally, it sends an email with the payment details and returns a success response.
 */
export const paymentAsc = async (req: Request, res: Response): Promise<void> => {
  // Destructure request body
  const { data, payment_method, codePaymentApi, num_asc } = req.body;

  // Get ticket photo from request
  const photo_ticket = req.files?.ticket;
  const paymentMethod = parseInt(payment_method);
  const numASC = parseInt(num_asc);

  // Check if the payment method is transfer
  if (paymentMethod === PaymentMethod.transfer) {
    // Check if the ticket photo is provided
    if (photo_ticket) {
      // Check if only one image is uploaded
      if (photo_ticket instanceof Array) {
        return customResponse(false, res, 400, 'Solo puede cargar una imagen', null);
      } else {
        // Check if the file extension is valid
        if (validExtension(photo_ticket)) return customResponse(false, res, 400, 'Solo se permite archivos .png, .jpg, .jpeg, .gif', null);
      }
    } else {
      return customResponse(false, res, 400, 'Debe cargar una el voucher', null);
    }
  }

  // Check user role
  if (data.role_id !== UserRoles.Subscriber) return customResponse(false, res, 401, 'No tiene permisos para realizar esta petición', null);

  // Find subscription for user
  const subscription = await Subscription.findOne({ where: { user_id: data.id, is_deleted: 0 } });

  if (!subscription) return customResponse(false, res, 401, 'Suscripción no encontrada', null);

  // Create payment
  const payment = await postPayment({
    paymentMethod,
    amounts: {
      units_asc: numASC,
    },
    cod_transaction_payment: codePaymentApi,
    subscriptionId: subscription.get().id,
    detailPayment: `Compra de ${numASC} Usuarios Agente de seguridad ciudadana`,
  });

  if (paymentMethod === PaymentMethod.transfer) {
    // Check if the ticket photo is provided
    if (photo_ticket) {
      // Save photos and update subscription and payment
      const extension = getExtension(photo_ticket);
      const nameFile = `voucher_${data.identification}_${payment.get().num_order}`;
      await uploadFileGCS(photo_ticket, nameFile, 'vouchers');
      // Update payment
      await payment?.update({
        voucher: `${nameFile}.${extension}`,
      });
    }
  }

  // Update subscription
  await subscription?.update({
    num_asc: subscription.get().num_asc + numASC * ARTICULES.asc.amount,
  });

  const detailsPayment = await DetailPayment.findAll({
    where: { payment_id: payment.get().id },
  });

  detailsPayment.length > 0 &&
    Promise.all(
      detailsPayment.map(async (detail) => {
        await PurchasedProduct.create({
          subscription_id: subscription.get().id,
          units: detail.get().units,
          price_unit: detail.get().price_unit,
          subtotal: detail.get().subtotal,
          tax: detail.get().tax,
          iva: detail.get().iva,
          total: detail.get().total,
          product: detail.get().item,
        });
      })
    );

  const dateEmmit = new Date(subscription.get().date_subscription);

  // send email payment
  await sendEmail(
    'We-u',
    [data.email],
    'Detalle de pago',
    `Detalle de pago`,
    emailPayment({
      name: data.full_name,
      identification: data.identification,
      numOrden: payment.get().num_order,
      total: payment.get().total,
      subtotal: payment.get().subtotal,
      detail: payment.get().detail,
      detailsPayment: detailsPayment,
      iva: payment.get().iva,
      date: `${dateEmmit.getDate()}/${dateEmmit.getMonth() + 1}/${dateEmmit.getFullYear()}`,
    })
  );
  // Create success message
  const msg = paymentMethod === PaymentMethod.creditCard ? `Muchas gracias ${data.full_name} por elegir We-u.` : `Muchas gracias ${data.full_name} por elegir We-u. Espera que el Administrador revise el comprobante de transferencia y acepte tu pago`;

  // Return success response
  return customResponse(true, res, 200, msg, undefined);
};

/**
 * Handle payment for a subscription.
 *
 * @param {Request} req - The incoming request object containing the payment method and user data in the body.
 * @param {Response} res - The outgoing response object used to send back the custom response.
 * @returns {Promise<void>} A promise that resolves when the payment is created and the email is sent.
 */
export const paymentSubscriptionMonthly = async (req: Request, res: Response): Promise<void> => {
  // Destructure request body
  const { data, payment_method, codePaymentApi } = req.body;

  // Check user role
  if (data.role_id !== UserRoles.Subscriber) return customResponse(false, res, 401, 'No tiene permisos para realizar esta petición', null);

  // Get ticket photo from request
  const photo_ticket = req.files?.ticket;
  const paymentMethod = parseInt(payment_method);

  if (paymentMethod === PaymentMethod.transfer) {
    // Check if photo_ticket is provided
    if (photo_ticket) {
      // Check if only one image is uploaded
      if (photo_ticket instanceof Array) {
        return customResponse(false, res, 400, 'Solo puede cargar una imagen', null);
      } else {
        // Check if file extension is valid
        if (validExtension(photo_ticket)) return customResponse(false, res, 400, 'Solo se permite archivos .png, .jpg, .jpeg, .gif', null);
      }
    } else {
      return customResponse(false, res, 400, 'Debe cargar una el voucher', null);
    }
  }

  // Find subscription for user
  const subscription = await Subscription.findOne({ where: { user_id: data.id, is_deleted: 0 } });

  if (!subscription) return customResponse(false, res, 401, 'Suscripción no encontrada', null);

  const expirationDate = new Date(subscription.get().date_expiration);
  const substractOneDay = new Date(expirationDate.setDate(expirationDate.getDate() - 1));

  if (new Date() < substractOneDay) {
    return customResponse(false, res, 401, 'Tu suscripción mensual esta al día', null);
  }

  // Create payment
  const payment = await postPaymentSubscriptionMonthly({
    paymentMethod,
    total: subscription.get().total,
    cod_transaction_payment: codePaymentApi,
    subscriptionId: subscription.get().id,
    detailPayment: `Pago de suscripción mensual`,
  });

  // Update subscription
  await subscription.update({
    payment_method: payment.get().payment_method,
    state: 1,
    total: payment.get().total,
    date_expiration: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    code_sub: paymentMethod === PaymentMethod.creditCard ? codePaymentApi : null,
  });

  if (paymentMethod === PaymentMethod.transfer) {
    // Check if photo_ticket is provided
    if (photo_ticket) {
      // Save photos and update subscription and payment
      const extension = getExtension(photo_ticket);
      const nameFile = `voucher_${data.identification}_${payment.get().num_order}`;
      await uploadFileGCS(photo_ticket, nameFile, 'vouchers');

      // Update subscription
      await subscription.update({
        photo_ticket: `${nameFile}.${extension}`,
      });

      // Update payment
      await payment?.update({
        voucher: `${nameFile}.${extension}`,
      });
    }
  }

  const dateEmmit = new Date(subscription.get().updated_at);
  const dateExpire = new Date(subscription.get().date_expiration);

  const detailsPayment = await DetailPayment.findAll({
    where: { payment_id: payment.get().id },
  });

  const purchasedProducts = await PurchasedProduct.findAll({
    where: { subscription_id: subscription.get().id, is_integraded_subscription: 0 },
  });

  if (purchasedProducts.length > 0) {
    const sum = purchasedProducts.map((purchasedProduct) => purchasedProduct.get().total).reduce((a, b) => a + b, 0);
    subscription.update({ total: subscription.get().total + sum });
    await Promise.all(purchasedProducts.map((purchasedProduct) => purchasedProduct.update({ is_integraded_subscription: 1 })));
  }

  // send email payment
  await sendEmail(
    'We-u',
    [data.email],
    'Detalle de pago',
    `Detalle de pago`,
    emailPayment({
      name: data.full_name,
      identification: data.identification,
      numOrden: payment.get().num_order,
      total: payment.get().total,
      subtotal: payment.get().subtotal,
      detail: payment.get().detail,
      detailsPayment: detailsPayment,
      iva: payment.get().iva,
      date: `${dateEmmit.getDate()}/${dateEmmit.getMonth() + 1}/${dateEmmit.getFullYear()}`,
      dateUntil: `${dateExpire.getDate()}/${dateExpire.getMonth() + 1}/${dateExpire.getFullYear()}`,
    })
  );

  // Create success message
  const msg = paymentMethod === PaymentMethod.creditCard ? `Muchas gracias ${data.full_name} por elegir We-u.` : `Muchas gracias ${data.full_name} por elegir We-u. Espera que el Administrador revise el comprobante de transferencia y acepte tu pago`;

  // Return success response
  return customResponse(true, res, 200, msg, undefined);
};

/**
 * Handle payment for a subscription.
 *
 * @param {Request} req - The incoming request object containing the payment method and user data in the body.
 * @param {Response} res - The outgoing response object used to send back the custom response.
 * @returns {Promise<void>} A promise that resolves when the payment is created and the email is sent.
 */
export const paymentSubZone = async (req: Request, res: Response): Promise<void> => {
  const { data, payment_method, codePaymentApi, num_subzones } = req.body;

  // Get ticket photo from request
  const photo_ticket = req.files?.ticket;
  const paymentMethod = parseInt(payment_method);
  const numSubzones = parseInt(num_subzones);

  if (paymentMethod === PaymentMethod.transfer) {
    // Check if photo_ticket is provided
    if (photo_ticket) {
      // Check if only one image is uploaded
      if (photo_ticket instanceof Array) {
        return customResponse(false, res, 400, 'Solo puede cargar una imagen', null);
      } else {
        // Check if file extension is valid
        if (validExtension(photo_ticket)) return customResponse(false, res, 400, 'Solo se permite archivos .png, .jpg, .jpeg, .gif', null);
      }
    } else {
      return customResponse(false, res, 400, 'Debe cargar una el voucher', null);
    }
  }

  // Check user role
  if (data.role_id !== UserRoles.Subscriber) return customResponse(false, res, 401, 'No tiene permisos para realizar esta petición', null);

  // Find subscription for user
  const subscription = await Subscription.findOne({ where: { user_id: data.id, is_deleted: 0 } });

  if (!subscription) return customResponse(false, res, 401, 'Suscripción no encontrada', null);

  const subtotal = ARTICULES.subzone.price * numSubzones;

  // Create payment
  const payment = await postPayment({
    paymentMethod,
    amounts: {
      units_subzones: numSubzones,
    },
    cod_transaction_payment: codePaymentApi,
    subscriptionId: subscription.get().id,
    detailPayment: `Pago de nueva zona`,
  });

  await subscription.update({
    num_subzones: subscription.get().num_subzones + numSubzones,
  });

  if (paymentMethod === PaymentMethod.transfer) {
    // Check if photo_ticket is provided
    if (photo_ticket) {
      // Save photos and update subscription and payment
      const extension = getExtension(photo_ticket);
      const nameFile = `voucher_${data.identification}_${payment.get().num_order}`;
      await uploadFileGCS(photo_ticket, nameFile, 'vouchers');

      // Update payment
      await payment?.update({
        voucher: `${nameFile}.${extension}`,
      });
    }
  }

  const dateEmmit = new Date(subscription.get().updated_at);

  const detailsPayment = await DetailPayment.findAll({
    where: { payment_id: payment.get().id },
  });

  detailsPayment.length > 0 &&
    Promise.all(
      detailsPayment.map(async (detail) => {
        await PurchasedProduct.create({
          subscription_id: subscription.get().id,
          units: detail.get().units,
          price_unit: detail.get().price_unit,
          subtotal: detail.get().subtotal,
          tax: detail.get().tax,
          iva: detail.get().iva,
          total: detail.get().total,
          product: detail.get().item,
        });
      })
    );

  // send email payment
  await sendEmail(
    'We-u',
    [data.email],
    'Detalle de pago',
    `Detalle de pago`,
    emailPayment({
      name: data.full_name,
      identification: data.identification,
      numOrden: payment.get().num_order,
      total: payment.get().total,
      subtotal: payment.get().subtotal,
      detail: payment.get().detail,
      detailsPayment: detailsPayment,
      iva: payment.get().iva,
      date: `${dateEmmit.getDate()}/${dateEmmit.getMonth() + 1}/${dateEmmit.getFullYear()}`,
    })
  );

  // Create success message
  const msg = paymentMethod === PaymentMethod.creditCard ? `Muchas gracias ${data.full_name} por elegir We-u.` : `Muchas gracias ${data.full_name} por elegir We-u. Espera que el Administrador revise el comprobante de transferencia y acepte tu pago`;

  // Return success response
  return customResponse(true, res, 200, msg, undefined);
};

/**
 * Generates a new payment for a subscription.
 *
 * @param {Object} data - Data to create the payment.
 * @param {number} data.paymentMethod - The payment method id.
 * @param {number} data.subtotal - The subtotal of the payment.
 * @param {number} data.subscriptionId - The subscription id.
 * @param {string} data.detailPayment - The detail of the payment.
 * @return {Promise<Payment>} The created payment.
 */
const postPayment = async ({ paymentMethod, amounts, subscriptionId, detailPayment, cod_transaction_payment }: { paymentMethod: number; amounts: { units_asc?: number; units_subzones?: number }; subscriptionId: number; detailPayment: string; cod_transaction_payment?: string }) => {
  // Find last payment to generate the serial number
  const num_order = await Payment.findAll({
    attributes: ['id', 'num_order'],
    order: [['created_at', 'DESC']],
    limit: 1,
  });

  const detail: {
    units: number;
    price_unit: number;
    subtotal: number;
    iva: number;
    total: number;
    item: string;
  }[] = [];

  if (amounts.units_asc) {
    const subtotalAsc = ARTICULES.asc.price * amounts.units_asc;
    detail.push({
      units: amounts.units_asc,
      price_unit: ARTICULES.asc.price,
      subtotal: subtotalAsc,
      iva: subtotalAsc * Taxes.IVA,
      total: subtotalAsc + subtotalAsc * Taxes.IVA,
      item: ARTICULES.asc.description,
    });
  }

  if (amounts.units_subzones) {
    const subtotalSubzone = ARTICULES.subzone.price * amounts.units_subzones;
    detail.push({
      units: amounts.units_subzones,
      price_unit: ARTICULES.subzone.price,
      subtotal: subtotalSubzone,
      iva: subtotalSubzone * Taxes.IVA,
      total: subtotalSubzone + subtotalSubzone * Taxes.IVA,
      item: ARTICULES.subzone.description,
    });
  }

  const subtotal = detail.map((item) => item.subtotal).reduce((a, b) => a + b, 0);

  // Generate serial number for the new payment
  const serial = generateSerialNumber(num_order.length > 0 ? num_order[0].get().num_order : null);

  // Calculate the IVA from the subtotal
  const calcIva = subtotal * Taxes.IVA;

  const parsedSubtotal = parseFloat(subtotal.toFixed(2));
  const parsedCalcIva = parseFloat(calcIva.toFixed(3));
  const calcTotal = parsedSubtotal + parsedCalcIva;
  const parsedTotal = parseFloat(calcTotal.toFixed(2));

  // Create the new payment
  const payment = await Payment.create({
    num_order: serial,
    payment_method: paymentMethod,
    cod_transaction_payment: paymentMethod === PaymentMethod.creditCard ? cod_transaction_payment : null,
    subscription_id: subscriptionId,
    subtotal: parsedSubtotal,
    iva: parsedCalcIva,
    total: parsedTotal,
    created_at: new Date(),
    detail: detailPayment,
  });

  if (detail) {
    await Promise.all(
      detail.map(
        async (item) =>
          await DetailPayment.create({
            payment_id: payment.get().id,
            tax: Taxes.IVA,
            units: item.units,
            price_unit: parseFloat(item.price_unit.toFixed(2)),
            subtotal: parseFloat(item.subtotal.toFixed(2)),
            iva: item.iva,
            total: parseFloat(item.total.toFixed(2)),
            item: item.item,
          })
      )
    );
  }

  // Return the created payment
  return payment;
};
/**
 * Create a new payment for a subscription
 *
 * @param {Object} data - The data required to create the payment
 * @param {number} data.paymentMethod - The payment method
 * @param {number} data.total - The total amount of the payment
 * @param {number} data.subscriptionId - The ID of the subscription
 * @param {string} data.cod_transaction_payment - The code of the transaction payment
 * @param {string} data.detailPayment - The detail of the payment
 * @returns {Promise<Payment>} The created payment
 */
const postPaymentSubscriptionMonthly = async ({ paymentMethod, total, subscriptionId, cod_transaction_payment, detailPayment }: { paymentMethod: number; total: number; subscriptionId: number; cod_transaction_payment?: string; detailPayment: string }) => {
  // Find last payment to generate the serial number
  const num_order = await Payment.findAll({
    attributes: ['id', 'num_order'],
    order: [['created_at', 'DESC']],
    limit: 1,
  });

  // calculate the subtotal
  const subtotal = total / (1 + Taxes.IVA);
  // Calculate the IVA from the subtotal
  const calcIva = subtotal * Taxes.IVA;

  // Round the values to 2 decimal places
  const parsedSubtotal = parseFloat(subtotal.toFixed(2));
  const parsedCalcIva = parseFloat(calcIva.toFixed(2));
  const calctotal = parsedSubtotal + parsedCalcIva;
  const parsedTotal = parseFloat(calctotal.toFixed(2));

  // Generate serial number for the new payment
  const serial = generateSerialNumber(num_order.length > 0 ? num_order[0].get().num_order : null);

  // Create the new payment
  const payment = await Payment.create({
    num_order: serial,
    payment_method: paymentMethod,
    cod_transaction_payment: paymentMethod === PaymentMethod.creditCard ? cod_transaction_payment : null,
    subscription_id: subscriptionId,
    subtotal: parsedSubtotal,
    iva: parsedCalcIva,
    total: parsedTotal,
    created_at: new Date(),
    detail: detailPayment,
  });

  await DetailPayment.create({
    payment_id: payment.get().id,
    tax: Taxes.IVA,
    units: 1,
    price_unit: parsedSubtotal,
    subtotal: parsedSubtotal,
    iva: parsedCalcIva,
    total: parsedTotal,
    item: detailPayment,
  });

  // Return the created payment
  return payment;
};

/**
 * Create a user with the role ASC
 *
 * @param req - The request object containing the user data
 * @param res - The response object used to send the HTTP response
 */
export const createUserASC = async (req: Request, res: Response) => {
  // Destructure the required data from the request body
  const { data, email, full_name, identification, phone, type_asc_id, avatar, subzone_id } = req.body;

  // Check if the user's role is not a subscriber
  if (data.role_id !== UserRoles.Subscriber) {
    return customResponse(false, res, 401, 'Acceso denegado', null);
  }

  // Find the user's subscription
  const subscription = await Subscription.findOne({ attributes: ['id', 'num_asc'], where: { user_id: data.id, state: 1, is_deleted: 0 } });

  // Check if the user has a subscription
  if (!subscription) {
    return customResponse(false, res, 401, 'Subscripción no encontrada', null);
  }

  // Find all ASC subscribers for the current user
  const ascSubscribers = await AscSubscriber.findAll({
    where: { subscriber_id: data.id },
    attributes: ['id'],
  });

  // Check if the user already has ASC according to the subscription
  if (ascSubscribers.length >= subscription.get().num_asc) {
    return customResponse(false, res, 400, 'Ya no puedes crear más Agentes de seguridad ciudadanos, en tu suscripción ', null);
  }

  // Get the photo profile from the request files
  const photo_profile = req.files?.photo_profile;

  if (photo_profile) {
    if (photo_profile instanceof Array === true) {
      return customResponse(false, res, 400, 'Solo puede subir un archivo', null);
    }
  }

  // Check if a user with the same email already exists
  const userPivote = await User.findOne({ where: { email: email, is_active: 1, is_deleted: 0 } });

  if (userPivote) {
    return customResponse(false, res, 400, `Un usuario con este '${email}' ya existe`, null);
  }

  // Find the subzone by id
  const subzone = await Subzone.findOne({
    attributes: ['id'],
    where: { id: subzone_id, subs_id: data.subscription.id, state: 1, is_deleted: 0 },
  });

  // Check if the subzone exists
  if (!subzone) {
    return customResponse(false, res, 400, 'No se encuentra la subzona', null);
  }

  const passEncript = await generatePassword(identification.trim());

  // Create a new user with the ASC role and provided data
  const user = await User.create({
    password: passEncript,
    email: email.trim(),
    full_name,
    identification,
    phone,
    role_id: UserRoles.ASC,
    type_asc_id,
    is_active: 1,
    zone_id: data.zone_id,
    subzone_id: subzone.get().id,
  });

  // If the user is created successfully
  if (user) {
    if (photo_profile) {
      // Save the user's photos
      const nameFile = `${identification}_${generateFileName()}`;
      await savePhotosCreateUser({ identification: nameFile, photo_profile });
      const extension = getExtension(photo_profile);
      // Update the user's photo profile if provided
      await user.update({
        photo_profile: photo_profile ? `photo_profile_${nameFile}.${extension}` : null,
      });
    } else {
      if (avatar) await user.update({ photo_profile: avatar });
    }
  }

  // Create a new ASC subscriber
  await AscSubscriber.create({
    subscriber_id: data.id,
    asc_id: user.get().id,
    subzone_id: subzone.get().id,
  });

  await sendEmail('We-u', [email], 'Bienvenido a WEU', `Bienvenido a WEU`, emailASCSubZone(user.get().full_name, data.full_name, email, identification));

  // Send a success response with the created user's ID
  customResponse(true, res, 200, 'Usuario creado correctamente', { id: user.get().id });
};

/**
 * Get the user's payments
 *
 * @param req - The request object
 * @param res - The response object
 * @returns A promise that resolves to void
 */
export async function getMyPayments(req: Request, res: Response) {
  const { data } = req.body;
  const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

  // Check if the user has the subscriber role
  if (data.role_id !== UserRoles.Subscriber) {
    return customResponse(false, res, 401, 'No tiene permisos para realizar esta petición', null);
  }

  // Find the user's subscription
  const subscription = await Subscription.findOne({
    attributes: { exclude: ['created_at', 'is_deleted', 'updated_at'] },
    where: { user_id: data.id, is_deleted: 0 },
  });

  // If the subscription is not found, return an error response
  if (!subscription) {
    return customResponse(false, res, 401, 'Suscripción no encontrada', null);
  }

  // Find the payments related to the subscription
  const payments = await Payment.findAndCountAll({
    where: { subscription_id: subscription.get().id },
    attributes: { exclude: ['subscription_id', 'cod_transaction_payment'] },
    include: [
      {
        model: DetailPayment,
        attributes: { exclude: ['created_at', 'is_deleted', 'updated_at', 'payment_id', 'is_active'] },
      },
    ],
    order: [['created_at', 'DESC']],
    offset: offset,
    limit: limit,
  });

  // Set the photo_ticket with SignedUrlGCS
  subscription.get().photo_ticket = subscription.get().photo_ticket ? await generateSignedUrlGCS(subscription.get().photo_ticket, 'vouchers') : '';

  // Set the voucher with SignedUrlGCS
  for (const payment of payments.rows) {
    payment.get().voucher = payment.get().voucher ? await generateSignedUrlGCS(payment.get().voucher, 'vouchers') : '';
  }

  // Return a success response with the subscription and payments
  return customResponse(true, res, 200, 'Pagos encontrados', payments);
}

/**
 * Update the subzone associated with an ASC by its ID.
 *
 * @param {Request} req - The request object containing the data, asc_id, and subzone_id in the body.
 * @param {Response} res - The response object used to send back the custom response.
 * @returns {Promise<void>} A promise that resolves when the subzone is updated.
 */
export const updateSubzoneByAscId = async (req: Request, res: Response): Promise<void> => {
  const { data, asc_id, subzone_id } = req.body;

  // Check if the user has the subscriber role
  if (data.role_id !== UserRoles.Subscriber) {
    return customResponse(false, res, 401, 'No tiene permisos para realizar esta petición', null);
  }

  // Find the ASC by ID and check it's active and not deleted
  const asc = await User.findOne({
    where: { id: asc_id, is_deleted: 0, is_active: 1, role_id: UserRoles.ASC },
    attributes: ['id', 'subzone_id'],
  });

  // If the ASC does not exist, return a 404 response
  if (!asc) {
    return customResponse(false, res, 404, `No existe el ASC`, null);
  }

  // Find the ASC subscriber relationship
  const ascSubscriber = await AscSubscriber.findOne({
    where: {
      asc_id: asc.get().id,
      subscriber_id: data.id,
    },
  });

  // If the ASC subscriber relationship does not exist, return a 404 response
  if (!ascSubscriber) {
    return customResponse(false, res, 404, `No existe el ASC`, null);
  }

  // Find the subzone by ID and check it's active and not deleted
  const subzone = await Subzone.findOne({
    where: {
      id: subzone_id,
      subs_id: data.subscription.id,
      is_deleted: 0,
      state: 1,
    },
    attributes: ['id'],
  });

  // If the subzone does not exist, return a 404 response
  if (!subzone) {
    return customResponse(false, res, 404, `No existe la subzona`, null);
  }

  // Update the ASC's subzone ID
  await asc.update({ subzone_id: subzone.get().id });

  // Return a success response indicating that the subzone was updated
  return customResponse(true, res, 200, 'Subzona actualizada', asc);
};
