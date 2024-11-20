const express = require("express");
const productController = require('../controllers/product.js');

const router = express.Router();

router.post('/products/', verify, verifyAdmin, productController.createProduct);

router.get("/products/all", verify, verifyAdmin, productController.getAllProducts);

router.get("/products/active", productController.getAllActive);

router.get("/products/:productId", productController.getProduct);

router.patch("/products/:productId/update", verify, verifyAdmin, productController.updateProduct);

router.patch("/products/:productId/archive", verify, verifyAdmin, productController.archiveProduct);

router.patch("/products/:productId/activate", verify, verifyAdmin, productController.activateProduct);


module.exports = router;