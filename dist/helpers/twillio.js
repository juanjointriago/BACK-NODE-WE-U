"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = void 0;
const config_1 = require("../config/config");
const accountSid = config_1.TWILIO_ACCOUNT_SID;
const authToken = config_1.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
/**
 * Sends an SMS message using the Twilio API.
 * @param {string} msg - The message content.
 * @param {string} to - The recipient's phone number.
 */
const sendSMS = ({ msg, to }) => {
    // Create a new Twilio message with the provided content and recipient
    client.messages
        .create({
        body: msg,
        from: '+19082064434',
        to: `+593${to.slice(1)}`,
    })
        .then((message) => console.log(message.sid))
        .catch((error) => console.error(error));
};
exports.sendSMS = sendSMS;
//# sourceMappingURL=twillio.js.map