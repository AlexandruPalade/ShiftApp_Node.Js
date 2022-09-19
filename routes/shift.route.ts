import { Router } from "express";
import ShiftController from "../controllers/Shift.controller";
import { permissionToChangeShifts } from "../middlewares/permissionToChangeShifts.middleware";

const router = Router();

router.route("/").post(ShiftController.createShift);

router
  .route("/:id")
  .get( ShiftController.getShiftById)
  .patch([permissionToChangeShifts, ShiftController.updateShift])
  .delete([permissionToChangeShifts, ShiftController.deleteShift]);

router.route("/").get(ShiftController.getAllShifts);

export default router;
