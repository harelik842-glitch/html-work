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


const getCurrentUser = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const user = await User.findById(userId).select(
            'username firstName lastName email city friends'
        );

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({
            message: 'Error getting current user',
            error: error.message
        });
    }
};

const addFriend = async (req, res) => {
    try {
        const userId = req.session.userId;
        const friendId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        if (userId.toString() === friendId.toString()) {
            return res.status(400).json({
                message: 'You cannot add yourself as a friend'
            });
        }

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const alreadyFriends = user.friends.some(
            id => id.toString() === friendId.toString()
        );

        if (alreadyFriends) {
            return res.status(400).json({
                message: 'Users are already friends'
            });
        }

        user.friends.push(friendId);
        friend.friends.push(userId);

        await user.save();
        await friend.save();

        res.status(200).json({
            message: 'Friend added successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error adding friend',
            error: error.message
        });
    }
};


const getUsers = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const users = await User.find({
            _id: { $ne: userId }
        }).select('username firstName lastName city profileImage friends');

        res.status(200).json(users);

    } catch (error) {
        res.status(500).json({
            message: 'Error getting users',
            error: error.message
        });
    }
};


const removeFriend = async (req, res) => {
    try {
        const userId = req.session.userId;
        const friendId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        user.friends = user.friends.filter(
            id => id.toString() !== friendId.toString()
        );

        friend.friends = friend.friends.filter(
            id => id.toString() !== userId.toString()
        );

        await user.save();
        await friend.save();

        res.status(200).json({
            message: 'Friend removed successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error removing friend',
            error: error.message
        });
    }
};


module.exports = {
    createUser,
    loginUser,
    getCurrentUser,
    addFriend,
    getUsers,
    removeFriend    
};


