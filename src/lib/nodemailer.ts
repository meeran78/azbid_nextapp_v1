import nodemailer from "nodemailer";

const rejectUnauthorized =
  process.env.NODEMAILER_TLS_REJECT_UNAUTHORIZED !== "false";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized,
  },
});

export default transporter;