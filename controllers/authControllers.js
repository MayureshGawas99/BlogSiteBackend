const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const registerUser = async (req, res) => {
  // finding if duplicate emails are there or not
  try {
    const { name, email, password } = req.body;
    // checking for errors
    if (!name) {
      return res.status(500).send({ message: "Name is required" });
    }
    if (!email) {
      return res.status(500).send({ message: "Email is required" });
    }
    if (!password || password.length < 8) {
      return res
        .status(500)
        .send({ message: "Password is required and 8 characters long" });
    }
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({
        message: "Email already exist",
      });
    }

    // crete a User
    const salt = await bcrypt.genSalt(10);
    secPass = await bcrypt.hash(req.body.password, salt);
    user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email,
    });
    res.status(200).send({ message: "Registered Successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // checking for validation errors
    if (!email) {
      return res.status(500).send({ message: "Email is Required" });
    }
    if (!password) {
      return res.status(500).send({ message: "Password is Required" });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not Found",
      });
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({
        message: "Please try to login with correct credentials",
      });
    }
    const data = {
      user: {
        _id: user._id,
      },
    };
    console.log(data);
    const authToken = jwt.sign(data, process.env.JWT_SECRET);
    res.status(200).send({ authToken, user: data.user });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

const getUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).send({ message: "User not Found" });
    }
    return res.status(200).send(req.user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: "Internal Server Error!" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, password, pic } = req.body;
    console.log("Update", name, password, pic);
    const user = await User.findById(req.user._id);
    if (password && password.length < 8) {
      return res
        .status(400)
        .send({ message: "Password is required and 8 character long" });
    }
    const salt = await bcrypt.genSalt(10);
    // const hashedPassword = password ? await hashPassword(password) : undefined;
    const hashedPassword = password
      ? await bcrypt.hash(password, salt)
      : undefined;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        pic: pic || user.pic,
      },
      { new: true }
    );
    res.status(200).send({
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in Updating Profile",
    });
  }
};

const searchUser = async (req, res) => {
  try {
    // Get the search term from the query parameters
    const { searchTerm } = req.query;

    // If no search term is provided, return an empty array
    if (!searchTerm) {
      return res.status(400).json([]);
    }

    // Search users based on the name or email using a case-insensitive regular expression
    const results = await User.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .populate("likedBlogs")
      .populate("comments")
      .populate("likedComments");

    // Return the search results
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = {
  registerUser,
  loginUser,
  getUser,
  updateUser,
  searchUser,
};
