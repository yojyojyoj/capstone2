const express = require("express");
const userController = require('../controllers/user.js');
const { verify, verifyAdmin, isLoggedIn } = require("../auth.js");

const router = express.Router();

router.post("/users/register", userController.registerUser);

router.post("/users/login", userController.loginUser);

router.patch("/users/:id/set-as-admin",verify, verifyAdmin, userController.updateUserAsAdmin);

router.get("/users/details", verify, userController.getProfile);

router.patch("/users/update-password", verify, userController.updatePassword);



module.exports = router;