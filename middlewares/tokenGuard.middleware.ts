import { NextFunction, Response } from "express";
import config, { IConfig } from "config";
import jwt, { Payload } from "jwt-promisify";
import { assocPath } from "ramda";

import { Config, IExtendedRequest, IData } from "../types";

const { JWT_SECRET } = config as Config & IConfig;

export const tokenGuard = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  let token;
  
  if (req.cookies.token) {
    token = req.cookies.token;
  }

  try {
    const decodedToken = (await jwt.verify(token, JWT_SECRET)) as Payload &
      IData;

    req.context = assocPath(
      ["data"],
      {
        _id: decodedToken._id,
        permission: decodedToken.permission
      },
      req.context
    );
  } catch (error) {
    return res.status(401).send(error);
  }

  next();
};
