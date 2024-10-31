const Blog = require("../models/Blog");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const { default: mongoose } = require("mongoose");
const { ObjectId } = require("mongodb");

const getUserBlogs = async (req, res) => {
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
};

const getSingleBlog = async (req, res) => {
  try {
    const { blogid } = req.params;
    let isBlogLiked = false;
    if (req.user) {
      const likedBlogs = req.user.likedBlogs;
      if (likedBlogs.includes(blogid)) {
        isBlogLiked = true;
      }
    }
    const blogs = await Blog.findById(blogid).populate("user");
    if (!blogs) {
      return res.status(404).send({ message: "Blog not Found" });
    }
    return res.status(200).send({ blogs, isBlogLiked });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

const getAllBlogs = async (req, res) => {
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
};

const likeBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).send({ message: "Blog not Found" });
    }
    const blogObjectId = new mongoose.Types.ObjectId(blogId);

    let message = "";
    if (req.user.likedBlogs.some((id) => id.equals(blogObjectId))) {
      req.user.likedBlogs = req.user.likedBlogs.filter(
        (id) => !id.equals(blogObjectId)
      );
      blog.likeCount -= 1;
      message = "Disliked the Blog";
    } else {
      req.user.likedBlogs.push(blogId);
      blog.likeCount += 1;
      message = "Liked the Blog";
    }
    const updatedBlog = await blog.save();
    const updatedUser = await req.user.save();
    return res.status(200).send({ message, updatedBlog, updatedUser });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

const createBlog = async (req, res) => {
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
};

const generateBlog = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(500).send({ message: "Title is required" });
    }

    async function generate(title) {
      const prompt = `give me the script for a blog post for the topic: ${title}`;

      const result = await model.generateContent(prompt);
      console.log(result.response.text());
      console.log(result.response.usageMetadata);
      return result.response.text();
    }
    generatedText = await generate(title);
    return res.status(200).send(generatedText);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

const updateBlog = async (req, res) => {
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
    if (!blog) {
      return res.status(404).send({ message: "Blog not Found" });
    }
    if (!new ObjectId(req.user._id).equals(new ObjectId(blog.user))) {
      return res.status(401).send({ message: "Unauthorized" });
    }
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
};

const deleteBlog = async (req, res) => {
  try {
    const { blogid } = req.params;
    const blog = await Blog.findById(blogid);
    if (!blog) {
      return res.status(404).send({ message: "Blog not Found" });
    }
    if (!new ObjectId(req.user._id).equals(new ObjectId(blog.user))) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const deletedBlog = await Blog.findByIdAndDelete(blogid);

    return res.status(200).send({ blog: deletedBlog });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error!");
  }
};
module.exports = {
  getUserBlogs,
  getSingleBlog,
  getAllBlogs,
  likeBlog,
  createBlog,
  generateBlog,
  updateBlog,
  deleteBlog,
};
