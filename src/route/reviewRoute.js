const express = require("express");
const router = express.Router();
const Review = require("../model/reviewSchema");

router.get("/review", async (req, res) => {
  try {
    const review = await Review.find();
    res.json(review);
  } catch (error) {
    console.log(error);
  }
});

router.post("/review", async (req, res) => {
  try {
    const review = new Review(req.body);
    const addreview = await review.save();
    res.status(201).json(addreview);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
