const User = require("../../model/user");

const getPendings = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "admin only can take this action" });
    }

    const page = +req.query.page || 1;
    const itemPerPage = +req.query.limit || 2;
    const searchBy = req.query.searchBy;
    const searchValue = req.query.searchValue;
    const orderBy = req.query.orderBy || "createdAt";
    const sort = req.query.sort || "DESC";

    let whereClause = { status: "pending" };

    const fields = ["user_name", "whats_app", "company_name"];
    fields.map((field) => {
      if (searchBy === field) {
        whereClause[field] = searchValue.toString();
      }
    });

    const pending = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      order: [[orderBy, sort]],
      offset: (page - 1) * itemPerPage,
      limit: itemPerPage,
    });

    return res.status(200).json({
      pending: pending.rows,
      pagenation: {
        page,
        itemPerPage,
        totalItems: pending.count,
        nextPage: page + 1,
        nextTwoPage: page + 2,
        nextThreePage: page + 3,
        previousPage: page - 1,
        currentPage: page,
        hasNextPage: itemPerPage * page < pending.count,
        hasNextTwoPage: itemPerPage * (page + 2) < pending.count,
        hasNextThreePage: itemPerPage * (page + 3) < pending.count,
        hasPreviousPage: page > 1,
        lastPage: Math.ceil(pending.count / itemPerPage),
        hasPagenation: pending.count > itemPerPage ? true : false,
      },
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const getPending = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "admin only can take this action" });
    }

    const { userId } = req.params;
    const user = await User.findOne({
      where: { id: userId, status: "pending" },
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
};

const acceptUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "admin only can take this action" });
    }

    const { userId } = req.params;
    const user = await User.findOne({
      where: { id: userId, status: "pending" },
    });
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    // expiration Date After 30 days From Today
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    await user.update({
      is_active: true,
      status: "active",
      expire_date: expirationDate,
      verify_date: new Date(),
      verify_code: null,
      verify_code_expired: null,
    });
    return res.status(200).json({ message: "user accepted successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const rejectUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "admin only can take this action" });
    }

    const { userId } = req.params;
    const user = await User.findOne({
      where: { id: userId, status: "pending" },
    });

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    await user.destroy();
    return res.status(200).json({ message: "user rejected successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = {
  getPendings,
  getPending,
  acceptUser,
  rejectUser,
};
