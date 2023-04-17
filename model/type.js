const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Type = sequelize.define("type", {
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

module.exports = Type;
