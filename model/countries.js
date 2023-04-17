const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Country = sequelize.define("country", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Country;
