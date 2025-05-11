import { Request, Response } from 'express';
import { badResponse, customResponse } from '../helpers/customResponses';
import User from '../models/user.model';
import { Op } from 'sequelize';
import Notification from '../models/Notification.model';
import { INotification, ISendNotificationExpoUser } from '../interfaces/notification.interfaces';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    const notifications = await Notification.findAll({
      where: {
        receiver_id: data.id,
        is_deleted: 0,
      },
      attributes: { exclude: ['updatedAt', 'is_deleted', 'receiver_id', 'sender_id', 'updated_at'] },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'full_name', 'photo_profile'],
        },
      ],
    });

    if (notifications.length === 0) return customResponse(true, res, 200, 'No tiene notificaciones', []);

    customResponse(true, res, 200, 'Notificaciones', notifications);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};
export const getNotificationById = async (id: number) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id,
      },
      attributes: { exclude: ['updatedAt', 'is_deleted', 'receiver_id', 'sender_id', 'updated_at'] },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'full_name', 'photo_profile'],
        },
      ],
    });

    if (!notification) return null;

    return notification.toJSON();
  } catch (error) {
    console.error('---->', error);
    return null;
  }
};

export const putViewedNotification = async (req: Request, res: Response) => {
  try {
    const { data, idNotification } = req.body;

    const notification = await Notification.findOne({
      where: {
        id: idNotification,
        receiver_id: data.id,
        is_deleted: 0,
      },
      attributes: ['id'],
    });

    if (!notification) return customResponse(false, res, 404, 'No existe la notificación', null);

    await notification.update({ viewed: 1 });

    customResponse(true, res, 200, 'Notificaciones vista', notification);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { data, idNotification } = req.body;

    const notification = await Notification.findOne({
      where: {
        id: idNotification,
        receiver_id: data.id,
        is_deleted: 0,
      },
      attributes: ['id'],
      order: [['created_at', 'DESC']],
    });

    if (!notification) return customResponse(false, res, 404, 'Notification does not exist', null);

    await notification.update({ is_deleted: 1 });

    customResponse(true, res, 200, 'Notification deleted ', notification);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const deleteAllNotification = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    const notifications = await Notification.findAll({
      where: {
        receiver_id: data.id,
      },
      attributes: ['id'],
    });

    Promise.all(notifications.map(async (item) => item.destroy()));

    customResponse(true, res, 200, 'Notificaciones eliminadas ', null);
  } catch (error) {
    console.error('---->', error);
    badResponse(res);
  }
};

export const saveNotificationToAdminSocket = async (data: INotification) => {
  try {
    const newNotification = await Notification.create({
      receiver_id: data.receiverId,
      sender_id: data.senderId,
      title: data.title,
      body: data.body,
      data: data.data,
      type: data.type,
    });

    const notification = await getNotificationById(newNotification.get().id);

    return { ok: true, data: notification };
  } catch (error) {
    console.error('---->', error);
    return { ok: false, data: null };
  }
};

export const sendNotificationExpoUser = ({ expoToken, message, title, subtitle, data }: ISendNotificationExpoUser) => {
  let expo = new Expo();
  let messages: ExpoPushMessage[] = [];

  if (!Expo.isExpoPushToken(expoToken)) {
    console.error(`Push token ${expoToken} is not a valid Expo push token`);
  }

  console.log(expoToken)

  messages.push({
    to: expoToken,
    title: title,
    subtitle: subtitle,
    body: message,
    data: data,
  });

  let chunks = expo.chunkPushNotifications(messages);

  let tickets = [];
  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('err==>', error);
      }
    }
  })();
};
