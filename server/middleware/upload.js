const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = file.fieldname === "json" ? "updated_canvas.json" : "uploaded_image" + ext;
    cb(null, filename);
  },
});

const upload = multer({ storage });
module.exports = upload;
