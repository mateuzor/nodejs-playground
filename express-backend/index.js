const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const multer = require("multer");

// const uploadDest = "public/media/";
// const allowedMimeTypes = ["audio/mp3"];
// const filter = function (req, file, cb) {
//   if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
//     cb(null, false);
//   }
//   cb(null, true);
// };

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/audio/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World, from express");
});

// app.post("/upload-audio", multer({ storage }).single("audio"), (req, res) => {
//   res.send("Audio file successfully uploaded!");
// });

app.listen(port, () =>
  console.log(`Hello world app listening on port ${port}!`)
);
