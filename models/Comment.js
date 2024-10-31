const mongoose = require("mongoose");

// Define Comment Schema
const commentSchema = new mongoose.Schema(
  {
    content: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, // Assuming you have a User model
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "comment" }],
    blogId: { type: mongoose.Schema.Types.ObjectId, ref: "blog" },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
      default: null,
    },
    likeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Define models
const Comment = mongoose.model("comment", commentSchema);

module.exports = Comment;
