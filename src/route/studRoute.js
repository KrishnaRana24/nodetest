const express = require("express");
const router = express.Router();
const Student = require("../model/studSchema");
const userRoute = require("./userRoute");
//add data
router.post("/students", async (req, res) => {
  try {
    const stud = new Student(req.body);
    const createStud = await stud.save();
    res.status(201).send(createStud);
  } catch (error) {
    res.send(error);
  }
});

//upload file router
router.post("/students/upload", (req, res) => {
  try {
    res.status(200).send("file uploaded");
    console.log("file uploaded");
  } catch (error) {
    res.status(404).send("not found");
  }
});

// get data
router.use(userRoute);
router.get("/students", async (req, res) => {
  try {
    const getData = await Student.find();
    res.send(getData);
  } catch (error) {
    res.send(error);
  }
});

//get One record
router.get("/students/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const getOne = await Student.findById(_id);
    res.send(getOne);
  } catch (error) {
    res.send(error);
  }
});

//update record
router.patch("/students/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const updateData = await Student.findByIdAndUpdate(_id, req.body, {
      new: true,
    });
    res.send(updateData);
  } catch (error) {
    res.send(error);
  }
});

//delete record

// router.use(userRoute("admin"));

router.delete("/students/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const deleteData = await Student.findByIdAndDelete(_id);
    res.send(deleteData);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
