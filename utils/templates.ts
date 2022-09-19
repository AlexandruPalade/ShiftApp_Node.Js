import path from "path";
import fse from "fs-extra";

export enum Templates {
  REGISTER_EMAIL,
  FORGOT_PASSWORD_EMAIL
}

const pathToTemplates = path.resolve("templates");
const pathToEmailTemplates = path.join(pathToTemplates, "email");

export const getTemplate = async (template: Templates) => {
  switch (template) {
    case Templates.REGISTER_EMAIL:
      return fse.readFile(
        path.join(pathToEmailTemplates, "register.html.mustache")
      );
      break;

    case Templates.FORGOT_PASSWORD_EMAIL:
      return fse.readFile(
        path.join(pathToEmailTemplates, "forgotPassword.html.mustache")
      );

      break;

    default:
      return "";
      break;
  }
};
