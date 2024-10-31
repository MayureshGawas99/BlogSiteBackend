const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const { isValidMongoId } = require("../utils/utils");

const createComment = async (req, res) => {
  try {
    const { content, blogId, parent } = req.body;
    const author = req.user._id;
    const user = req.user;
    if (!blogId) {
      return res.status(400).send("Blog Id is required");
    }
    if (!isValidMongoId(blogId)) {
      return res.status(400).send("Please provide a valid Blog Id");
    }

    if (!content) {
      return res.status(400).send("Content is Required");
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    console.log(blog);

    if (!parent) {
      const comment = new Comment({ content, author, blogId: blog._id });
      const createdComment = await comment.save();
      user.comments.push(createdComment._id);
      const newUser = await user.save();
      console.log(newUser);
    } else {
      if (!isValidMongoId(parent)) {
        return res.status(400).send("Please provide a valid Parent Comment Id");
      }
      const comment = new Comment({
        content,
        author,
        blogId: blog._id,
        parent,
      });
      const createdComment = await comment.save();
      console.log(createdComment);
      const parentComment = await Comment.findById(parent);
      parentComment.replies.push(createdComment._id);
      await parentComment.save();

      user.comments.push(createdComment._id);
      const newUser = await user.save();
      console.log(newUser);
    }

    res.status(201).send("Comment Created Successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!commentId) {
      return res.status(400).send("commentId is required");
    }
    if (!isValidMongoId(commentId)) {
      return res.status(400).send("Please provide a valid Comment Id");
    }
    const user = req.user;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).send("Comment not found");
    }
    if (!comment.author.equals(user._id)) {
      return res.status(401).send("Unauthorized");
    }
    comment.content = "";
    await comment.save();

    res.status(200).send("Comment deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const editComment = async (req, res) => {
  try {
    const { commentId, newContent } = req.body;
    const user = req.user;
    if (!commentId) {
      return res.status(400).send("commentId is required");
    }
    if (!isValidMongoId(commentId)) {
      return res.status(400).send("Please provide a valid Comment Id");
    }
    if (!newContent) {
      return res.status(400).send("newContent is required");
    }
    const comment = await Comment.findById(commentId);
    // console.log(comment, user._id, !comment.author.equals(user._id));
    if (!comment) {
      return res.status(404).send("Comment not found");
    }
    if (!comment.author.equals(user._id)) {
      return res.status(401).send("Unauthorized");
    }

    if (comment.content === "") {
      return res.status(400).send("This comment was deleted");
    }

    comment.content = newContent;

    await comment.save();

    return res.status(200).send("Comment Updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const user = req.user;

    // Check if paper ID is missing
    if (!commentId) {
      return res.status(400).json({ message: "Comment ID is required." });
    }
    if (!isValidMongoId(commentId)) {
      return res.status(400).send("Please provide a valid Comment Id");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // Check if the paper is already liked by the user
    const alreadyLikedIndex = user.likedComments.indexOf(comment._id);

    if (alreadyLikedIndex === -1) {
      // If paper is not already liked, like it
      user.likedComments.push(comment._id); // Use paper._id instead of paperId

      const response = await user.save();
      console.log(response);

      comment.likeCount++;
      await comment.save();
      return res.status(200).json({ message: "Comment liked successfully." });
    } else {
      // If paper is already liked, dislike it
      user.likedComments.splice(alreadyLikedIndex, 1);
      await user.save();

      comment.likeCount--;
      await comment.save();
      return res
        .status(200)
        .json({ message: "Comment disliked successfully." });
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getAllComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!blogId) {
      return res.status(400).send("blogId is required");
    }
    if (!isValidMongoId(blogId)) {
      return res.status(400).send("Please provide a valid Paper Id");
    }

    const topComments = await Comment.find({
      blogId: blogId,
      parent: null,
    });
    const allComments = await populateComments(topComments, req.user);
    return res.status(200).send(allComments);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const populateReplies = async (commentId, user) => {
  let populatedComment = await Comment.findById(commentId)
    .populate("replies")
    .populate("author");
  if (user) {
    console.log(user, commentId);
    const isLiked = user.likedComments.some(
      (p) => p._id.toString() === commentId.toString()
    );
    populatedComment = { ...populatedComment._doc, isLiked };
  }

  if (populatedComment.replies.length === 0) {
    return populatedComment;
  }

  populatedComment.replies = await Promise.all(
    populatedComment.replies.map(async (reply) => {
      return await populateReplies(reply._id, user);
    })
  );

  return populatedComment;
};

const populateComments = async (comments, user) => {
  return Promise.all(
    comments.map(async (comment) => {
      return await populateReplies(comment._id, user);
    })
  );
};

module.exports = {
  createComment,
  deleteComment,
  editComment,
  getAllComments,
  likeComment,
};
