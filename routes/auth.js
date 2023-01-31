const express = require('express');
const authcontroller = require('./../contollers/authhandler');
const router = express.Router();
router.post("/login", authcontroller.login);
router.post("/signup", authcontroller.signup);
router.post("/forgetpassword", authcontroller.forgetpassword);
router.patch("/resetpassword/:token", authcontroller.resetpassword);
module.exports = router;