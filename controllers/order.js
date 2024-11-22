const Order = require('../models/Order.js');
const User = require('../models/User.js');
const Cart = require('../models/Cart.js');

const bcrypt = require("bcrypt");
// to use the methods in auth.js
const auth = require('../auth.js');

const { errorHandler } = auth;


// Checkout Function: 
module.exports.checkOut = async (req, res) => {
    try {
        
        const userId = req.user.id; 
        

        // Step 3: Find the user's cart
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for the user.' });
        }

        // Step 5: Check if cart contains items
        if (!cart.cartItems || cart.cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty. Cannot proceed to checkout.' });
        }

        // Step 5a: Create a new Order
        const newOrder = new Order({
            userId,
            productsOrdered: cart.cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                subtotal: item.subtotal
            })),
            totalPrice: cart.totalPrice
        });

        // Step 6a: Save the order
        const savedOrder = await newOrder.save();

        // Step 6b: Respond to client
        res.status(201).json({ orders: savedOrder});
    } catch (err) {
        // Step 7: Catch and handle errors
        res.status(500).json({ message: 'An error occurred during checkout.', error: err.message });
    }
};

