const nodemailer = require("nodemailer");
const mailgunTransport = require("nodemailer-mailgun-transport");

const mailgunOptions = {
  auth: {
    api_key: process.env.MAILGUN_ACTIVE_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  }
};

console.log(mailgunOptions);
const transport = mailgunTransport(mailgunOptions);

// EmailService
class EmailService {
  constructor() {
    this.emailClient = nodemailer.createTransport(transport);
  }
  sendMail(to, subject, html) {
    return new Promise((resolve, reject) => {
      this.emailClient.sendMail(
        {
          from: '"Zeedle" <youraccount@zeedle.civrays.com>',
          to,
          subject,
          html
        },
        (err, info) => {
          if (err) {
            reject(err);
          } else {
            resolve(info);
          }
        }
      );
    });
  }
}

module.exports = new EmailService();
