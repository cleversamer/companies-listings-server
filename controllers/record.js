const Record = require("../model/record");
const path = require("path");
const fs = require("fs");
const PDFFile = require("../model/pdf");
const { Op } = require("sequelize");

const getUserRecords = async (req, res) => {
  try {
    const page = +req.query.page || 1;
    const itemPerPage = +req.query.limit || 10;
    const orderBy = req.query.orderBy || "createdAt";
    const sort = req.query.sort || "DESC";

    const rgn = req.query.rgn;
    const type = req.query.type;
    const fg = req.query.fg;

    let whereClause = { rgn, type: { [Op.like]: `%${type}%` } };
    const fields = [
      "comp",
      "owner",
      "phas",
      "bs",
      "utp_from",
      "utp_to",
      "bua_from",
      "bua_to",
    ];

    fields.forEach((field) => {
      if (req.query[field]) {
        whereClause[field] = req.query[field];
      }
    });

    if (fg) {
      whereClause.fg = { [Op.like]: `%${fg}%` };
    }

    if (req.query.dly) {
      const dlyParam = req.query.dly.toLowerCase();

      if (dlyParam === "true") {
        whereClause.dly_delivered = true;
      } else if (!isNaN(dlyParam)) {
        const dlyValue = parseInt(dlyParam, 10);
        whereClause.dly_from = { [Op.lte]: dlyValue };
        whereClause.dly_to = { [Op.gte]: dlyValue };
      }
    }

    if (req.query.dp) {
      whereClause.dp_from = { [Op.lte]: req.query.dp };
      whereClause.dp_to = { [Op.gte]: req.query.dp };
    }

    if (req.query.ys) {
      whereClause.ys_from = { [Op.gte]: req.query.ys };
      whereClause.ys_to = { [Op.gte]: req.query.ys };
    }

    const records = await Record.findAndCountAll({
      where: whereClause,
      order: [[orderBy, sort]],
      limit: itemPerPage,
      offset: (page - 1) * itemPerPage,
    });

    const results = await Record.findAll({
      where: { rgn, type: { [Op.like]: `%${type}%` } },
      attributes: [
        "id",
        "rgn",
        "owner",
        "fg",
        "bs",
        "comp",
        "phas",
        "ys_from",
        "ys_to",
      ],
    });

    const totalItems = records.count;
    const hasNextPage = itemPerPage * page < totalItems;
    const hasNextTwoPage = itemPerPage * (page + 2) < records.count;
    const hasNextThreePage = itemPerPage * (page + 3) < records.count;
    const hasPreviousPage = page > 1;
    const hasPagenation = totalItems > itemPerPage;

    return res.status(200).json({
      records: records.rows,
      results: results,
      pagenation: {
        page,
        itemPerPage,
        totalItems,
        nextPage: page + 1,
        nextTwoPage: page + 2,
        nextThreePage: page + 3,
        previousPage: page - 1,
        currentPage: page,
        hasNextPage,
        hasNextTwoPage,
        hasNextThreePage,
        hasPreviousPage,
        hasPagenation,
      },
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const getPDF = async (req, res) => {
  try {
    const { fileName } = req.params;

    const pdfile = await PDFFile.findOne({
      where: { path: `${fileName}.pdf` },
    });

    if (!pdfile) {
      return res.status(400).json({ message: "No PDF For This Record" });
    }

    // path for pdf folder
    const PDFPath = path.join(__dirname, "../", "uploads/pdf");

    if (!PDFPath) {
      return res.status(404).json({ message: "PDF File Not Found" });
    }
    // // path for the PDF file
    const filePath = path.join(PDFPath, `${pdfile.path}`);

    if (!filePath) {
      return res.status(404).json({ message: "PDF File Not Found" });
    }
    res.download(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    return res.status(500).json(err);
  }
};

const sharePDF = async (req, res) => {
  try {
    const { fileName } = req.params;
    const pdfile = await PDFFile.findOne({
      where: { path: `${fileName}.pdf` },
    });

    if (!pdfile) {
      return res.status(400).json({ message: "No PDF For This Record" });
    }

    // path for pdf folder
    const PDFPath = "uploads/pdf";

    if (!PDFPath) {
      return res.status(404).json({ message: "PDF File Not Found" });
    }
    // // path for the PDF file
    const filePath = path.join(PDFPath, `${pdfile.path}`);

    if (!filePath) {
      return res.status(404).json({ message: "PDF File Not Found" });
    }
    const file = filePath.replaceAll("\\", "/");

    res
      .status(200)
      .json(
        `${req.protocol}://${req.headers.host}/${file.replaceAll(" ", "%20")}`
      );
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = {
  getUserRecords,
  getPDF,
  sharePDF,
};
