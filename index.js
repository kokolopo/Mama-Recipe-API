const express = require("express");
const router = require("./src/routes");
const bodyParser = require("body-parser");
const app = express();
const dotEnv = require("dotenv");
const cookieParser = require("cookie-parser");
dotEnv.config();

const port = 3000;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});