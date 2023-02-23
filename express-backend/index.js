const express = require("express");
const app = express();
const port = 3001;
const axios = require("axios");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");

const mp3Url =
  "http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/audio/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/play-local", (req, res) => {
  fs.readFile("./uploads/audio/music.mp3", function (err, result) {
    res.send(result.toString("base64"));
    return result;
  });
});

app.get("/playlist", (req, res) => {
  axios
    .get(mp3Url, {
      responseType: "stream",
      "Content-Range": "bytes 16561-8065611",
    })
    .then((Response) => {
      const stream = Response.data;

      res.set("content-type", "audio/mp3");
      res.set("accept-ranges", "bytes");
      res.set("content-length", Response.headers["content-length"]);
      console.log(Response);

      stream.on("data", (chunk) => {
        console.log(chunk);
        res.write(chunk);
      });

      stream.on("error", (err) => {
        res.sendStatus(404);
      });

      stream.on("end", () => {
        res.end();
      });
    })
    .catch((Err) => {
      console.log(Err.message);
    });
});

app.post("/upload-audio", multer({ storage }).single("audio"), (req, res) => {
  res.send("Audio file successfully uploaded!");
});

app.listen(port, () =>
  console.log(`Hello world app listening on port ${port}!`)
);
