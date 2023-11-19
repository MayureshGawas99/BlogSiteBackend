const express = require("express");
const Blog = require("../models/Blog");
const fetchuser = require("../middleware/fetchuser");
const router = express.Router();

router.get("/userblogs", fetchuser, async (req, res) => {
  try {
    const blogs = await Blog.find({ user: req.user._id })
      .populate("user")
      .sort({
        createdAt: -1,
      });
    if (!blogs) {
      return res.status(404).send({ message: "No Blogs to Display" });
    }
    return res.status(200).send({ blogs });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

router.get("/single/:blogid", fetchuser, async (req, res) => {
  try {
    const { blogid } = req.params;
    const blogs = await Blog.findById(blogid).populate("user");
    if (!blogs) {
      return res.status(404).send({ message: "Blog not Found" });
    }
    return res.status(200).send({ blogs });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});
router.get("/all", async (req, res) => {
  try {
    const blogs = await Blog.find({ visibility: "public" })
      .populate("user")
      .sort({
        createdAt: -1,
      });
    if (!blogs) {
      return res.status(404).send({ message: "No Blogs to Display" });
    }
    return res.status(200).send({ blogs });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

router.post("/create", fetchuser, async (req, res) => {
  try {
    const { title, tag, text, image, visibility } = req.body;
    if (!title) {
      return res.status(500).send({ message: "Title is required" });
    }
    if (!text) {
      return res.status(500).send({ message: "Text is required" });
    }
    let blogdata = {
      user: req.user._id,
      title,
      tag: [],
      text,
    };
    if (tag) {
      blogdata.tag = JSON.parse(tag);
    }
    if (image) {
      blogdata.image = image;
    }
    if (visibility) {
      blogdata.visibility = visibility;
    }
    const blog = await Blog.create(blogdata);
    return res.status(200).send({ blog });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

router.put("/update/:blogid", fetchuser, async (req, res) => {
  try {
    const { title, tag, text, image, visibility } = req.body;
    const { blogid } = req.params;
    if (!blogid) {
      return res.status(500).send({ message: "Please Specify Blog Id" });
    }
    if (!title) {
      return res.status(500).send({ message: "Title is required" });
    }
    if (!text) {
      return res.status(500).send({ message: "Text is required" });
    }
    const blog = await Blog.findById(blogid);
    let update = {
      title: title || blog.title,
      text: text || blog.text,
      image: image || blog.image,
      visibility: visibility || blog.visibility,
    };
    if (tag) {
      update.tag = JSON.parse(tag);
    }

    const updatedBlog = await Blog.findByIdAndUpdate(blogid, update, {
      new: true,
    });
    res.status(200).send({
      updatedBlog,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

router.delete("/delete/:blogid", fetchuser, async (req, res) => {
  try {
    const { blogid } = req.params;
    const blog = await Blog.findByIdAndDelete(blogid);
    return res.status(200).send({ blog });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error!");
  }
});

module.exports = router;
