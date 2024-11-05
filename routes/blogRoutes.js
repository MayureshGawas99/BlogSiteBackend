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
} = require("../controllers/blogControllers");
const User = require("../models/User");

router.get("/userblogs", fetchuser, getUserBlogs);
router.get("/userlikedblogs", fetchuser, getUserLikedBlogs);

router.get("/search", searchBlog);

router.get("/single/:blogid", haveUser, getSingleBlog);

router.get("/all", getAllBlogs);

router.get("/like/:blogId", fetchuser, likeBlog);

router.post("/generate-blog", fetchuser, generateBlog);

router.post("/create", fetchuser, createBlog);

router.put("/update/:blogid", fetchuser, updateBlog);

router.delete("/delete/:blogid", fetchuser, deleteBlog);

// router.get("/add-attribute", async (req, res) => {
//   try {
//     async function addAttributeToDocuments() {
//       const updateResult = await Blog.updateMany(
//         {}, // Empty filter to select all documents
//         { $set: { commentCount: 0 } } // Replace "defaultValue" with your desired value
//       );

//       console.log(`${updateResult.modifiedCount} documents were updated`);
//       return `${updateResult.modifiedCount} documents were updated`;
//     }
//     const ans = await addAttributeToDocuments();
//     res.status(200).send({ ans });
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).send("Internal Server Error!");
//   }
// });

module.exports = router;
