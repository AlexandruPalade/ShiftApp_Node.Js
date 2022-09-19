import { Request } from "express";
import { PermissionEnum } from "../models/permissions.model";

export interface IData {
  _id: string;
  permission: string;
}

export interface IExtendedRequest extends Request {
  context?: {
    data: IData;
  };
}
