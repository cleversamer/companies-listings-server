const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 21600000, // 15 minutes
  max: 2, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  handler: function (req, res) {
    return res
      .status(400)
      .json({ message: "you make request twice you have to wait 6 hours " });
  },
});

module.exports = limiter;
