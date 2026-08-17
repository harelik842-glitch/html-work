const User = require('../models/User');

const createUser = async (req, res) => {
    try {
        const newUser = new User({
            username: req.body.username,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            city: req.body.city
        });

        const savedUser = await newUser.save();

        res.status(201).json({
            message: 'User created successfully',
            user: savedUser
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error creating user',
            error: error.message
        });
    }
};


const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(401).json({
                message: 'שם משתמש או סיסמה שגויים'
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                message: 'שם משתמש או סיסמה שגויים'
            });
        }
        req.session.userId = user._id;
        req.session.username = user.username;
        res.status(200).json({
            message: 'Login successful',
            user: user
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error logging in',
            error: error.message
        });
    }
};


module.exports = {
    createUser,
    loginUser
};