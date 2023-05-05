var express = require("express");
var router = express.Router();
const multer = require("multer");
const fs = require("fs");
const { parseCountryAndYear } = require("../utils");
const { addExcelToQueue } = require("../utils/queue");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "intermediate/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const UPLOAD_FOLDER = "intermediate";

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/upload", upload.array("files"), function (req, res, next) {
  res.json({ message: "All files Uploaded" });
});

router.post("/add-to-queue", function (req, res, next) {
  fs.readdir("intermediate", async (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    // Process each Excel file
    files.forEach(async (file) => {
      const filePath = `${UPLOAD_FOLDER}/${file}`;
      addExcelToQueue({ path: filePath, file });
    });
    res.json({ message: "Files Added To Queue" });
  });
});

module.exports = router;
