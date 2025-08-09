/* eslint-disable @typescript-eslint/no-explicit-any */
import nodeMailer from "nodemailer";
import { envVars } from "../config/env";
import path from "node:path";
import ejs from "ejs";
import AppError from "../errorHelpers/appError";
const transporter = nodeMailer.createTransport({
  secure: true,
  auth: {
    user: envVars.SMTP_USER,
    pass: envVars.SMTP_PASS,
  },
  host: envVars.SMTP_HOST,
  port: Number(envVars.SMTP_PORT),
});

interface sendEmailOptions {
  to: string;
  subject: string;
  templateData?: Record<string, any>;
  templateName?: string;
  attachments?: [
    {
      filename: string;
      content: Buffer | string;
      contentType: string;
    }
  ];
}
export const sendEmail = async ({
  to,
  templateData,
  subject,
  attachments,
  templateName,
}: sendEmailOptions) => {
  try {
    const templatePath = path.join(__dirname, `templates/${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData);
    const info = await transporter.sendMail({
      from: envVars.SMTP_FROM,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });
    console.log(`\u2709\uFE0F Email sent to ${to}: ${info.messageId}`);
  } catch (error: any) {
    console.log(`Email sending error ${error.message}`);
    throw new AppError(401, "Email error");
  }
};
