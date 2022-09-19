import config, { IConfig } from "config";
import nodemailer, { createTransport, Transporter } from "nodemailer";
import mustache from "mustache";

import LOCALES from "../const/locales";
import { Config } from "../types";
import { getTemplate, Templates } from "../utils/templates";

const {
  EMAIL: { HOST, PORT, USER, PASSWORD, FROM_ADDRESS }
} = config as Config & IConfig;

export default class MailerService {
  private static transporter: Transporter = createTransport({
    host: HOST,
    port: PORT,
    auth: {
      user: USER,
      pass: PASSWORD
    }
  });

  static async registerMessage(to: string, userCallName: string) {
    const registerTemplate=await getTemplate(Templates.REGISTER_EMAIL)

    await this.transporter.sendMail({
      to,
      from: FROM_ADDRESS,
      subject: LOCALES.en.email.register,
      html: mustache.render(registerTemplate?.toString('utf-8'), {
        userCallName
      })
    });
  }

  static async forgotPasswordMessage(
    to: string,
    resetObject: { resetText: string; resetURL: string }
  ) {
    const forgotTemplate = await getTemplate(Templates.FORGOT_PASSWORD_EMAIL);
    return this.transporter.sendMail({
      to,
      from: FROM_ADDRESS,
      subject:LOCALES.en.email.forgot,
      html: mustache.render(forgotTemplate.toString("utf-8"), {
        resetLinkText: resetObject.resetText,
        resetLinkURL: resetObject.resetURL
      })
    });
  }

}
