const User = require("../model/user");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const { genrateRandomCode } = require("../utils/generateCode");
const axios = require("axios");

const signUp = async (req, res) => {
  try {
    const { user_name, company_name, whats_app, password } = req.body;

    // Check If The UserName Or Phone Are Already Exist And Handle Errors
    const whats_appExists = await User.findOne({
      where: {
        whats_app,
      },
    });

    if (whats_appExists) {
      return res.status(409).json({ message: "whats_app already exists" });
    }

    const user = await User.create({
      user_name,
      company_name,
      whats_app,
      password,
      verify_code: genrateRandomCode(),
      verify_code_expired: new Date(Date.now() + 60 * 60 * 1000), // The Code Will Expired After 1 Hour
    });

    axios
      .post(
        `https://karzoun.app/api/send.php?number=${whats_app}&type=json&instance_id=${process.env.INSTACNE_ID}&access_token=${process.env.ACCESS_TOKEN}`,
        {
          text: `Thank you for signing up! Your one-time verification code is ${user.verify_code}. Please enter this code to complete your registration process. If you did not request this code, please ignore this message`,
        }
      )
      .then((result) => {})
      .catch((err) => {});

    res.status(201).json({
      message:
        "We have sent an OTP to your registered whatsApp Number to verify your account.",
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const adminSignIn = async (req, res) => {
  try {
    const { whats_app, password } = req.body;

    // Check If The UserName Or Phone Are Already Exist And Handle Errors
    const user = await User.findOne({
      where: {
        whats_app,
        role: "admin",
      },
    });

    if (!user) {
      return res.status(400).json({ message: "admin is not exist" });
    }

    const hashPassword = await user.checkPassword(password);

    if (!hashPassword) {
      return res.status(400).json({ message: "password is wrong" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        user_name: user.user_name,
        whats_app: user.whats_app,
        is_active: user.is_active,
        is_expired: user.is_expired,
      },
      process.env.SECTRET_TOKEN,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.SECTRET_TOKEN,
      {
        expiresIn: "30d",
      }
    );

    return res.status(200).json({
      token,
      refreshToken,
      user: {
        id: user.id,
        user_name: user.user_name,
        whats_app: user.whats_app,
        role: user.role,
        is_active: user.is_active,
        is_expired: user.is_expired,
        has_countries: user.has_countries,
      },
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const signIn = async (req, res) => {
  try {
    const { whats_app, password } = req.body;

    // Check If The UserName Or Phone Are Already Exist And Handle Errors
    const user = await User.findOne({
      where: {
        whats_app,
        role: "user",
      },
    });

    if (!user) {
      return res.status(400).json({ message: "user is not exist" });
    }

    if (user.is_expired) {
      return res
        .status(400)
        .json({ message: user.expire_message || "your account is expired" });
    }

    const hashPassword = await user.checkPassword(password);

    if (!hashPassword) {
      return res.status(400).json({ message: "password is wrong" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        user_name: user.user_name,
        whats_app: user.whats_app,
        is_active: user.is_active,
        is_expired: user.is_expired,
      },
      process.env.SECTRET_TOKEN,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.SECTRET_TOKEN,
      {
        expiresIn: "30d",
      }
    );

    return res.status(200).json({
      token,
      refreshToken,
      user: {
        id: user.id,
        user_name: user.user_name,
        whats_app: user.whats_app,
        role: user.role,
        is_active: user.is_active,
        is_expired: user.is_expired,
        has_countries: user.has_countries,
      },
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const refreshToken = (req, res) => {
  try {
    // Refresh token route
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(401).json({ message: "Missing refresh token" });
    }

    // Verify refresh token
    jwt.verify(refresh_token, process.env.SECTRET_TOKEN, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      // Refresh token is valid, issue new access token
      const accessToken = jwt.sign(
        {
          id: decoded.id,
          role: decoded.role,
          user_name: decoded.user_name,
          whats_app: decoded.whats_app,
          is_active: decoded.is_active,
          is_expired: decoded.is_expired,
        },
        process.env.SECTRET_TOKEN,
        {
          expiresIn: "1d",
        }
      );

      // Send new access token to client
      res.status(200).json({ token: accessToken });
    });
  } catch {
    return res.status(500).json(err);
  }
};

const verifyCode = async (req, res) => {
  try {
    const { code } = req.body;
    const { user_name, whats_app } = req.user;
    // Find the user with the provided WhatsApp number and code
    const user = await User.findOne({
      where: {
        user_name,
        whats_app,
        verify_code: +code,
        verify_code_expired: {
          [Op.gt]: new Date(), // Check that the code has not expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    // expiration Date After 30 days From Today

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    await user.update({
      is_active: true,
      verify_date: new Date(),
      status: "active",
      verify_code: null,
      expire_date: expirationDate,
      verify_code_expired: null,
    });
    return res.status(200).json({ message: "account Confirmed" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { whats_app } = req.body;

    const user = await User.findOne({
      where: { whats_app },
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    await user.update({
      forget_password_code: genrateRandomCode(),
      forget_password_code_expired: new Date(Date.now() + 60 * 60 * 1000), // The Code Will Expired After 1 Hour
    });

    axios
      .post(
        `https://karzoun.app/api/send.php?number=${whats_app}&type=json&instance_id=${process.env.INSTACNE_ID}&access_token=${process.env.ACCESS_TOKEN}`,
        {
          text: `We have received a request to reset the password for your account. Please use the following OTP code to reset your password: ${user.forget_password_code} Please do not share this code with anyone else. If you did not request this password reset, please ignore this message.`,
        }
      )
      .then((result) => {})
      .catch((err) => {});

    return res.status(200).json({
      message: "the code is sent",
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { whats_app, code, password } = req.body;

    const user = await User.findOne({
      where: {
        whats_app,
        forget_password_code: code,
        forget_password_code_expired: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    const hashPassword = await user.hashPassword(password);

    await user.update({
      password: hashPassword,
      forget_password_code: null,
      forget_password_code_expired: null,
    });

    return res.status(200).json({ message: "password updated successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const resendVerifyCode = async (req, res) => {
  try {
    const { user_name, whats_app } = req.user;
    // Find the user with the provided WhatsApp number and code
    const user = await User.findOne({
      where: {
        user_name,
        whats_app,
      },
    });

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    await user.update({
      verify_code: genrateRandomCode(),
      verify_code_expired: new Date(Date.now() + 60 * 60 * 1000), // The Code Will Expired After 1 Hour
    });

    axios
      .post(
        `https://karzoun.app/api/send.php?number=${whats_app}&type=json&instance_id=${process.env.INSTACNE_ID}&access_token=${process.env.ACCESS_TOKEN}`,
        {
          text: `Thank you for signing up! Your one-time verification code is ${user.verify_code}. Please enter this code to complete your registration process. If you did not request this code, please ignore this message`,
        }
      )
      .then((result) => {
        return res.status(200).json({ message: "code Sent successfully" });
      })
      .catch((err) => {
        return res.status(400).json({ message: "Server Error" });
      });
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = {
  signUp,
  signIn,
  adminSignIn,
  verifyCode,
  resendVerifyCode,
  forgetPassword,
  refreshToken,
  resetPassword,
};
