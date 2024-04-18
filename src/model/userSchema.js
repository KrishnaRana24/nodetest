const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },

  email: {
    type: String,
    require: true,
    unique: true,
    validator: [validator.isEmail, "invalid email"],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "admin", "student"],
    default: "user",
  },
  password: {
    type: String,
    require: [true, "plz provide valid password"],
    minlen: 8,
    select: false,
  },
  cpassword: {
    type: String,
    require: [true, "plz retype the correct password"],
    validator: {
      validator: function (e1) {
        return e1 === this.password;
      },
      message: "password are not same",
    },
  },
  pwdChangeAt: Date,
  pwdResetToken: String,
  pwdResetExpire: Date,
});

userSchema.pre("save", async function (next) {
  //only run this function when password is modified
  if (!this.isModified("password")) return next();
  //hash the password at the cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //delete password field
  this.cpassword = undefined;
});

userSchema.pre("save", function (next) {
  if (this.isModified("password") || this.isNew) return next;
  this.pwdChangeAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (candidatePwd, userPwd) {
  return await bcrypt.compare(candidatePwd, userPwd);
};

userSchema.methods.chagePwdAfter = function (JWTTimeStamp) {
  if (this.pwdChangeAt) {
    console.log(pwdChangeAt, JWTTimeStamp);
  }
};

userSchema.methods.createResetPwdToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.pwdResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.pwdResetToken);
  this.pwdResetExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
