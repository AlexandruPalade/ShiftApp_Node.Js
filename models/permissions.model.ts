import mongoose, { Schema } from "mongoose";

export enum PermissionEnum {
  Admin = "admin",
  User = "user"
}

const permissionSchema = new Schema({
  permission: {
    type: String,
    enum: PermissionEnum,
    default: PermissionEnum.User
  }
});

export type permissionType = mongoose.InferSchemaType<typeof permissionSchema>;
export const Permission = mongoose.model("Permission", permissionSchema);
