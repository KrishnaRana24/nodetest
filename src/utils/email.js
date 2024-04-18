const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  //1.create transpoter

  // const transport = nodemailer.createTransport({
  //   host: "sandbox.smtp.mailtrap.io",
  //   port: 2525,
  //   auth: {
  //     user: "b7c1ec6cd7cbcb",
  //     pass: "5b7b417e7b58b5",
  //   },
  // });
  const transpoter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //define email option
  const mailOption = {
    from: "admin <admin@gmail.com>",
    to: option.email,
    subject: option.subject,
    text: option.message,
  };
  //actually end the mail
  await transpoter.sendMail(mailOption);
};

module.exports = sendEmail;
