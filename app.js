require("dotenv").config();
const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/blog", require("./routes/blog"));
app.get("/", (req, res) => {
  res.status(200).send("Backend is Running");
});

connectToMongo().then(() => {
  app.listen(port, () => {
    console.log(`Server is Running on http://localhost:${port}`);
  });
});
