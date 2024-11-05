const express = require("express");
const Blog = require("../models/Blog");
const router = express.Router();

const { fetchuser, haveUser } = require("../middleware/fetchuser");
const { default: mongoose } = require("mongoose");
const {
  getUserBlogs,
  getSingleBlog,
  getAllBlogs,
  likeBlog,
  createBlog,
  generateBlog,
  updateBlog,
  deleteBlog,
  searchBlog,
  getUserLikedBlogs,
  getOtherUserBlogs,
} = require("../controllers/blogControllers");
const User = require("../models/User");

router.get("/userblogs", fetchuser, getUserBlogs);

router.get("/otheruserblogs/:userId", getOtherUserBlogs);

router.get("/userlikedblogs", fetchuser, getUserLikedBlogs);

router.get("/search", searchBlog);

router.get("/single/:blogid", haveUser, getSingleBlog);

router.get("/all", getAllBlogs);

router.get("/like/:blogId", fetchuser, likeBlog);

router.post("/generate-blog", fetchuser, generateBlog);

router.post("/create", fetchuser, createBlog);

router.put("/update/:blogid", fetchuser, updateBlog);

router.delete("/delete/:blogid", fetchuser, deleteBlog);

module.exports = router;
