const mongoose = require("mongoose");
const validator = require("validator");

const studSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: [true, "email is already present"],
    validator(value) {
      if (!validator.isEmail(value)) {
        throw new Error("invalid email");
      }
    },
  },
  phone: {
    type: Number,
    require: true,
    unique: true,
    min: 10,
  },
  address: {
    type: String,
    require: true,
  },
});

const Student = new mongoose.model("Student", studSchema);

module.exports = Student;
