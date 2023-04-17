const Sequelize = require("sequelize");
const sequelize = require("../utils/database");
const bcrypt = require("bcrypt");
const cron = require("node-cron");
const { Op } = require("sequelize");

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  user_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  whats_app: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  company_name: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  role: {
    type: Sequelize.STRING,
    enum: ["user", "admin"],
    defaultValue: "user",
    allowNull: false,
  },
  has_countries: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  is_active: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  is_expired: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  expire_date: {
    type: Sequelize.DataTypes.DATE,
    allowNull: true,
  },
  expire_message: {
    type: Sequelize.DataTypes.STRING,
    allowNull: true,
    defaultValue: "Your Account Is Expired",
  },
  verify_date: {
    type: Sequelize.DataTypes.DATE,
    allowNull: true,
  },
  verify_code: {
    type: Sequelize.DataTypes.STRING,
    allowNull: true,
  },
  verify_code_expired: {
    type: Sequelize.DataTypes.DATE,
    allowNull: true,
  },
  forget_password_code: {
    type: Sequelize.DataTypes.STRING,
    allowNull: true,
  },
  forget_password_code_expired: {
    type: Sequelize.DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
    enum: ["pending", "active", "rejected", "expired"],
    defaultValue: "pending",
  },
});

// Hash Password Before Create
User.beforeCreate(async (user, options) => {
  const hashPassword = await bcrypt.hash(user.password, 12);
  user.password = hashPassword;
});

// Hash Password function to hash update password
User.prototype.hashPassword = async function (password) {
  return await bcrypt.hash(password, 12);
};

// Compare Password
User.prototype.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Check if user has an active subscription
User.prototype.hasActiveSubscription = function () {
  return this.expire_date >= new Date();
};

async function checkExpiration() {
  const currentDate = new Date();
  const expiredUsers = await User.findAll({
    where: { is_expired: false, expire_date: { [Op.lt]: currentDate } },
  });

  for (const user of expiredUsers) {
    await user.update({ is_expired: true, status: "expired" });
  }
}

// run every day at midnight
const task = cron.schedule("0 0 * * *", checkExpiration);
if (cron.validate("0 0 * * *")) {
  task.start();
} else {
}

module.exports = User;
