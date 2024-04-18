const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");

exports.signUp = async (req, res) => {
  const newUser = await User.create(req.body);
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECURE, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
};
