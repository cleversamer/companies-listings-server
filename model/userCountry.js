const sequelize = require("../utils/database");
const Sequelize = require("sequelize");

const UserCountry = sequelize.define("UserCountry", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});

module.exports = UserCountry;
