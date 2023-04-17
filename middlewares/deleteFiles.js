const fs = require("fs");
const path = require("path");

const deleteFiles = (req, res, next) => {
  const directoryPath = path.join(__dirname, "../uploads/pdf");

  fs.readdir(directoryPath, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join(directoryPath, file), (err) => {
        if (err) throw err;
      });
    }
    next();
  });
};

module.exports = deleteFiles;
