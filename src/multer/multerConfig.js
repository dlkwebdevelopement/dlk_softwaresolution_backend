const multer = require("multer");
const path = require("path");

const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = "uploads/";
    if (file.fieldname === "syllabus_pdf") {
      dest = "uploads/syllabus/";
    }
    // Ensure directory exists
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });


module.exports = upload;

