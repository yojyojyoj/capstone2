const express = require("express");
const orderController = require('../controllers/order.js');
const {verify, verifyAdmin} = require("../auth.js");

const router = express.Router();

router.get("/get-cart", verify, orderController.getCart);

router.post("/add-to-cart", verify, orderController.addToCart);

// router.patch("/update-cart-quantity", verify, orderController.updateCartQuantity);






module.exports = router;