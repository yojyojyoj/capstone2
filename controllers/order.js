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
        

        // Find the user's cart
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for the user.' });
        }

        // Check if cart contains items
        if (!cart.cartItems || cart.cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty. Cannot proceed to checkout.' });
        }

        // Create a new Order
        const newOrder = new Order({
            userId,
            productsOrdered: cart.cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                subtotal: item.subtotal
            })),
            totalPrice: cart.totalPrice
        });

        // Save the order
        const savedOrder = await newOrder.save();

        // Respond to client
        res.status(201).json({ message: "Ordered Successfully" });
    } catch (err) {
        // Catch and handle errors
        res.status(500).json({ error: "No items to Checkout" });
    }
};



// Retrieve All Orders
module.exports.getAllOrders = async (req, res) => {
    const userId = req.user.id;
    try {
        const orders = await Order.find(); 
        res.status(200).json({ orders: orders }); 
        
    } catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).json({ message: "Failed to fetch orders", error });
    }
};


// Retrieve authenticated user's orders
module.exports.myOrder = (req, res) => {
    const userId = req.user.id; 

    Order.find({ userId }) 
        .then(orders => {
            if (orders.length > 0) {
                return res.status(200).json({ orders });
            } else {
                return res.status(404).json({ message: 'No orders found for this user.' });
            }
        })
        .catch(error => errorHandler(error, req, res)); 
};



