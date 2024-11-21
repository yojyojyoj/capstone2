const Order = require('../models/Order.js');
const User = require('../models/User.js');

const bcrypt = require("bcrypt");
// to use the methods in auth.js
const auth = require('../auth.js');

const { errorHandler } = auth;


// Retrieve Cart
module.exports.getCart = (req, res) => {
    const { userId } = req.body;

    // Validate input
    if (!userId) {
        return res.status(400).send({ message: 'User ID is required to retrieve the cart.' });
    }

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
    // Create a new order instance from request body
    let newOrder = new Order({
        userId: req.body.userId,
        productsOrdered: req.body.productsOrdered,
        totalPrice: req.body.totalPrice,
    });

    // Check if an order already exists for the user
    return Order.findOne({ userId: req.body.userId }) // Using Order instead of Cart
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
                            message: 'Items added to cart successfully',
                            cart: cart,
                        })
                    )
                    .catch(error => errorHandler(error, req, res)); // Retain custom error handling
            }
        })
        .catch(error => errorHandler(error, req, res)); // Retain custom error handling
};
