const Order = require('../models/Order.js');
const User = require('../models/User.js');

const bcrypt = require("bcrypt");
// to use the methods in auth.js
const auth = require('../auth.js');

const { errorHandler } = auth;


// Retrieve Cart
module.exports.getCart = (req, res) => {
    const { userId } = req.body;

    /*// Validate input
    if (!userId) {
        return res.status(400).send({ message: 'User ID is required to retrieve the cart.' });
    }*/

    // Find the cart (order) by userId
    return Order.findOne({ userId }) // Updated to findOne and match userId
        .then(cart => {
            if (cart) {
                return res.status(200).send({ cart });
            } else {
                return res.status(404).send({ message: 'Cart not found.' });
            }
        })
        .catch(error => errorHandler(error, req, res)); // Retain custom error handling
};


// Add to cart
module.exports.addToCart = (req, res) => {
    const { userId, productsOrdered, totalPrice } = req.body;

    // // Validate input
    // if (!userId || !productsOrdered || totalPrice === undefined) {
    //     return res.status(400).send({ message: 'User ID, products, and total price are required.' }); // 400 for bad request
    // }

    // Create a new order instance from request body
    let newOrder = new Order({
        userId,
        productsOrdered,
        totalPrice,
    });

    // Check if an order already exists for the user
    return Order.findOne({ userId })
        .then(existingOrder => {
            if (existingOrder) {
                // Conflict if an order already exists
                return res.status(409).send({ message: 'An order already exists for this user.' });
            } else {
                // Save the new order
                return newOrder
                    .save()
                    .then(cart =>
                        res.status(201).send({
                            message: 'Items added to cart successfully.',
                            cart,
                        })
                    )
                    .catch(error => {
                        console.error('Database save error:', error.message);
                        errorHandler(error, req, res); // Retain custom error handling
                    });
            }
        })
        .catch(error => {
            console.error('Database query error:', error.message);
            errorHandler(error, req, res); // Retain custom error handling
        });
};


// Update quantity of product:
module.exports.updateCartQuantity = (req, res) => {
    const { userId, productId, quantity } = req.body;

    // Validate input
    if (!userId || !productId || quantity === undefined) {
        return res.status(400).send({ message: 'User ID, Product ID, and Quantity are required.' });
    }

    // Find and update the specific product's quantity in the order
    return Order.findOneAndUpdate(
        { userId, "productsOrdered.productId": productId }, // Match order by userId and productId
        { $set: { "productsOrdered.$.quantity": quantity } }, // Update the quantity of the matched product
        { new: true } // Return the updated document
    )
        .then(updatedOrder => {
            if (updatedOrder) {
                res.status(200).send({
                    message: 'Product quantity updated successfully.',
                    updatedCart: updatedOrder,
                });
            } else {
                res.status(404).send({ message: 'Order or product not found.' });
            }
        })
        .catch(error => errorHandler(error, req, res)); // Use custom error handling
};
