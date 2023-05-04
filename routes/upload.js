const express = require("express");
const router = express.Router();
const busboy = require("busboy");
const { parseCountryAndYear } = require("../utils");
const { processBuffer } = require("../utils/parser");

router.post("/", function (req, res, next) {
  const bb = busboy({ headers: req.headers });
  const files = [];
  bb.on("file", async (field, file, info) => {
    const { filename } = info;
    const extraData = parseCountryAndYear(filename);
    const buffers = [];
    file.on("data", (data) => {
      buffers.push(data);
    });
    file.on("end", () => {
      const fileBuffer = Buffer.concat(buffers);
      files.push({
        ...extraData,
        buffer: fileBuffer,
      });
    });
  });
  bb.on("error", (err) => {
    next(err);
  });
  bb.on("finish", async () => {
    const finalResponse = files?.map(async (d) => {
      const response = processBuffer(d);
    });
    res.json("Success");
  });
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(
    `The upload uses approximately ${Math.round(used * 100) / 100} MB`
  );
  req.pipe(bb);
});

module.exports = router;
