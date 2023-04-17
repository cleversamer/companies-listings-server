const Setting = require("../model/setting");

const isClosed = async (req, res, next) => {
  try {
    const closedSite = await Setting.findOne({ where: { is_closed: true } });

    if (closedSite) {
      return res.status(400).json({ message: "site is closed" });
    }

    next();
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = { isClosed };
