const express = require("express");
const orderController = require('../controllers/order.js');
const {verify, verifyAdmin} = require("../auth.js");

const router = express.Router();

router.post("/checkout", verify, orderController.checkOut);

router.get("/my-orders", verify, orderController.checkOut);

router.get("/all-orders", verify, verifyAdmin, orderController.checkOut);






module.exports = router;