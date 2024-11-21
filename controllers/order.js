const Order = require('../models/Order.js');
const User = require('../models/User.js');

const bcrypt = require("bcrypt");
// to use the methods in auth.js
const auth = require('../auth.js');

const { errorHandler } = auth;


// Retrieve Cart
module.exports.getCart = (req, res) => {
    const userId = req.user.id;

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
                return res.status(400).send({ message: 'Cart not found.' });
            }
        })
        .catch(error => errorHandler(error, req, res)); // Retain custom error handling
};


// Add to cart
module.exports.addToCart = (req, res) => {
    const { productsOrdered, totalPrice } = req.body;
    const userId = req.user.id;  // This comes from the verified JWT token

    // Ensure all required fields are present
    if (!Array.isArray(productsOrdered) || productsOrdered.length === 0 || totalPrice === undefined) {
        return res.status(400).send({ message: 'Invalid input: Products and total price are required.' });
    }

    // Create a new order instance
    const newOrder = new Order({
        userId,  // The userId comes from the JWT token
        productsOrdered,  // Array of products being ordered
        totalPrice,  // The total price for the order
    });

    // Check if an order already exists for the user
    Order.findOne({ userId })
        .then(existingOrder => {
            if (existingOrder) {
                // Conflict if an order already exists
                return res.status(409).send({ message: 'An order already exists for this user.' });
            } else {
                // Save the new order
                return newOrder
                    .save()
                    .then(cart => {
                        return res.status(201).send({
                            message: 'Items added to cart successfully.',
                            cart,
                        });
                    })
                    .catch(error => {
                        console.error('Database save error:', error.message);
                        return errorHandler(error, req, res); // Custom error handling
                    });
            }
        })
        .catch(error => {
            console.error('Database query error:', error.message);
            return errorHandler(error, req, res); // Custom error handling
        });
};




// Update quantity of product:
module.exports.updateCartQuantity = (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

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
