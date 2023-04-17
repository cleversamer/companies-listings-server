const path = require("path");
const fs = require("fs");

const xlsx = require("xlsx");
const Record = require("../../model/record");
const Country = require("../../model/countries");
const PDFFile = require("../../model/pdf");

const Setting = require("../../model/setting");
const { Op } = require("sequelize");

const getRecords = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "admin only can take this action" });
    }

    const page = +req.query.page || 1;
    const itemPerPage = +req.query.limit || 10;
    const searchBy = req.query.searchBy;
    const searchValue = req.query.searchValue;
    const orderBy = req.query.orderBy || "createdAt";
    const sort = req.query.sort || "DESC";

    const fields = ["rgn", "owner", "comp", "bs", "phas"];

    let whereClause = {};
    fields.forEach((field) => {
      if (searchBy === field) {
        whereClause[field] = searchValue.trim().toString();
      }
    });

    if (searchBy === "fg") {
      whereClause.fg = { [Op.like]: `%${searchValue.trim().toString()}%` };
    }
    if (searchBy === "type") {
      whereClause.type = { [Op.like]: `%${searchValue.trim().toString()}%` };
    }

    const records = await Record.findAndCountAll({
      where: whereClause,
      // order: [[orderBy, sort]],
      order: [["comp", "ASC"]],
      limit: itemPerPage,
      offset: (page - 1) * itemPerPage,
    });

    return res.status(200).json({
      records: records.rows,
      pagenation: {
        page,
        itemPerPage,
        totalItems: records.count,
        nextPage: page + 1,
        nextTwoPage: page + 2,
        nextThreePage: page + 3,
        previousPage: page - 1,
        currentPage: page,
        hasNextPage: itemPerPage * page < records.count,
        hasNextTwoPage: itemPerPage * (page + 2) < records.count,
        hasNextThreePage: itemPerPage * (page + 3) < records.count,
        hasPreviousPage: page > 1,
        hasPagenation: records.count > itemPerPage ? true : false,
      },
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const createRecord = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "admin only can take this action" });
    }
    const {
      rgn,
      owner,
      comp,
      phas,
      type,
      bs,
      fg,
      bua_from,
      bua_to,
      ga_from,
      ga_to,
      ra_from,
      ra_to,
      utp_from,
      utp_to,
      dp_from,
      dp_to,
      ys_from,
      ys_to,
      dly_from,
      dly_to,
    } = req.body;

    const country = await Country.findOne({ where: { name: rgn } });

    if (!country) {
      return res.status(400).json({ message: "Rgn Not Found" });
    }

    var dp_FromString = dp_from;
    // Convert the percentage string to a float using parseFloat
    var db_FromFloat = parseFloat(dp_FromString) / 100;

    var dp_ToString = dp_to;
    // Convert the percentage string to a float using parseFloat
    var db_ToFloat = parseFloat(dp_ToString) / 100;

    await Record.create({
      rgn,
      owner,
      comp,
      phas,
      type,
      bs,
      fg,
      bua_from,
      bua_to,
      ga_from,
      ga_to,
      ra_from,
      ra_to,
      utp_from,
      utp_to,
      dp_from: db_FromFloat,
      dp_to: db_ToFloat,
      ys_from,
      ys_to,
      dly_from,
      dly_to,
    });

    return res.status(201).json({ message: "Record Created Successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const editRecord = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "admin only can take this action" });
    }

    const { recordId } = req.params;
    const {
      rgn,
      owner,
      comp,
      phas,
      type,
      bs,
      fg,
      bua_from,
      bua_to,
      ga_from,
      ga_to,
      ra_from,
      ra_to,
      utp_from,
      utp_to,
      dp_from,
      dp_to,
      ys_from,
      ys_to,
      dly_from,
      dly_to,
    } = req.body;

    const country = await Country.findOne({ where: { name: rgn } });

    if (!country) {
      return res.status(400).json({ message: "Rgn Not Found" });
    }

    const record = await Record.findByPk(recordId);

    if (!record) {
      return res.status(400).json({ message: "Record not Found" });
    }

    await record.update({
      rgn,
      owner,
      comp,
      phas,
      type,
      bs,
      fg,
      bua_from,
      bua_to,
      ga_from,
      ga_to,
      ra_from,
      ra_to,
      utp_from,
      utp_to,
      dp_from,
      dp_to,
      ys_from,
      ys_to,
      dly_from,
      dly_to,
    });

    return res.status(200).json({ message: "Record Updated Successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const deleteRecord = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "admin only can take this action" });
    }

    const { recordId } = req.params;

    const record = await Record.findByPk(recordId);

    if (!record) {
      return res
        .status(400)
        .json({ message: "Record Not Found May be It's Deleted" });
    }

    await record.destroy();

    return res.status(200).json({ message: "Record Deleted Successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const importRecordExcel = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "admin only can take this action" });
    }

    const file = req.file;
    //   Check if the file is Excel
    const fileTypes = /xls|xlsx/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (!file || (!extname && !mimetype)) {
      return res.status(400).send("Please upload an Excel file");
    }

    const workbook = xlsx.readFile(file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const records = await Record.findAll();

    for (let i = 0; i < data.length; i++) {
      await Record.create({
        rgn: data[i].rgn,
        owner: data[i].owner,
        comp: data[i].comp,
        phas: data[i].phas,
        type: data[i].type,
        bs: data[i].bs,
        fg: data[i].fg,
        bua_from: data[i].bua_from,
        bua_to: data[i].bua_to,
        ga_from: data[i].ga_from,
        ga_to: data[i].ga_to,
        ra_from: data[i].ra_from,
        ra_to: data[i].ra_to,
        utp_from: data[i].utp_from,
        utp_to: data[i].utp_to,
        dp_from: data[i].dp_from,
        dp_to: data[i].dp_to,
        ys_from: data[i].ys_from,
        ys_to: data[i].ys_to,
        dly_from: data[i].dly_from,
        dly_to: data[i].dly_to,
        dly_delivered: data[i].dly_delivered,
      });
    }

    if (records) {
      records.map((record) => {
        record.destroy();
      });
    }

    const setting = await Setting.findOne();

    if (setting) {
      await setting.update({ is_closed: false });
    }

    fs.unlinkSync(file.path);

    return res
      .status(200)
      .json({ message: "Excel File uploaded Successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const importRecordPDF = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "admin only can take this action" });
    }

    const files = req.files;

    // Check if the file is PDF
    const fileTypes = /pdf/;
    for (let i = 0; i < files.length; i++) {
      var extname = fileTypes.test(
        path.extname(files[i].originalname).toLowerCase()
      );
      var mimetype = fileTypes.test(files[i].mimetype);
      if (!extname || !mimetype) {
        return res.status(400).send("Please upload only PDF files");
      }
    }

    // Add the new PDF files to the database
    await PDFFile.destroy({ where: {}, truncate: true });
    for (let i = 0; i < files.length; i++) {
      await PDFFile.create({
        path: files[i].originalname,
      });
    }

    return res.status(200).json({ message: "PDF Files Uploaded Successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = {
  getRecords,
  createRecord,
  editRecord,
  deleteRecord,
  importRecordExcel,
  importRecordPDF,
};
