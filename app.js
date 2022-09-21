const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const logger = require("./utils/logger");
const morgan = require("morgan");
const registerroutes = require("./routes/registerroutes");
const loginroutes = require("./routes/loginroutes");
const purchasesroutes = require("./routes/purchaseroutes");
const salesroutes = require("./routes/saleroutes");
const salelistroutes = requirtre("./routes/saleslistroute");
const purchaselistroute = require("./routes/purchaselistroute");
// instantiating server
const app = express();
const passport = require("passport");
const Signup = require("./models/Signup");

//configs
require("dotenv").config({ path: "./config/config.env" });
// setting up mongoose

//connect mongoose
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true });
const db = mongoose.connection;

// Check connection
db.once("open", function () {
  console.log("Connected to MongoDB");
});
// Check for db errors
db.on("error", function (err) {
  console.error(err);
});

//express sesssion
const expressSession = require("express-session")({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 },
});

// views settings or configurations
app.set("view engine", "pug");
app.set("views", "./views");

// middle ware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(expressSession);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(passport.initialize());
app.use(passport.session());
passport.use(Signup.createStrategy());
passport.serializeUser(Signup.serializeUser());
passport.deserializeUser(Signup.deserializeUser());

const loginchecker = function (req, res, next) {
  if (req.path != "/login" && req.path != "/" && !req.session.user) {
    logger.error("unauthorized access attempted....");
    res.redirect("/");
  }

  logger.info(`${req.method}  ${req.url} statusCode ${req.statusCode}`);
  next();
};

app.use(loginchecker);
// routes

app.use("/", registerroutes);
app.use("/", loginroutes);
app.use("/", salesroutes);
app.use("/", purchasesroutes);
app.use("/", salelistroutes);
app.use("/", purchaselistroute);
// handling non existing routes
app.get("*", (req, res) => {
  res.render("landing", { msg: "SORRY, WRONG ADDRESS " });
  logger.error("Page not found");
});

// server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server listening on port ${port}`);
  logger.info(`Server started and running on port : ${port}`);
});
