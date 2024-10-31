const express = require("express");
const router = express.Router();
const User = require("../models/User");

const { fetchuser } = require("../middleware/fetchuser");
const {
  registerUser,
  loginUser,
  getUser,
  updateUser,
} = require("../controllers/authControllers");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/getuser", fetchuser, getUser);

router.put("/update", fetchuser, updateUser);

module.exports = router;
