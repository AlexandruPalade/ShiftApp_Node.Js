import { Router } from "express";
import UserController from "../controllers/User.controller";
import { permissionToChangeUsers } from "../middlewares/permissionToChangeUsers.middleware";
import { tokenGuard } from "../middlewares/tokenGuard.middleware";

const router = Router();

router.route("/register").post(UserController.register);
router.route("/login").post(UserController.login);

router.route("/").get([tokenGuard, UserController.getAllUsers]);

router
  .route("/:id")
  .get([tokenGuard, UserController.getUserById])
  .patch([tokenGuard, permissionToChangeUsers, UserController.updateUserById])
  .put([tokenGuard, permissionToChangeUsers, UserController.updatePassword])
  .delete([tokenGuard, permissionToChangeUsers, UserController.deleteUserById]);

router.route("/forgotPassword").post(UserController.triggerForgotPassword);

router
  .route("/forgotPassword/:resetToken")
  .get(UserController.forgotPasswordLanding)
  .post(UserController.resetPassword);

export default router;
