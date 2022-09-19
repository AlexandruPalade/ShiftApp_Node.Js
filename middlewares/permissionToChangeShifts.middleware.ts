import { NextFunction, Response } from "express";
import { ERRORS } from "../const/errors";
import { Permission, PermissionEnum } from "../models/permissions.model";
import { Shift } from "../models/shift.model";

import { IExtendedRequest } from "../types";
import { DefaultError } from "../utils/DefaultError";

export const permissionToChangeShifts = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const updatedShift = await Shift.findById(id);
    if (!updatedShift || updatedShift.active===false) {
      return res
        .status(404)
        .send(DefaultError.generate(404, ERRORS.MONGO.SHIFT_NOT_FOUND));
    }

    const permissionType = await Permission.findById(
      req.context?.data.permission
    );

    const isUserAuthorizedToChange =
      updatedShift.userId?.toString() === req.context?.data._id ||
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
