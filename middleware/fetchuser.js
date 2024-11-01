const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET;

const fetchuser = async (req, res, next) => {
  try {
    const token = req.header("auth-token");
    if (!token) {
      res.status(401).send({ message: "Invalid token" });
    }
    const data = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(data.user._id);
    if (!user) {
      res.status(401).send({ message: "Invalid token" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: "Invalid token" });
  }
};

const haveUser = async (req, res, next) => {
  try {
    const token = req.header("auth-token");
    if (!token) {
      return next();
    }
    const data = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(data.user._id);
    if (!user) {
      next();
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ message: "Invalid token" });
  }
};

module.exports = { fetchuser, haveUser };
