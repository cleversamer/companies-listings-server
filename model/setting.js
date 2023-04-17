const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Setting = sequelize.define("setting", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  is_closed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = Setting;
