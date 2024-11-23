const express = require("express");
const orderController = require('../controllers/order.js');
const {verify, verifyAdmin} = require("../auth.js");

const router = express.Router();

router.post("/checkout", verify, orderController.checkOut);

router.get("/my-orders", verify, orderController.myOrder);

router.get("/all-orders", verify, verifyAdmin, orderController.getAllOrders);






module.exports = router;