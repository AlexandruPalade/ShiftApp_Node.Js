import { Response } from "express";
import { IExtendedRequest } from "../types";
import { Shift } from "../models/shift.model";

import { ObjectId } from "mongodb";
import { Permission } from "../models/permissions.model";
import { getEffectiveConstraintOfTypeParameter } from "typescript";
import { DefaultError } from "../utils/DefaultError";
import { ERRORS } from "../const/errors";

export default class ShiftController {
  static async createShift(req: IExtendedRequest, res: Response) {
    try {
      const id = req.context?.data._id;
      const newShift = new Shift({
        ...req.body,
        userId: id,
        createdAt: new Date(Date.now())
      });

      await newShift.save();
    
      res.status(201).send(newShift);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).send(DefaultError.generate(400, error.message));
      }
    }
  }

  static async getAllShifts(req: IExtendedRequest, res: Response) {
    const id = req.context?.data.permission;
    let permissionType = await Permission.findById(id);
    let shifts;
    try {
      if (permissionType?.permission === "admin") {
        shifts = await Shift.find({ active: true });
        res.status(201).send(shifts);
      } else {
        shifts = await Shift.find({
          active: true,
          userId: new ObjectId(req.context?.data._id)
        });

        res.status(201).send(shifts);
      }
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).send(DefaultError.generate(400, error.message));
      }
    }
  }

  static async getShiftById(req: IExtendedRequest, res: Response) {
    const { id } = req.params;
    const permissionId = req.context?.data.permission;

    const userPermission = await Permission.findById(permissionId);
    let shift;

    try {
      if (userPermission?.permission === "admin") {
        shift = await Shift.findById(id);
        res.status(201).send(shift);
      } else {
        shift = await Shift.find({ _id: id, userId: req.context?.data._id });
        if (shift.length === 0) {
          return res.status(404).send(ERRORS.MONGO.SHIFT_NOT_FOUND);
        }
        res.status(201).send(shift);
      }
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).send(DefaultError.generate(400, error.message));
      }
    }
  }

  static async updateShift(req: IExtendedRequest, res: Response) {
    try {
      const { id } = req.params;

      let updatedShift;

      if (req.body.commentIds) {
        updatedShift = await Shift.findByIdAndUpdate(
          id,
          {
            $addToSet: { commentIds: req.body.commentIds },
            updatedAt: new Date(Date.now())
          },
          { new: true }
        );

        return res.status(200).send(updatedShift);
      } else {
        updatedShift = await Shift.findByIdAndUpdate(id, {
          ...req.body,
          updatedAt: new Date(Date.now())
        });
        return res.status(200).send(updatedShift);
      }
    } catch (error) {


      if (error instanceof Error) {

      if (error.message.includes("E11000")) {
        return res.status(409).send(DefaultError.generate(400,ERRORS.MONGO.DUPLICATE_SHIFT_NAME ));
      }
        return res.status(400).send(DefaultError.generate(400, error.message));
      }

    }
  }

  static async deleteShift(req: IExtendedRequest, res: Response) {
    try {
      const { id } = req.params;

      const deletedShift = await Shift.findById(id).select("-active");
      await deletedShift?.update({ active: false });
      res.status(201).send(deletedShift);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).send(DefaultError.generate(400, error.message));
      }
    }
  }
}
