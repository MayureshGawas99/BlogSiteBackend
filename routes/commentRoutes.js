const express = require("express");

const {
  createComment,
  deleteComment,
  editComment,
  likeComment,
  getBlogComments,
  getCommentReplies,
} = require("../controllers/commentControllers");
const { fetchuser, haveUser } = require("../middleware/fetchuser");

const router = express.Router();

router.route("/create").post(fetchuser, createComment);
router.route("/edit").put(fetchuser, editComment);
router.route("/like/:commentId").get(fetchuser, likeComment);
router.route("/get-comments/:blogId").get(haveUser, getBlogComments);
router.route("/get-replies/:commentId").get(haveUser, getCommentReplies);
router.route("/delete/:commentId").delete(fetchuser, deleteComment);

module.exports = router;
