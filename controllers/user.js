const User = require('../models/User.js');


const bcrypt = require("bcrypt");
// to use the methods in auth.js
const auth = require('../auth.js');

const { errorHandler } = auth;

// User registration
module.exports.registerUser = (req, res) => {

    // Checks if the email is in the right format
    if (!req.body.email.includes("@")){
        return res.status(400).send({error : 'Email invalid'});
    }
    // Checks if the mobile number has the correct number of characters
    else if (req.body.mobileNo.length !== 11){
        return res.status(400).send({error : 'Mobile number invalid'});
    }
    // Checks if the password has atleast 8 characters
    else if (req.body.password.length < 8) {
        return res.status(400).send({error: 'Password must be atleast 8 characters'});
    // If all needed requirements are achieved
    } else {
        let newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            mobileNo : req.body.mobileNo,
            password : bcrypt.hashSync(req.body.password, 10)
        })

        return newUser.save()
        .then((result) => res.status(201).send({message: 'Registered Successfully', user: result}))
        .catch(error => errorHandler(error, req, res));
    }
};

// User authentication
module.exports.loginUser = (req, res) => {
	if(req.body.email.includes('@')){
		return User.findOne({email: req.body.email})
		.then(result => {
			// if email was not found in the db
			if(result === null){
				return res.status(404).send({error: 'No email found'});
			}
			// The email was found in the databse:
			else{
				// The compareSync method is used to compare a non-encrypted password from the encrypted password which is from the databse.
				//either true or false
				const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

				// we need to check the isPasswordCorrect
				// if the pass is correct this will run
				if(isPasswordCorrect){
					// we are going to generate an access token
					return res.status(200).send({ access : auth.createAccessToken(result)})
				}else{
					return res.status(401).send({ error: 'Email and password do not match' });
				}

			}
		})
		.catch(err => errorHandler(err, req, res));
	}else{
		return res.status(400).send({ error: 'Invalid Email' });
	}
};


// Set User as Admin (Admin only)
module.exports.updateUserAsAdmin = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Update the user's admin status
        user.isAdmin = true;
        await user.save();

        res.status(200).json({ updatedUser: user });
    } catch (error) {
        const errorMessage = error.message || '';
        
        // Define regex patterns for various properties
        const regexPatterns = {
            stringValue: /value "(.*?)"/, // Extracts the value causing the error
            valueType: /\(type (.*?)\)/, // Extracts the value type, e.g., string
            kind: /Cast to (.*?) failed/, // Extracts the kind of cast (ObjectId)
            value: /value "(.*?)"/, // Extracts the value again, similar to stringValue
            path: /at path "(.*?)"/, // Extracts the field path (_id)
            reason: /failed for value/, // Check if the failure is due to the value
            name: /Cast to (.*?) failed/, // Extracts the error name (ObjectId)
            message: /Cast to ObjectId failed.*$/, // Full message pattern
        };

        // Extract properties using the regex patterns
        const details = {};

        for (const [key, regex] of Object.entries(regexPatterns)) {
            const match = errorMessage.match(regex);
            if (match) {
                details[key] = match[1];
            }
        }

        // If no matches are found, fallback to the message itself
        if (!details.message) {
            details.message = errorMessage;
        }

        // Send the error details back in the response
        res.status(500).json({
            error: 'Failed in Find',
            details,
        });
    }
};




// Retrieve User Details
module.exports.getProfile = (req, res) => {
    return User.findById(req.user.id)
    .then(user => {

        if(!user){
            // if the user has invalid token, send a message 'invalid signature'.
            return res.status(404).send({ error: 'User not found' })
        }else {
            // if the user is found, return the user.
            user.password = "";
            return res.status(200).send({user: user});
        }  
    })
    .catch(error => errorHandler(error, req, res));
};


// Update Password
module.exports.updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { id } = req.user; // Extracting user ID from the authorization header

    // Hashing the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Updating the user's password in the database
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    // Sending a success response
    res.status(201).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

