require("dotenv").config();

const express = require("express");
const app = express();
const db = require("./models");
const router = require("./router");
const cookieParser = require('cookie-parser');
//const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const isLoggedIn = require('./middleware/authMiddleware')

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.set("views", "./public/views");
app.use(cookieParser())
app.use(express.json())

app.use(router);

const PORT = process.env.PORT || 3000;

db.sequelize.sync({
    //force: true,
  })
  .then(() => {
    console.log("Database Connected");
    app.listen(PORT, () => {
      console.log("=============================== ");
      console.log(`Server is running on PORT ${PORT}`);
      console.log("===============================");
    });
  })
  .catch((error) => {
    console.log(error);
  });
