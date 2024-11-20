const express = require("express");
const productController = require('../controllers/product.js');
const {verify, verifyAdmin} = require("../auth.js");

const router = express.Router();

router.post('/', verify, verifyAdmin, productController.createProduct);

router.get("/all", verify, verifyAdmin, productController.getAllProducts);

router.get("/active", productController.getAllActive);

router.get("/:productId", productController.getProduct);

router.patch("/:productId/update", verify, verifyAdmin, productController.updateProduct);

router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);

router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);


module.exports = router;