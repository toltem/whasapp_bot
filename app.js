var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
require('dotenv').config()
var app = express();
var { WAConnection } = require("@adiwajshing/baileys");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,PATCH,OPTIONS"
  );
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});


const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const Redis = require("ioredis");
const redis = new Redis(REDIS_URL);
const hydrate = require("./routes/hydrate");
rehydrate();

app.use("/", indexRouter);
app.use("/users", usersRouter);

module.exports = app;

async function rehydrate() {
  let toggle = await redis.get("toggle");
  if (toggle === "on") {
    const conn = new WAConnection();

    let auth = await redis.get("auth");

    conn.loadAuthInfo(JSON.parse(auth));

    await conn.connect();
    await hydrate.hydrate(conn);
  }
}
