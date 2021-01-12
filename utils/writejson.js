const fs = require('fs');
module.exports = (rawData, filename) => {
  const data = JSON.stringify(rawData);
  // write file to disk
  return fs.writeFile('./'+filename , data, 'utf8', (err) => {
      if (err) {
          console.log(`Error writing file: ${err}`);
      } else {
          console.log(`File is written successfully!`);
      }

  });
}