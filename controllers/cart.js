const Cart = require('../models/Cart.js');
const User = require('../models/User.js');

const bcrypt = require("bcrypt");
// to use the methods in auth.js
const auth = require('../auth.js');

const { errorHandler } = auth;

// Retrieve Cart
module.exports.getCart = (req, res) => {
    const userId = req.user.id;

    // Find the cart (order) by userId
    return Cart.findOne( {userId} ) // Updated to findOne and match userId
        .then(cart => {
            if (cart) {
                return res.status(200).send({ cart: cart });
            } else {
                return res.status(400).send({ message: 'Cart not found.' });
            }
        })
        .catch(error => errorHandler(error, req, res)); 
};


// Add to cart

module.exports.addToCart = async (req, res) => {
    try {
        const { productId, price, quantity } = req.body;
        userId = req.user.id;

        // Validate input
        if (!userId || !productId || !price || !quantity) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Calculate the subtotal
        const subtotal = price * quantity;

        // Find the user's cart
        let cart = await Cart.findOne({ userId });

        if (cart) {
            // Check if the product is already in the cart
            const existingItemIndex = cart.cartItems.findIndex(item => item.productId === productId);

            if (existingItemIndex !== -1) {
                // Update the existing item's quantity and subtotal
                cart.cartItems[existingItemIndex].quantity += quantity;
                cart.cartItems[existingItemIndex].subtotal += subtotal;
            } else {
                // Add the new product to the cart
                cart.cartItems.push({ productId, quantity, subtotal });
            }

            // Update the total price
            cart.totalPrice += subtotal;
        } else {
            // Create a new cart if none exists
            cart = new Cart({
                userId,
                cartItems: [{ productId, quantity, subtotal }],
                totalPrice: subtotal,
            });
        }

        // Save the cart
        await cart.save();

        res.status(200).json({ message: 'Item added to cart successfully', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error });
    }
};



// Update quantity of product:
module.exports.updateCartQuantity = (req, res) => {
    const { productId, newQuantity } = req.body;
    const userId = req.user.id;

    /*// Validate input
    if (!userId || !productId || newQuantity === undefined) {
        return res.status(400).send({ message: 'User ID, Product ID, and Quantity are required.' });
    }*/

    // Find and update the specific product's quantity in the order
    return Cart.findOneAndUpdate(
        { userId, "cartItems.productId": productId }, // Match order by userId and productId
        { $set: { "cartItems.$.quantity": newQuantity } }, // Update the quantity of the matched product
        { new: true } // Return the updated document
    )
        .then(updatedCart => {
            if (updatedCart) {
                res.status(200).send({
                    message: 'Item quantity updated successfully.',
                    updatedCart: updatedCart,
                });
            } else {
                res.status(404).send({ message: 'Item or product not found.' });
            }
        })
        .catch(error => errorHandler(error, req, res)); // Use custom error handling
};

// Remove Products from Cart
module.exports.removeFromCart = (req, res) => {
    return Cart.findOne({userId: req.user.id})
    .then(result => {
        if(!result) {
            return res.status(404).json({ message: "Cart not found."});
        } else {
            const index = result.cartItems.findIndex(item => item.productId === req.params.productId);

            if(index >= 0) {
                const removedItem = result.cartItems.filter(item => item.productId === req.params.productId);

                result.cartItems.splice(index, 1);

                result.totalPrice -= removedItem[0].subtotal;
            } else {
                return res.status(404).json({message: "Item not found in cart"});
            }
        }
    
        return result.save()
        .then(result => {
            return res.status(200).json({
                message: "Item removed from cart successfully",
                updatedCart: result
            })
        })
        .catch(err => errorHandler(err, req, res));
    })
    .catch(err => errorHandler(err, req, res));
};


module.exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id; // Get userId from req.user.id

        // Find the user's cart and clear it
        const updatedCart = await Cart.findOneAndUpdate(
            { userId }, // Find the cart by userId
            {
                $set: {
                    cartItems: [], // Clear cart items
                    totalPrice: 0 // Reset total price
                }
            },
            { new: true } // Return the updated cart
        );

        // If no cart is found for the user, return a 404 response
        if (!updatedCart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Return the updated cart
        res.status(200).json({ message: "Cart cleared successfully", cart: updatedCart });
    } catch (error) {
        // Handle any errors
        console.error(error);
        res.status(500).json({ message: "An error occurred while clearing the cart" });
    }
};

