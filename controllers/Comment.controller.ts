import { Response } from "express";
import { IExtendedRequest } from "../types";

import { Comment } from "../models/comment.model";
import { Permission } from "../models/permissions.model";
import { ObjectId } from "mongodb";
import { DefaultError } from "../utils/DefaultError";
import { ERRORS } from "../const/errors";

export default class CommentController {
  static async createComment(req: IExtendedRequest, res: Response) {
    try {
      const userId = req.context?.data._id;
      const newComment = new Comment({
        ...req.body,
        createdBy: userId,
        createAt: new Date(Date.now())
      });

      await newComment.save();
      res.status(201).send(newComment);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).send(DefaultError.generate(400, error.message));
      }
    }
  }

  static async getAllComments(req: IExtendedRequest, res: Response) {
    const id = req.context?.data.permission;

    let permissionType = await Permission.findById(id);
    let comments;
    if (permissionType?.permission === "admin") {
      try {
        comments = await Comment.find({ active: true });
        res.status(201).send(comments);
      } catch (error) {
        if (error instanceof Error) {
          return res
            .status(400)
            .send(DefaultError.generate(400, error.message));
        }
      }
    } else {
      comments = await Comment.find({
        active: true,
        createdBy: new ObjectId(req.context?.data._id)
      });

      res.status(201).send(comments);
    }
  }

  static async getCommentById(req: IExtendedRequest, res: Response) {
    const { id } = req.params;
    const permissionId = req.context?.data.permission;

    const userPermission = await Permission.findById(permissionId);
    let comment;

    try {
      if (userPermission?.permission === "admin") {
        comment = await Comment.findById(id);
        res.status(201).send(comment);
      } else {
        comment = await Comment.find({
          _id: id,
          createdBy: req.context?.data._id
        });
        if (comment.length === 0) {
          return res.status(404).send(ERRORS.MONGO.COMMENT_NOT_FOUND);
        }
        res.status(201).send(comment);
      }
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).send(DefaultError.generate(400, error.message));
      }
    }
  }

  static async updateCommentById(req: IExtendedRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const updateComment = await Comment.findByIdAndUpdate(id, {
        ...req.body,
        updatedAt: new Date(Date.now())
      });
      return res.status(200).send(updateComment);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).send(DefaultError.generate(400, error.message));
      }
    }
  }

  static async deleteCommentById(req: IExtendedRequest, res: Response) {
    try {
      const { id } = req.params;

      const deletedComment = await Comment.findById(id).select("-active");
      await deletedComment?.update({ active: false });
      return res.status(200).send(deletedComment);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).send(DefaultError.generate(400, error.message));
      }
    }
  }
}
