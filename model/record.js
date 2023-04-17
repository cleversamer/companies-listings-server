const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Record = sequelize.define("record", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  rgn: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  owner: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  comp: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  phas: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  type: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  bs: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  fg: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  bua_from: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  bua_to: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  ga_from: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  ga_to: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  ra_from: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  ra_to: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  utp_from: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  utp_to: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  dp_from: {
    type: Sequelize.DECIMAL(5, 2), // 99.99
    allowNull: true,
  },
  dp_to: {
    type: Sequelize.DECIMAL(5, 2), // 99.99
    allowNull: true,
  },
  ys_from: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  ys_to: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  dly_from: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  dly_to: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  dly_delivered: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = Record;
