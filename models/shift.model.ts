import { NextFunction } from "express";
import { MongoError } from "mongodb";
import mongoose, { Schema, Document, mongo } from "mongoose";
import { User } from "./User.model";
import { Comment } from "./comment.model";
import { DefaultError } from "../utils/DefaultError";

const shiftSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },

  date: {
    type: Date,
    required: true
  },

  startTime: {
    type: Date,
    required: true
  },

  endTime: {
    type: Date,
    required: true
  },

  workPlace: {
    type: String,
    enum: ["home", "office"],
    required: true
  },

  profitPerHour: {
    type: Number,
    required: true
  },

  commentIds: {
    type: Schema.Types.ObjectId,
    ref: Comment
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: User
  },

  active: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date
  },

  updatedAt: {
    type: Date
  }
});

//@ts-ignore
shiftSchema.post(/save/,function (error: MongoError, doc: Document, next: NextFunction) {
    if (error.name === "MongoServerError" && error.code === 11000) {
      //@ts-ignore
      return next( DefaultError.generate(400,`There was a duplicate key ${JSON.stringify(error.keyValue)}`));
    }
    //@ts-ignore
    next();
  }
);

export type shiftType = mongoose.InferSchemaType<typeof shiftSchema>;
export const Shift = mongoose.model<shiftType>("Shift", shiftSchema);
