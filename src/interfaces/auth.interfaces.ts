import { Model } from "sequelize";

export interface IPhotosUser {
  identification: string;
  photo_home?: any;
  photo_id_back?: any;
  photo_id_front?: any;
  photo_profile?: any;
  photo_ticket?: any;
}

export interface UserPaymentInfo {
  name: string;
  identification: string;
  numOrden: string;
  subtotal: number;
  total: number;
  iva: number;
  detail: string;
  date: string;
  dateUntil?: string;
  paymentMethod?: number;
  detailsPayment?: Model<any, any>[];
}
