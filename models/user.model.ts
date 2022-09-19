import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { NextFunction } from "express";
import crypto from "crypto";

interface IUserMethods {
  authenticate: (passwordWithoutHash: string) => Promise<boolean>;
  generateResetPasswordToken: () => void;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/g, "Email invalid"]
  },

  username: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true,
    match: [
      /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&.])[A-Za-zd$@$!%*?&].{8,}/,
      "Password does not match security criteria"
    ]
  },

  age: {
    type: Number,
    required: true,
    min: 18,
    max: 99
  },

  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true
  },

  permission: {
    type: mongoose.SchemaTypes.ObjectId
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
  },

  resetPasswordToken: {
    type: String
  },

  resetPasswordTokenExpirydate: {
    type: Date
  }
});

//@ts-ignore
userSchema.pre("save", async function(next: NextFunction) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(12);
    const encryptedPassword = await bcrypt.hash(this.password, salt);
    this.password = encryptedPassword;
    return next();
  }
  next();
});

userSchema.methods.authenticate = async function(passwordWithoutHash: string) {
  return bcrypt.compare(passwordWithoutHash, this.password);
};

userSchema.methods.generateResetPasswordToken = async function() {
  this.resetPasswordToken = crypto.randomBytes(16).toString("hex");
  this.resetPasswordTokenExpirydate = Date.now() + 5 * 60 * 1000;
};

export type userType = mongoose.InferSchemaType<typeof userSchema> &
  Document &
  IUserMethods;

export const User = mongoose.model<userType>("User", userSchema);
