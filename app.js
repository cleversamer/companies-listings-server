const express = require("express");
const app = express();
const sequelize = require("./utils/database");
const cors = require("cors");
require("dotenv").config();
const helmet = require("helmet");

const PORT = process.env.PORT || 4000;

const authRoutes = require("./routes/auth");
const countryRoutes = require("./routes/admin/country");
const typeRoutes = require("./routes/admin/type");
const userRoutes = require("./routes/admin/user");
const pendingRoutes = require("./routes/admin/pending");
const recordRoutes = require("./routes/admin/record");
const settingRoutes = require("./routes/admin/settings");

const userCountryRoutes = require("./routes/userCountry");
const userRecordRoutes = require("./routes/userRecord");
const usersRoutes = require("./routes/user");

const User = require("./model/user");
const Country = require("./model/countries");
const UserCountry = require("./model/userCountry");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.API_URL);
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// MiddleWares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(cors({ origin: process.env.API_URL, methods: ["GET", "POST"] }));

app.use(helmet());

User.belongsToMany(Country, { through: UserCountry });
Country.belongsToMany(User, { through: UserCountry });

sequelize
  .sync()
  .then((result) => {
    // Start express server
    const server = app.listen(PORT, () => {
      console.log(`Express server is listening on port ${PORT}`);
    });

    // Initialize socket server
    require("./socket").init(server);

    console.log("Connected to SQL Database Server Successfully!");
  })
  .catch((err) => {
    console.log("Connection to SQL Database Server Failed:", err.message);
  });

app.use("/auth", authRoutes);
app.use("/country", countryRoutes);
app.use("/type", typeRoutes);
app.use("/user", userRoutes);
app.use("/pending", pendingRoutes);
app.use("/record", recordRoutes);
app.use("/setting/site", settingRoutes);

app.use("/userCountry", userCountryRoutes);
app.use("/userRecord", userRecordRoutes);
app.use("/user", usersRoutes);
