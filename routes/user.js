const express = require("express");
const userController = require('../controllers/user.js');
const { verify, verifyAdmin, isLoggedIn } = require("../auth.js");

const router = express.Router();

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.patch("/:id/set-as-admin",verify, verifyAdmin, userController.updateUserAsAdmin);

router.get("/details", verify, userController.getProfile);

router.patch("/update-password", verify, userController.updatePassword);



module.exports = router;