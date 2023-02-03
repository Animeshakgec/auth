const express = require('express');
const authcontroller = require('./../contollers/authhandler');
const profilecontroller = require('./../contollers/profilecontroller');
const router = express.Router();
router.post("/addprofile", authcontroller.protect, profilecontroller.addnew);
router.post("/updateprofile", authcontroller.protect, profilecontroller.updateprofile);
router.get("/getprofile", authcontroller.protect, profilecontroller.getprofile);
module.exports = router;