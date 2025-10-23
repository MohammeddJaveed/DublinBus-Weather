// convertGTFS.js

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const inputDir = path.join(__dirname, 'src/data'); // adjust if needed
const outputDir = path.join(inputDir, 'json');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.readdirSync(inputDir).forEach(file => {
  if (file.endsWith('.txt')) {
    console.log('Processing file:', file);
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file.replace('.txt', '.json'));

    const writeStream = fs.createWriteStream(outputPath);
    writeStream.write('[\n');
    let firstRow = true;

    fs.createReadStream(inputPath)
      .pipe(csv())
      .on('data', (row) => {
        if (!firstRow) writeStream.write(',\n');
        writeStream.write(JSON.stringify(row));
        firstRow = false;
      })
      .on('end', () => {
        writeStream.write('\n]');
        writeStream.close();
        console.log(`${inputPath} → ${outputPath} converted.`);
      });
  }
});
