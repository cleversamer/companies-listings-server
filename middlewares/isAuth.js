const jwt = require("jsonwebtoken");

const isAuth = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({ message: "invalid token" });
    }

    const token = authorization.split(" ")[1];
    const decodeToken = jwt.verify(token, process.env.SECTRET_TOKEN);

    if (!decodeToken) {
      return res.status(401).json({ message: "invalid token" });
    }

    req.user = decodeToken;

    if (req.user.is_expired) {
      return res.status(401).json({
        message:
          "you don't have access may be because your account not active or it's expired",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json(err);
  }
};

module.exports = { isAuth };
