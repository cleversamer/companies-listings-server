const User = require("../model/user");

// user change password
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password, new_password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    const matchPassword = await user.checkPassword(password);

    if (!matchPassword) {
      return res.status(400).json({ message: "old password is wrong" });
    }

    const hashPassword = await user.hashPassword(new_password);
    await user.update({ password: hashPassword });

    return res.status(200).json({ message: "password updated successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = {
  updatePassword,
};
