module.exports = (req, res, next) => {
  const user = req.user;

  if (!user.hasActiveSubscription()) {
    return res
      .status(401)
      .json({ message: "You must be subscribed to see this content" });
  }

  next();
};
