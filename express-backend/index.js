import fs from "fs-extra";
import express from "express";
import crypto from "crypto";
import chalk from "chalk";
import cors from "cors";
const app = express();
const port = 4001;

import musics from "./data.json" assert { type: "json" };

import CliProgress from "cli-progress";

const mp3DirPath = "./mp3";
const progress = new CliProgress.Bar({}, CliProgress.Presets.shades_classic);

app.use(cors());

app.get("/", (req, res) => {
  async function readDir() {
    try {
      const files = await fs.readdir(mp3DirPath);
      console.log(chalk.blue(" Files have been read \n"));
      return files;
    } catch (err) {
      console.error(chalk.red(err));
    }
  }

  readDir().then((files) => {
    progress.start(files.length, 0);
    const output = files.map((file, i) => {
      const stats = fs.statSync(`${mp3DirPath}/${file}`);
      const songInfo = file.split("-");
      return {
        id: crypto.randomUUID(),
        song: songInfo[1].replace(".mp3", ""),
        artist: songInfo[0].trim(),
        src: `${mp3DirPath}/${file}`,
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg83frs-hZlNhu-CJmQNXtad8EbmZp7HztMg&usqp=CAU",
        fileSize: stats.size,
      };
    });
    fs.writeFile("data.json", JSON.stringify(output), "utf8", (err) => {
      if (err) {
        console.error(chalk.red(err));
        throw err;
      }
      progress.stop();
      console.log(
        chalk.green("\n Process run complete"),
        chalk.blue("\n\n Output saved to ./data.json\n")
      );
      return null;
    });
  });
});

app.get("/playlist", (req, res) => {
  res.send(musics);
});

app.get("/song/:id", function (req, res) {
  var i;

  var musicPath;

  for (i = 0; i < musics.length; ++i) {
    if (musics[i].id == req.params.id) {
      musicPath = musics[i].src;
      var range;
      var stat = fs.statSync(musicPath);
      range = req.headers.range;
      var readStream;

      if (range !== undefined) {
        var parts = range.replace(/bytes=/, "").split("-");

        var partial_start = parts[0];
        var partial_end = parts[1];

        if (
          (isNaN(partial_start) && partial_start.length > 1) ||
          (isNaN(partial_end) && partial_end.length > 1)
        ) {
          return res.sendStatus(500);
        }

        var start = parseInt(partial_start, 10);
        var end = partial_end ? parseInt(partial_end, 10) : stat.size - 1;
        var content_length = end - start + 1;

        res.status(206).header({
          "Content-Type": "audio/mpeg",
          "Content-Length": content_length,
          "Content-Range": "bytes " + start + "-" + end + "/" + stat.size,
        });

        readStream = fs.createReadStream(musicPath, { start: start, end: end });
      } else {
        res.header({
          "Content-Type": "audio/mpeg",
          "Content-Length": stat.size,
        });
        readStream = fs.createReadStream(musicPath);
      }
      readStream.pipe(res);
    }
  }
});

app.listen(port, () =>
  console.log(`Hello world app listening on port ${port}!`)
);
