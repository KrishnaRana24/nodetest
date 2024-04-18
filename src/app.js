const express = require("express");
const mongoose = require("mongoose");
const studRouter = require("./route/studRoute");
const userRouter = require("./route/userRoute");
const reviewRouter = require("./route/reviewRoute");
const crypto = require("crypto");
const dotenv = require("dotenv");
const ratelimit = require("express-rate-limit");
const helmet = require("helmet");
const fs = require("fs");
const http = require("http");
// const crypto = require("crypto-js");

// Generate a random secret key (32 bytes)
// const secretKey = crypto.randomBytes(32).toString("hex");
// console.log("Generated Secret Key:", secretKey);

dotenv.config();
mongoose.connect("mongodb://localhost:27017/studentdb");

const app = express();
const port = process.env.PORT;

//set secure http header
app.use(helmet());

const limiter = ratelimit({
  max: 100,
  windows: 60 * 60 * 1000,
  message: "too many request from this IP , try again in one hour",
});

app.use("/", limiter);
//============================================================
//json cleaing
http.get("/q2", async (req, res) => {
  const data = await fetch(
    "https://coderbyte.com/api/challenges/json/json-cleaning"
  );
  let jsonData = await data.json();

  for (let key in jsonData) {
    if (typeof jsonData[key] === "object") {
      if (Array.isArray(jsonData[key])) {
        let arr = jsonData[key];
        let arr1 = [];
        for (let i = 0; i < arr.length; i++) {
          if (jsonData[key][i] !== "-") {
            arr1.push(arr[i]);
          }
        }
        jsonData[key] = arr1;
      } else {
        for (let k in jsonData[key]) {
          if (jsonData[key][k] === "" || jsonData[key][k] === "N/A") {
            delete jsonData[key][k];
          }
        }
      }
    }
    if (jsonData[key] === "-") {
      delete jsonData[key];
    }
  }

  console.log(jsonData);

  return res.status(200).json({
    jsonData,
  });
});
//==============================================================
//age counting
http.get("/q3", async (req, res) => {
  const data = await fetch(
    "https://coderbyte.com/api/challenges/json/age-counting"
  );
  let jsonData = await data.json();

  const arr = jsonData.data.split(", ");
  let obj = [];

  for (let i = 0; i < arr.length; i = i + 2) {
    let key = arr[i].split("=")[1];
    let age = arr[i + 1].split("=")[1];

    let d = {
      key: key,
      age: age,
    };
    obj.push(d);
  }

  let str = "";
  for (let i = 0; i < obj.length; i++) {
    if (obj[i].age == 32) {
      str = str + obj[i].key + "\n";
    }
  }

  fs.writeFileSync("output.txt", str);

  const hashedData = crypto
    .createHash("sha256")
    .update(JSON.stringify(str))
    .digest("hex");

  return res.status(200).json({
    status: "Success",
    hashedData,
  });
});
//=====================================================

http.get(
  "https://coderbyte.com/api/challenges/json/age-counting",
  (req, res) => {
    return res.data.json();
  }
);

data.then((r) => {
  const data = r.split(",");
  let arr = 0;
  data.forEach((element) => {
    let key = element.split("=");
    if (key[0].trim() === "age" && Number(key[1]) >= 50) {
      arr++;
    }
  });
  console.log(arr);
});

//==========================================================

app.use(express.json());
// app.use(studRouter);
// app.use(userRouter);
// app.use(reviewRouter);

// app.use((req, res) => {
//   console.log(req.headers);
// });

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
