const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, "review can not be empty!!"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    careatAt: {
      type: Date,
      default: Date.now,
    },
    stud: {
      type: mongoose.Schema.ObjectId,
      ref: "Stud",
      require: [true, "review must belong to student"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      require: [true, "review must belong to user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
