const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// to use environment variables in this file
dotenv.config();

// Token creation
module.exports.createAccessToken = (user) => {
	// We are not going to contain all the information of our user in our Token that will be generated;
	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	}
	return jwt.sign(data, process.env.JWT_SECRET_KEY, {
		expiresIn: "1d"
	});

}


module.exports.verify = (req, res, next) => {
	// console.log(req.headers.authorization);
	

	let token = req.headers.authorization;

	if(token === undefined){
		return res.send({ auth: "Failed. No Token!"});
	}else {
		token = token.slice(7, token.length);

		console.log(token);

		// Token decryption
		jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decodedToken){
			if(err){
				return res.status(403).send({
					auth: "Failed",
					message: err.message
				})
			}else{
				console.log(decodedToken);

				req.user = decodedToken;
				// console.log(req);

				// next function is an expressjs function which allows us to move to the next function. It also passes details of the request and response to the next function.
				next();

			}
		})

	}
}

// Middle: will check/verify if the user is admin:
module.exports.verifyAdmin = (req, res, next) => {
	console.log("This is from verifyAdmin");
	console.log(req.user);
	if(req.user.isAdmin){
		next();
	}else{
		return res.status(403).send({
			auth: "Failed",
			message: "Action Fobidden"
		})
	}
}

// Error Handler:
module.exports.errorHandler = (err, req, res, next) => {
	console.error(err.code);

	const statusCode = err.status || 500;
	const errorMessage = err.message || 'Internal Server Error';

	res.status(statusCode).json({
		error: {
			message: errorMessage,
			errorCode: err.code || 'SERVER_ERROR',
			details: err.details || null
		}
	})

}

// Middleware to check if the user is authenticated:
module.exports.isLoggedIn = (req, res, next) => {
	if(req.user){
		next();
	}else{
		return res.sendStatus(401);
	}

}