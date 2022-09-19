import { Router } from "express";
import CommentController from "../controllers/Comment.controller";
import { permissionToChangeComments } from "../middlewares/permissionToChangeComments.middleware";
const router = Router();

router.route("/").post(CommentController.createComment);
router.route("/").get([CommentController.getAllComments]);

router
  .route("/:id")
  .get([CommentController.getCommentById])
  .patch([permissionToChangeComments, CommentController.updateCommentById])
  .delete([permissionToChangeComments, CommentController.deleteCommentById]);

export default router;
