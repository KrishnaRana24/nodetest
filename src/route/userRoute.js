const { promisify } = require("util");
const express = require("express");
const User = require("../model/userSchema");
const router = express.Router();
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const multer = require("multer");

const mulstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/user/"); // Destination folder for uploaded images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename for uploaded image
  },
});

const upload = multer({ storage: mulstorage });

//jwt Token

const Token = (id) => {
  let secretOrPrivateKey = process.env.JWT_SECRET_KEY || "fallbackSecretKey";
  return jwt.sign({ id }, secretOrPrivateKey, {
    expiresIn: process.env.JWT_EXPIRE_IN || "24h",
  });
};

//signup user route
router.post("/signUp", upload.single("photo"), async (req, res) => {
  try {
    const newUser = new User(req.body);
    const token = Token(newUser._id);
    //check if photo is uploaded
    if (!req.file) {
      res.status(400).json({ message: "photo is not uploaded!!" });
    }
    const nuser = await newUser.save();
    res.status(201).json({ token, user: nuser });
    //res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 });
    // console.log(nuser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//get all user data route
router.get("/getData", async (req, res) => {
  try {
    const data = await User.find();
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//login user route with email,pwd
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    //check if email or password is exits
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "plz provide email and password" });
    }
    //check if user is exits and password is correct
    const user = await User.findOne({ email }).select("+password");
    const correct = await user.correctPassword(password, user.password);
    if (!user || !correct) {
      return res.status(400).json({ message: "invalid email or password" });
    }
    //if all ok send token to client
    const token = Token(user._id);
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//authentication using JWT
router.use((req, res, next) => {
  try {
    //1.)getting token and check if is there or not!
    let token;
    secretOrPrivateKey = process.env.JWT_SECRET_KEY || "fallbackSecretKey";
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1] || req.cookies.jwt;
    }
    if (!token) {
      res
        .status(401)
        .json({ message: "you're not logged in !! plz login to get access" });
    }
    //2.)verify token
    const decode = promisify(jwt.verify)(token, secretOrPrivateKey);
    req.user = decode;
    next();
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ message: "Unauthorized. Token verification failed." });
  }
});

//admin route to delete the data
router.post("/roleToDelete", (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return res.json({
      message: "data deleted successfully!!",
    });
  } else {
    res
      .status(403)
      .json({ message: "you don't have a permision to access this action!!!" });
  }
  next();
});

//forgot password route
router.post("/forgotpwd", async (req, res) => {
  try {
    //1. get user using post email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.json({ message: "there is no user with this email" });
    }
    //2. generate random token
    const resetToken = user.createResetPwdToken();
    await user.save({ validateBeforeSave: false });
    //3.send it to the user
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/resetpwd/${resetToken}`;

    const message = `forgot your password ! , plz resert password with new one on ${resetURL}`;
    try {
      await sendEmail({
        email: user.email,
        subject: "your reset password token is vaild for 10 min",
        message,
      });
      res
        .status(200)
        .json({ status: "success", message: "token send to the email" });
    } catch (err) {
      (user.pwdResetToken = undefined), (user.pwdResetExpire = undefined);
      await user.save({ validateBeforeSave: false });
    }
  } catch (error) {
    console.error(error);
  }
});

//reset password route
router.patch("/resetpwd/:token", async (req, res, next) => {
  //1. get user base on token
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    pwdResetToken: hashToken,
    pwdResetExpire: { $gt: Date.now() },
  });
  //2.if token is not expire ,set new password to user:
  if (!user) {
    return next("token has been expired or invalid!!", 400);
  }
  user.password = req.body.password;
  user.cpassword = req.body.cpassword;
  user.pwdResetToken = undefined;
  user.pwdResetExpire = undefined;
  await user.save();

  //3.update change pwd property
  //4.log the user in ,send jwt

  const token = Token(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

//update password route
router.patch("/updatepwd", async (req, res) => {
  //1.get user from collection
  const user = await User.findById(req.user.id).select("+password");

  //2.check if posted pwd is currect
  if (
    user !== null &&
    !(await user.correctPassword(req.body.passwordCurret, user.password))
  ) {
    return res.json({ message: "your password is wrong!!" });
  }
  // if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
  //   return next("your password is wrong !", 401);
  // }
  //3. if so, update pwd
  if (user !== null) {
    user.password = req.body.password;
    user.cpassword = req.body.cpassword;
    await user.save();
  }
});

//update user data
router.patch("/updateMe", async (req, res) => {
  try {
    if (req.body.password || req.body.cpassword) {
      res.json({ message: "this is not for password update" });
    }
  } catch (error) {
    res.json({ message: "user data are not updated" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "User logout successfully!" });
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
