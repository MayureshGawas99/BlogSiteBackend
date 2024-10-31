const express = require("express");

const {
  createComment,
  deleteComment,
  editComment,
  getAllComments,
  likeComment,
} = require("../controllers/commentControllers");
const { fetchuser, haveUser } = require("../middleware/fetchuser");

const router = express.Router();

router.route("/create").post(fetchuser, createComment);
router.route("/edit").put(fetchuser, editComment);
router.route("/like/:commentId").get(fetchuser, likeComment);
router.route("/get/:blogId").get(haveUser, getAllComments);
router.route("/delete/:commentId").delete(fetchuser, deleteComment);

module.exports = router;
