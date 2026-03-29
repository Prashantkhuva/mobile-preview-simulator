const sharp = require('sharp');
const fs = require('fs');
const svg = fs.readFileSync('./images/icon.svg');
sharp(Buffer.from(svg))
  .resize(128, 128)
  .png()
  .toFile('./images/logo.png', (err) => {
    if (err) console.error(err);
    else console.log('logo.png generated!');
  });
