import { MailtrapClient } from "mailtrap"
import dotenv from 'dotenv'

dotenv.config()

export const mailtrapClient = new MailtrapClient({ token: process.env.MAILTRAP_TOKEN });

export const sender = {
    email: "hello@luismartinez.tech",
    name: "Mailtrap Test",
};
// const recipients = [
//     {
//         email: "luislamm09@gmail.com",
//     }
// ];

// client
//     .send({
//         from: sender,
//         to: recipients,
//         subject: "You are awesome!",
//         text: "Congrats for sending test email with Mailtrap!",
//         category: "Integration Test",
//     })
//     .then(console.log, console.error);