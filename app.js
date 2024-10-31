require("dotenv").config();
const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
const Blog = require("./models/Blog");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/blog", require("./routes/blogRoutes"));
app.use("/api/v1/comment", require("./routes/commentRoutes"));
app.get("/", (req, res) => {
  res.status(200).send("Backend is Running");
});

connectToMongo().then(() => {
  app.listen(port, () => {
    console.log(`Server is Running on http://localhost:${port}`);
  });
});
