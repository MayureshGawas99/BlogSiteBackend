const mongoose = require("mongoose");
const { Schema } = mongoose;

const BlogSchema = new Schema(
  {
    title: { type: String, required: true },
    text: { type: String, required: true },
    tag: { type: [String] },
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    image: {
      type: "String",
      required: true,
      default:
        "https://cdni.iconscout.com/illustration/free/thumb/free-software-engineer-2043023-1731282.png",
    },
    visibility: { type: String, default: "public" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("blog", BlogSchema);
// usermodel
