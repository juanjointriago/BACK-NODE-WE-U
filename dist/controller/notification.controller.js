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
exports.sendNotificationExpoUser = exports.saveNotificationToAdminSocket = exports.deleteAllNotification = exports.deleteNotification = exports.putViewedNotification = exports.getNotificationById = exports.getNotifications = void 0;
const customResponses_1 = require("../helpers/customResponses");
const user_model_1 = __importDefault(require("../models/user.model"));
const Notification_model_1 = __importDefault(require("../models/Notification.model"));
const expo_server_sdk_1 = require("expo-server-sdk");
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        const notifications = yield Notification_model_1.default.findAll({
            where: {
                receiver_id: data.id,
                is_deleted: 0,
            },
            attributes: { exclude: ['updatedAt', 'is_deleted', 'receiver_id', 'sender_id', 'updated_at'] },
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: user_model_1.default,
                    as: 'sender',
                    attributes: ['id', 'full_name', 'photo_profile'],
                },
            ],
        });
        if (notifications.length === 0)
            return (0, customResponses_1.customResponse)(true, res, 200, 'No tiene notificaciones', []);
        (0, customResponses_1.customResponse)(true, res, 200, 'Notificaciones', notifications);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.getNotifications = getNotifications;
const getNotificationById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = yield Notification_model_1.default.findOne({
            where: {
                id,
            },
            attributes: { exclude: ['updatedAt', 'is_deleted', 'receiver_id', 'sender_id', 'updated_at'] },
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: user_model_1.default,
                    as: 'sender',
                    attributes: ['id', 'full_name', 'photo_profile'],
                },
            ],
        });
        if (!notification)
            return null;
        return notification.toJSON();
    }
    catch (error) {
        console.error('---->', error);
        return null;
    }
});
exports.getNotificationById = getNotificationById;
const putViewedNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, idNotification } = req.body;
        const notification = yield Notification_model_1.default.findOne({
            where: {
                id: idNotification,
                receiver_id: data.id,
                is_deleted: 0,
            },
            attributes: ['id'],
        });
        if (!notification)
            return (0, customResponses_1.customResponse)(false, res, 404, 'No existe la notificación', null);
        yield notification.update({ viewed: 1 });
        (0, customResponses_1.customResponse)(true, res, 200, 'Notificaciones vista', notification);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.putViewedNotification = putViewedNotification;
const deleteNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, idNotification } = req.body;
        const notification = yield Notification_model_1.default.findOne({
            where: {
                id: idNotification,
                receiver_id: data.id,
                is_deleted: 0,
            },
            attributes: ['id'],
            order: [['created_at', 'DESC']],
        });
        if (!notification)
            return (0, customResponses_1.customResponse)(false, res, 404, 'Notification does not exist', null);
        yield notification.update({ is_deleted: 1 });
        (0, customResponses_1.customResponse)(true, res, 200, 'Notification deleted ', notification);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.deleteNotification = deleteNotification;
const deleteAllNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = req.body;
        const notifications = yield Notification_model_1.default.findAll({
            where: {
                receiver_id: data.id,
            },
            attributes: ['id'],
        });
        Promise.all(notifications.map((item) => __awaiter(void 0, void 0, void 0, function* () { return item.destroy(); })));
        (0, customResponses_1.customResponse)(true, res, 200, 'Notificaciones eliminadas ', null);
    }
    catch (error) {
        console.error('---->', error);
        (0, customResponses_1.badResponse)(res);
    }
});
exports.deleteAllNotification = deleteAllNotification;
const saveNotificationToAdminSocket = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newNotification = yield Notification_model_1.default.create({
            receiver_id: data.receiverId,
            sender_id: data.senderId,
            title: data.title,
            body: data.body,
            data: data.data,
            type: data.type,
        });
        const notification = yield (0, exports.getNotificationById)(newNotification.get().id);
        return { ok: true, data: notification };
    }
    catch (error) {
        console.error('---->', error);
        return { ok: false, data: null };
    }
});
exports.saveNotificationToAdminSocket = saveNotificationToAdminSocket;
const sendNotificationExpoUser = ({ expoToken, message, title, subtitle, data }) => {
    let expo = new expo_server_sdk_1.Expo();
    let messages = [];
    if (!expo_server_sdk_1.Expo.isExpoPushToken(expoToken)) {
        console.error(`Push token ${expoToken} is not a valid Expo push token`);
    }
    console.log(expoToken);
    messages.push({
        to: expoToken,
        title: title,
        subtitle: subtitle,
        body: message,
        data: data,
    });
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    (() => __awaiter(void 0, void 0, void 0, function* () {
        for (let chunk of chunks) {
            try {
                let ticketChunk = yield expo.sendPushNotificationsAsync(chunk);
                console.log(ticketChunk);
                tickets.push(...ticketChunk);
            }
            catch (error) {
                console.error('err==>', error);
            }
        }
    }))();
};
exports.sendNotificationExpoUser = sendNotificationExpoUser;
//# sourceMappingURL=notification.controller.js.map