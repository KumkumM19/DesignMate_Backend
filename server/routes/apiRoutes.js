const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const upload = require("../middleware/upload");
const updateController = require("../controllers/updateController");

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/pages/form.html"));
});

router.post(
  "/update-json",
  upload.fields([{ name: "json" }, { name: "image" }]),
  updateController.handleUpdate
);

router.get("/uploads/updated_canvas.json", (req, res) => {
  const jsonPath = path.join(__dirname, "../../uploads/updated_canvas.json");
  if (fs.existsSync(jsonPath)) {
    res.sendFile(jsonPath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

module.exports = router;
