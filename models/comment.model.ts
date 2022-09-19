import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
  comment: {
    type: String
  },
  createdBy: {
    type:String
  },

  createAt: {
    type: Date
  },

  updatedAt: {
    type: Date
  },
  active:{
    type: Boolean,
    default: true
  }
});

export type commenteType = mongoose.InferSchemaType<typeof commentSchema>;
export const Comment = mongoose.model("Comment", commentSchema);
