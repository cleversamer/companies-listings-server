const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let destinationFolder = "";

    if (file.mimetype === "application/pdf") {
      destinationFolder = "uploads/pdf/";
    } else if (
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      destinationFolder = "uploads/excel/";
    }
    cb(null, destinationFolder);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ storage });

module.exports = upload;
