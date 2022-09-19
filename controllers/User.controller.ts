import { Request, Response } from "express";
import config, { IConfig } from "config";
import jwt from "jwt-promisify";
import nodemailer from 'nodemailer'

import { ERRORS } from "../const/errors";
 
import { User } from "../models/User.model";
import { Config } from "../types/config";

import { IExtendedRequest } from "../types";
import { Permission } from "../models/permissions.model";
import { ObjectId } from "mongodb";
import { DefaultError } from "../utils/DefaultError";
import MailerService from "../services/Mailer.service"
import { getLocalURL } from "../utils/url";
import { RESPONSES } from "../const/responses";

const { JWT_SECRET, JWT_EXPIRY_TIME } = config as Config & IConfig;

export default class UserController {
  static async register(req: Request, res: Response) {
    try {
      const permission = await Permission.findOne({ permission: "user" });
      if (permission) {
        const newUser = new User({
          ...req.body,
          permission: permission?._id,
          createdAt: new Date(Date.now())
        });

      MailerService.registerMessage(req.body.email, req.body.email)

        await newUser.save();
        res.status(201).send(RESPONSES.REGISTER_SUCCES);
      } else {
        res.status(400).send(ERRORS.MONGO.SOMETHING_WENT_WRONG);
      }
    } catch (error) {
      
      if (error instanceof Error) {

        if (error.message.includes("email")) {
          return res.status(409).send(ERRORS.MONGO.DUPLICATE_EMAIL);
        }       

        if (error.message.includes("E11000")) {
          return res.status(409).send(ERRORS.MONGO.DUPLICATE_USERNAME)
        }
        
        if (error.message.includes("User validation failed: age:")) {
          return res.status(400).send(ERRORS.MONGO.AGE_VALIDATION);
        }

        if (error.message.includes("User validation failed")) {
          return res.status(400).send(error.message);
        }
  
        res.status(500).send(error.message);
      }
    }
  }

  static async login(req: Request, res: Response) {
    const { username, password } = req.body;
    try {
      const matchedUser = await User.findOne({ username });
      //@ts-ignore
      if (!matchedUser || !(await matchedUser.authenticate(password))) {
        res.status(400).send(ERRORS.MONGO.BAD_LOGIN);
        return;
      }

      const generatedJwt = await jwt.sign(
        {
          _id: matchedUser._id,
          permission: matchedUser.permission
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY_TIME }
      );

      res
        .status(200)
        .cookie("token", generatedJwt)
        .send({ _id: matchedUser._id, token: generatedJwt });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).send(DefaultError.generate(500, error.message));
      }
    }
  }

  static async getAllUsers(req: IExtendedRequest, res: Response) {
    const id = req.context?.data.permission;
    let permissionType = await Permission.findById(id);
    let users;
    try {
      if (permissionType?.permission === "admin") {
        users = await User.find({ active: true });

        res.status(201).send(users);
      } else {
        res.status(403).send("UNAUTHORIZED");
      }
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).send(DefaultError.generate(400, error.message));
      }
    }
  }

  static async getUserById(req: IExtendedRequest, res: Response) {
    const { id } = req.params;
    const permissionId = req.context?.data.permission;

    const userPermission = await Permission.findById(permissionId);
    let user;

    try {
      if (userPermission?.permission === "admin") {
        user = await User.findById(id);
        res.status(201).send(user);
      } else {
        user = await User.find({
          _id: id,
          permission: new ObjectId(permissionId)
        });
        if (user.length === 0) {
          return res.status(404).send(ERRORS.MONGO.USER_NOT_FOUND);
        }
       res.status(201).send(user)
      }
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).send(DefaultError.generate(400, error.message));
      }
    }
  }

  static async updateUserById(req: IExtendedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updatedUser = await User.findByIdAndUpdate(id, req.body, {
        new: true,
        updatedAt: new Date(Date.now())
      });

      res.status(200).send(updatedUser);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).send(DefaultError.generate(400, error.message));
      }
    }
  }

  static async updatePassword(req: IExtendedRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (user) {
        user.password = req.body.password;
        user.updatedAt = new Date(Date.now());
        await user.save();
        res.status(200).send(user);
      } else {
        res.status(404).send(ERRORS.MONGO.USER_NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).send(DefaultError.generate(400, error.message));
      }
    }
  }

  static async deleteUserById(req: IExtendedRequest, res: Response) {
    try {
      const { id } = req.params;
      const deletedUser = await User.findById(id).select("-active");
      await deletedUser?.update({ active: false });
      res.status(200).send(deletedUser);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).send(DefaultError.generate(400, error.message));
      }
    }
  }

  static async triggerForgotPassword(req: Request, res: Response) {
    const resetURL = `${getLocalURL(req)}/api/user/forgotPassword/`;
    const { email: resetEmail } = req.body;
    try {

        const userToReset = await User.findOne({ email: resetEmail });
        if (userToReset) {
            userToReset.generateResetPasswordToken();
            await userToReset.save()
            await MailerService.forgotPasswordMessage(resetEmail, { resetText: "Click this link", resetURL: `${resetURL}${userToReset.resetPasswordToken}` });
          }
     
    } catch (error) {
        console.error(error);
    } finally {
        res
            .status(200)
            .send("Forgot password email was sent ");
    }
}

static async forgotPasswordLanding(req: Request, res: Response) {

  const isResetTokenValid = await User.findOne({
      resetPasswordToken: req.params.resetToken,
      resetPasswordTokenExpiryDate: { "$gte": Date.now() }
  });

  if (!isResetTokenValid) {
      return res.status(400).send(ERRORS.MONGO.LINK_INVALID);
  }

  res.send(`
      <html>
          <form method="post">
              <label>Password</label><input name="newPassword">
              <button>Confirm</button>
          </form>
      </html>
  `)
}

static async resetPassword(req: Request, res: Response) {
  const userToReset = await User.findOne({
      resetPasswordToken: req.params.resetToken,
      resetPasswordTokenExpiryDate: { "$gte": Date.now() }
  });

  if (!userToReset) {
      return res.status(400).send(ERRORS.MONGO.LINK_INVALID);
  }

  try {
      userToReset.password = req.body.newPassword;
      await userToReset.save();
      res.status(201).send(RESPONSES.PASSWORD_RESET)
  } catch (error) {
      res.status(400).send(error);
  }

}
  
}
