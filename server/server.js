const express = require("express");
const path = require("path");
const app = express();
// require("dotenv").config();

app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/js", express.static(path.join(__dirname, "../public/js")));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

const apiRoutes = require("./routes/apiRoutes");
app.use("/", apiRoutes);

// const PORT = process.env.PORT || 3000;
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
