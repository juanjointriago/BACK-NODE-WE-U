import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from '../config/config';

const accountSid = TWILIO_ACCOUNT_SID;
const authToken = TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

/**
 * Sends an SMS message using the Twilio API.
 * @param {string} msg - The message content.
 * @param {string} to - The recipient's phone number.
 */
export const sendSMS = ({ msg, to }: { msg: string; to: string }) => {
  // Create a new Twilio message with the provided content and recipient
  client.messages
    .create({
      body: msg,
      from: '+19082064434',
      to: `+593${to.slice(1)}`,
    })
    .then((message: any) => console.log(message.sid))
    .catch((error: any) => console.error(error));
};
