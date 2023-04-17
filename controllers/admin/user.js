const { Op } = require("sequelize");
const Country = require("../../model/countries");
const User = require("../../model/user");
const UserCountry = require("../../model/userCountry");

// get all users
const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "admin Only take this action" });
    }

    const page = +req.query.page || 1;
    const itemPerPage = +req.query.limit || 10;
    const searchBy = req.query.searchBy;
    const searchValue = req.query.searchValue;
    const orderBy = req.query.orderBy || "createdAt";
    const sort = req.query.sort || "DESC";

    let whereClause = { status: "active", role: "user" };

    if (searchBy === "expire_date" && searchValue) {
      const newDate = searchValue.split("/").reverse().join("-");
      const date = new Date(newDate);
      if (!isNaN(date.getTime())) {
        // Check if date is valid
        whereClause.expire_date = date;
      }
    }

    const fields = ["user_name", "whats_app", "company_name"];

    fields.map((field) => {
      if (searchBy === field) {
        whereClause[field] = searchValue.toString();
      }
    });

    const users = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Country,
          attributes: ["id"],
          through: { attributes: [] },
        },
      ],
      attributes: {
        exclude: [
          "password",
          "verify_code",
          "verify_code_expired",
          "forget_password_code",
          "forget_password_code_expired",
        ],
      },
      order: [[orderBy, sort]],
      offset: (page - 1) * itemPerPage,
      limit: itemPerPage,
    });

    return res.status(200).json({
      users: users.rows,
      pagenation: {
        page,
        itemPerPage,
        totalItems: users.count,
        nextPage: page + 1,
        nextTwoPage: page + 2,
        nextThreePage: page + 3,
        previousPage: page - 1,
        currentPage: page,
        hasNextPage: itemPerPage * page < users.count,
        hasNextTwoPage: itemPerPage * (page + 2) < users.count,
        hasNextThreePage: itemPerPage * (page + 3) < users.count,
        hasPreviousPage: page > 1,
        lastPage: Math.ceil(users.count / itemPerPage),
        hasPagenation: users.count > itemPerPage ? true : false,
      },
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// get one user
const getUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "admin Only take this action" });
    }
    const { userId } = req.params;
    const user = await User.findOne({
      where: { id: userId },
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// create new user
const createUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "admin Only take this action" });
    }
    const {
      user_name,
      company_name,
      whats_app,
      password,
      expire_date,
      expire_message,
      countries,
    } = req.body;

    // Check If The UserName Or Phone Are Already Exist And Handle Errors
    const userExists = await User.findOne({
      where: {
        whats_app,
      },
    });

    if (userExists) {
      return res.status(409).json({ message: "whats_app already exists" });
    }

    // expiration Date After 30 days From Today
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    const user = await User.create({
      user_name,
      company_name,
      whats_app,
      password,
      role: "user",
      has_countries: true,
      is_active: true,
      verify_date: new Date(),
      status: "active",
      expire_date: expire_date || expirationDate,
      expire_message,
    });

    await countries.map(async (country) => {
      UserCountry.create({
        userId: user.id,
        countryId: country.id,
      });
    });

    return res.status(200).json({ message: `user created successfully ` });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// update user
const upadteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "admin Only take this action" });
    }
    const { userId } = req.params;
    const {
      user_name,
      company_name,
      expire_message,
      whats_app,
      password,
      expire_date,
      countries,
    } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    // Check If The UserName Or Phone Are Already Exist And Handle Errors
    const whats_appExists = await User.findOne({
      where: {
        [Op.and]: {
          id: { [Op.ne]: userId },
          whats_app,
        },
      },
    });

    if (whats_appExists) {
      return res.status(409).json({ message: "whats_app already exists" });
    }

    // expiration Date After 30 days From Today
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    if (password) {
      var hashPassword = await user.hashPassword(password);
    }

    // get All User Countries
    const currentCountries = await UserCountry.findAll({
      where: { userId },
    });

    // get The Current Countries ID
    const currentCountryIds = currentCountries.map(
      (country) => country.countryId
    );

    // get The New Countries ID
    const newCountriesId = countries.map((country) => country.id);

    // Country ID To delete
    const removeCountryId = currentCountryIds.filter((id) => {
      return !newCountriesId.includes(id);
    });

    // Country ID To Add New Country
    const newCountryId = newCountriesId.filter((id) => {
      return !currentCountryIds.includes(id);
    });

    removeCountryId.map(async (id) => {
      await UserCountry.destroy({ where: { userId, countryId: id } });
    });

    newCountryId.map(async (id) => {
      await UserCountry.create({
        userId,
        countryId: id,
      });
    });

    await user.update({
      user_name,
      company_name,
      whats_app,
      password: hashPassword || user.password,
      expire_date: expire_date || user.expire_date,
      expire_message: expire_message || user.expire_message,
    });

    return res.status(200).json({ message: "user updated successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// update Admin
const updateAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "admin Only take this action" });
    }

    const { user_name, whats_app, password } = req.body;

    const user = await User.findByPk(req.user.id);

    const whats_appExists = await User.findOne({
      where: {
        [Op.and]: {
          id: { [Op.ne]: req.user.id },
          whats_app,
        },
      },
    });

    if (whats_appExists) {
      return res.status(409).json({ message: "whats_app already exists" });
    }

    if (password) {
      var hashPassword = await user.hashPassword(password);
    }

    await user.update({
      user_name,
      whats_app,
      password: hashPassword || user.password,
    });

    return res.status(200).json({ message: "Admin Updated Successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "admin Only take this action" });
    }
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    await UserCountry.destroy({ where: { userId } });

    await user.destroy();

    return res.status(200).json({ message: "user deleted successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = {
  createUser,
  upadteUser,
  updateAdmin,
  deleteUser,
  getUsers,
  getUser,
};
