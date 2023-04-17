const User = require("../model/user");
const UserCountry = require("../model/userCountry");

const getUserCountry = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    const userCountries = await user.getCountries({
      order: [["name", "ASC"]],
      joinTableAttributes: [],
    });

    return res.status(200).json(userCountries);
  } catch (err) {
    return res.status(500).json(err);
  }
};

const createUserCountry = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    const { countries } = req.body;

    if (!user) {
      return res.status(400).json({ message: "user was not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "only users can have Countries" });
    }

    if (user.has_countries) {
      return res.status(400).json({ message: "you can't add Countries again" });
    }

    countries.map(async (countryId) => {
      await UserCountry.create({
        userId,
        countryId,
      });
    });

    await user.update({ has_countries: true });

    return res.status(200).json({ message: "countries Addedd Successfuly" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = {
  getUserCountry,
  createUserCountry,
};
