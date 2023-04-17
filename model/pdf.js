const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const PDFFile = sequelize.define("pdfile", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  path: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = PDFFile;
