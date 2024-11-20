const Product = require('../models/Product.js');

const bcrypt = require("bcrypt");
// to use the methods in auth.js
const auth = require('../auth.js');

const {errorHandler} = require("../auth.js");

module.exports.createProduct = (req, res) => {
    // Validate request body
    if (!req.body.name || !req.body.description || !req.body.price) {
        return res.status(400).send({ 
            success: false, 
            message: "All fields (name, description, price) are required." 
        });
    }

    let newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    });

    // Check if product already exists
    return Product.findOne({ name: req.body.name })
        .then(existingProduct => {
            if (existingProduct) { // Fixed typo
                return res.status(409).send({ 
                    success: false, 
                    message: "Product already exists." 
                });
            } else {
                // Save the new product
                return newProduct.save()
                    .then(result => res.status(201).send({
                        success: true,
                        message: "Product added successfully.",
                        result
                    }))
                    .catch(error => errorHandler(error, req, res)); // Ensure errorHandler handles unexpected errors
            }
        })
        .catch(error => errorHandler(error, req, res)); // Handle database query errors
};

module.exports.getAllProducts = (req, res) => {
    return Product.find({})
    .then(result => {
        if(result.length > 0){
            return res.status(200).send(result);
        }
        else{
            return res.status(404).send({ message : "No products found"});
        }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.getAllActive = (req, res) => {

    return Product.find({ isActive: true })
    .then(result => {

        if(result.length > 0){
            return res.status(200).send(result);
        }else{
            return res.status(404).send({message: 'No active products found'});
        }
    })
    .catch(err => errorHandler(err, req, res));

};

module.exports.getProduct = (req, res) => {
    return Product.findById(req.params.id)
    .then(product => {
        if(product) {
            return res.status(200).send(product);
        } else {
            return res.status(404).send({message: 'Product not found'});
        }
    })
    .catch(error => errorHandler(error, req, res)); 
};

module.exports.updateProduct = (req, res)=>{

    let updatedProduct = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    }

    return Product.findByIdAndUpdate(req.params.productId, updatedProduct)
    .then(product => {
        if (product) {
            res.status(200).send({message : 'Product updated successfully'});
        } else {
            res.status(404).send({message : 'Product not found'});
        }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.archiveProduct = (req, res) => {
  
    let updateActiveField = {
        isActive: false
    };

    return Product.findByIdAndUpdate(req.params.productId, updateActiveField)
        .then(product => {
            if (product) {
                if (!product.isActive) {
                    return res.status(200).send('Product already archived');
                }
                return res.status(200).send({ success: true, message: 'Product archived successfully'});
            } else {
                return res.status(404).send({message: 'Product not found'});
            }
        })
        .catch(error => errorHandler(error, req, res));
};

module.exports.activateProduct = (req, res) => {
  
    let updateActiveField = {
        isActive: true
    }

    Product.findByIdAndUpdate(req.params.productId, updateActiveField)
        .then(product => {
            if (product) {
                if (product.isActive) {
                    return res.status(200).send({message: 'Product already activated', product});
                }
                return res.status(200).send({success: true, message: 'Product activated successfully'});
            } else {
                return res.status(404).send({message: 'Product not found'});
            }
        })
        .catch(error => errorHandler(error, req, res));
};