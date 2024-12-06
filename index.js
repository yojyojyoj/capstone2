const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const cors = require('cors');

const userRoutes = require('./routes/user.js');
const productRoutes = require('./routes/product.js');
const orderRoutes = require('./routes/order.js');
const cartRoutes = require('./routes/cart.js');


// require("./models/Order.js");
// require("./models/Product.js");
// require("./models/User.js");


dotenv.config();

const app = express();

// Database:
mongoose.connect(process.env.MONGODB_STRING);

// Status of the connection:
let db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error!"));
db.once("open", ()=> console.log("Now connected to MongoDB Atlas."));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));


// costumize the CORS option to meet your specific requirements:

const corsOptions = {
	origin: ['http://localhost:3000', 'http://zuitt-bootcamp-prod-495-8281-guico.s3-website.us-east-1.amazonaws.com', 'http://zuitt-bootcamp-prod-495-8154-yecla.s3-website.us-east-1.amazonaws.com/' ],
	// methods: ['GET'] //allow only specified HTTP methods //optional only if you want to restrict methods
	// allowHeaders: ['Content-Type', "Authorization"], //allow specified
	credentials: true, //allow credentials example cookis, authorization headers
	optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

// Backend route for the users request:
app.use("/b4/users", userRoutes);
app.use("/b4/products", productRoutes);
app.use("/b4/cart", cartRoutes);
app.use("/b4/orders", orderRoutes);



// Checking and running server
if(require.main === module){
	app.listen(process.env.PORT || 3000, ()=> {
		console.log(`API is now online on port ${process.env.PORT || 3000}`);
	})
}
module.exports = {app, mongoose};



