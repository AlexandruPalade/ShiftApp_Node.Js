import { NextFunction, Response } from "express";
import { Permission, PermissionEnum } from "../models/permissions.model";
import { Comment } from "../models/comment.model";

import { IExtendedRequest } from "../types";
import { DefaultError } from "../utils/DefaultError";
import { ERRORS } from "../const/errors";

export const permissionToChangeComments = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const updatedComment = await Comment.findById(id);
    if (!updatedComment) {
      return res
        .status(404)
        .send(DefaultError.generate(404, ERRORS.MONGO.COMMENT_NOT_FOUND));
    }

    const permissionType = await Permission.findById(
      req.context?.data.permission
    );

    const isUserAuthorizedToChange =
      updatedComment?.createdBy?.toString() === req.context?.data._id ||
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
