const { Op } = require("sequelize");
const Type = require("../../model/type");

const getAllType = async (req, res) => {
  try {
    const type = await Type.findAll({
      order: [["name", "ASC"]],
    });

    return res.status(200).json(type);
  } catch (err) {
    return res.status(500).json(err);
  }
};

const getOneType = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "admin only can take this action" });
    }

    const id = req.params.id;
    const type = await Type.findByPk(id);

    if (!type) {
      return res.status(400).json({ message: "type not exist" });
    }

    return res.status(200).json(type);
  } catch (err) {
    return res.status(500).json(err);
  }
};

const createType = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "admin only can take this action" });
    }
    const { name } = req.body;

    const type = await Type.findOne({ where: { name } });

    if (type) {
      return res.status(400).json({ message: "name already exist" });
    }

    await Type.create({
      name,
    });
    return res.status(201).json({ message: "type created successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const editType = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "admin only can take this action" });
    }

    const typeId = req.params.id;
    const { name } = req.body;

    const existName = await Type.findOne({
      where: { name, id: { [Op.ne]: typeId } },
    });

    if (existName) {
      return res.status(400).json({ message: "name already exist" });
    }

    const type = await Type.findOne({ where: { id: typeId } });

    if (!type) {
      return res.status(400).json({ message: "type not found" });
    }

    await type.update({ name });

    return res.status(201).json({ message: "type updated successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Change Status To Deleted
const deleteType = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "admin only can take this action" });
    }

    const id = req.params.id;

    const type = await Type.findOne({ where: { id } });

    if (!type) {
      return res.status(400).json({ message: "type not found" });
    }

    await type.destroy();

    return res.status(201).json({ message: "type deleted successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = {
  getAllType,
  getOneType,
  createType,
  editType,
  deleteType,
};
