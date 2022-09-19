import { NextFunction, Response } from "express";
import { ERRORS } from "../const/errors";
import { Permission, PermissionEnum } from "../models/permissions.model";
import { User } from "../models/User.model";

import { IExtendedRequest } from "../types";
import { DefaultError } from "../utils/DefaultError";

export const permissionToChangeUsers = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const updatedUser = await User.findById(id);
    if (!updatedUser) {
      return res
        .status(404)
        .send(DefaultError.generate(404, ERRORS.MONGO.USER_NOT_FOUND));
    }

    const permissionType = await Permission.findById(
      req.context?.data.permission
    );

    const isUserAuthorizedToChange =
      updatedUser._id.toString() === req.context?.data._id ||
      permissionType?.permission === PermissionEnum.Admin;

    if (!isUserAuthorizedToChange) {
      return res
        .status(403)
        .send(DefaultError.generate(403, ERRORS.MONGO.UNAUTHORIZED));
    }
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).send(DefaultError.generate(500, error.message));
    }
  }
  next();
};
