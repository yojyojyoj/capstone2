const express = require("express");
const productController = require('../controllers/product.js');

const router = express.Router();

router.post('/createProduct', verify, verifyAdmin, productController.createProduct);

router.get("/all", verify, verifyAdmin, productController.getAllProducts);

router.get("/", productController.getAllActive);

router.get("/specific/:id", productController.getProduct);

router.patch("/:productId", verify, verifyAdmin, productController.updateProduct);

router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);

router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);


module.exports = router;