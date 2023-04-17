const { Op } = require("sequelize");
const Country = require("../../model/countries");
const UserCountry = require("../../model/userCountry");

const getCountries = async (req, res) => {
  try {
    const countries = await Country.findAll();
    return res.status(200).json(countries);
  } catch (err) {
    return res.status(500).json(err);
  }
};

const getCountry = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "admin only can take this action" });
    }

    const id = req.params.id;
    const country = await Country.findByPk(id);

    if (!country) {
      return res.status(400).json({ message: "country not exist" });
    }

    res.status(200).json(country);
  } catch (err) {
    return res.status(500).json(err);
  }
};

const createCountry = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "admin only can take this action" });
    }

    const { name } = req.body;

    const country = await Country.findOne({ where: { name } });

    if (country) {
      return res.status(400).json({ message: "name already exist" });
    }

    await Country.create({
      name,
    });

    return res.status(201).json({ message: "country created successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const editCountry = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "admin only can take this action" });
    }

    const countryId = req.params.id;
    const { name } = req.body;

    const existName = await Country.findOne({
      where: { name, id: { [Op.ne]: countryId } },
    });

    if (existName) {
      return res.status(400).json({ message: "name already exist" });
    }

    const country = await Country.findOne({ where: { id: countryId } });

    if (!country) {
      return res.status(400).json({ message: "country not found" });
    }

    await country.update({ name });

    return res.status(201).json({ message: "country updated successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Change Status To Deleted
const deleteCountry = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "admin only can take this action" });
    }

    const id = req.params.id;

    const country = await Country.findOne({ where: { id } });

    if (!country) {
      return res.status(400).json({ message: "country not found" });
    }

    const userContry = await UserCountry.findOne({
      where: { countryId: country.id },
    });

    if (userContry) {
      return res.status(400).json({
        message: "you can't delete this country because user choose it",
      });
    }

    await country.destroy();

    return res.status(201).json({ message: "country deleted successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = {
  getCountries,
  createCountry,
  editCountry,
  deleteCountry,
  getCountry,
};
