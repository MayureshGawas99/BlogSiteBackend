const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const fetchuser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ message: "Invalid token" });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    console.log("miidle", data);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ message: "Invalid token" });
  }
};

module.exports = fetchuser;
