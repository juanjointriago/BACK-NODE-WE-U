export interface INotification {
  receiverId: number;
  title: string;
  body: string;
  type: number;
  senderId?: number;
  data?: string;
}

export interface ISendNotificationExpoUser {
  expoToken: any;
  message: string;
  title?: string;
  subtitle?: string;
  data?: Object;
}

