const Setting = require("../../model/setting");
const { getIO } = require("../../socket");

const settings = async (req, res) => {
  try {
    const setting = await Setting.findOne();

    if (!setting) {
      var _setting = await Setting.create({
        is_closed: false,
      });
    }

    return res.status(200).json(setting || _setting);
  } catch (err) {
    return res.status(500).json(err);
  }
};

const openSite = async (req, res) => {
  try {
    const setting = await Setting.findOne({ where: { is_closed: true } });

    if (!setting) {
      return res.status(400).json({ message: "Site Is Already Opend" });
    }

    await setting.update({
      is_closed: false,
    });

    getIO().emit("open", "Site Is Opend");

    return res.status(200).json({ message: "Site Is Opend" });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const closeSite = async (req, res) => {
  try {
    const setting = await Setting.findOne();

    if (setting.is_closed) {
      return res.status(400).json({ message: "Site is Closed" });
    }

    getIO().emit("close-message", "Site Will Close After 5 Minutes");

    setTimeout(async () => {
      await setting.update({ is_closed: true });
      getIO().emit("close", "Site Is Closed");
    }, 5 * 60 * 1000);

    return res.status(200).json({ message: "Site Will Close After 5 Minutes" });
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = { settings, openSite, closeSite };
