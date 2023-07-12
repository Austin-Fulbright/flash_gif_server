const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });

const app = express();

app.post('/crop', upload.single('video'), (req, res) => {
  const { cropX, cropY, cropWidth, cropHeight } = req.body;
  const inputFile = req.file.path;
  const outputFile = `cropped_${req.file.originalname}`;

  const outputFilePath = path.join(__dirname, 'output', outputFile);

  ffmpeg(inputFile)
    .outputOptions([
      `-vf crop=${cropWidth}:${cropHeight}:${cropX}:${cropY}`,
      '-c:v libx264',
      '-crf 20',
      '-preset veryfast'
    ])
    .output(outputFilePath)
    .on('error', function (err) {
      console.log('An error occurred: ' + err.message);
      res.status(500).send('An error occurred while cropping the video.');
    })
    .on('end', function () {
      res.download(outputFilePath, function (err) {
        if (!err) {
          fs.unlinkSync(inputFile);
          fs.unlinkSync(outputFilePath);
        }
      });
    })
    .run();
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
