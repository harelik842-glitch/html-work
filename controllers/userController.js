const User = require('../models/User');

const createUser = async (req, res) => {
    try {
        const newUser = new User({
            username: req.body.username,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            city: req.body.city,
            birthday: req.body.birthday
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
            'username firstName lastName email city birthday friends profileImage coverImage'
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

const updateProfile = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const { firstName, lastName, city , birthday, profileImage,
                coverImage} = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            {
                
              firstName,
              lastName,
              city,
              ...(birthday !== undefined && { birthday }),
              ...(profileImage !== undefined && { profileImage }),
             ...(coverImage !== undefined && { coverImage })

             },
           
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error updating profile',
            error: error.message
        });
    }
};

const getMyFriends = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const user = await User.findById(userId)
            .populate(
                'friends',
                'username firstName lastName city profileImage'
            );

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json(user.friends);

    } catch (error) {
        res.status(500).json({
            message: 'Error getting friends',
            error: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId).select(
            'username firstName lastName city birthday friends profileImage coverImage'
        );

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({
            message: 'Error getting user',
            error: error.message
        });
    }
};


const getFriendsByUserId = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId)
            .populate(
                'friends',
                'username firstName lastName city profileImage'
            );

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json(user.friends);

    } catch (error) {
        res.status(500).json({
            message: 'Error getting user friends',
            error: error.message
        });
    }
};


const uploadProfileImage = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: 'No image uploaded'
            });
        }

        const imagePath = `/uploads/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            userId,
            {
                profileImage: imagePath
            },
            {
                new: true
            }
        ).select('-password');

        res.status(200).json({
            message: 'Profile image updated successfully',
            profileImage: user.profileImage
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error uploading profile image',
            error: error.message
        });
    }
};
const logout = (req, res) => {
    req.session.destroy(error => {
        if (error) {
            return res.status(500).json({
                message: 'Error logging out'
            });
        }

        res.clearCookie('connect.sid');

        res.status(200).json({
            message: 'Logged out successfully'
        });
    });
};

const uploadCoverImage = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: 'No image uploaded'
            });
        }

        const imagePath = `/uploads/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            userId,
            {
                coverImage: imagePath
            },
            {
                new: true
            }
        ).select('-password');

        res.status(200).json({
            message: 'Cover image updated successfully',
            coverImage: user.coverImage
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error uploading cover image',
            error: error.message
        });
    }
};


const searchUsers = async (req, res) => {
    try {
        const { q, name, username, city } = req.query;

        let filter = {};

        if (q) {
            filter = {
                $or: [
                    {
                        firstName: {
                            $regex: q,
                            $options: 'i'
                        }
                    },
                    {
                        lastName: {
                            $regex: q,
                            $options: 'i'
                        }
                    },
                    {
                        username: {
                            $regex: q,
                            $options: 'i'
                        }
                    },
                    {
                        city: {
                            $regex: q,
                            $options: 'i'
                        }
                    }
                ]
            };
        } else {
            if (name) {
                filter.$or = [
                    {
                        firstName: {
                            $regex: name,
                            $options: 'i'
                        }
                    },
                    {
                        lastName: {
                            $regex: name,
                            $options: 'i'
                        }
                    }
                ];
            }

            if (username) {
                filter.username = {
                    $regex: username,
                    $options: 'i'
                };
            }

            if (city) {
                filter.city = {
                    $regex: city,
                    $options: 'i'
                };
            }
        }

        const users = await User.find(filter)
            .select(
                'username firstName lastName city profileImage'
            )
            .limit(20);

        res.status(200).json(users);

    } catch (error) {
        res.status(500).json({
            message: 'Error searching users',
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
    removeFriend,
    updateProfile,
    getMyFriends,
    getUserById,
    getFriendsByUserId,
    uploadProfileImage,
    uploadCoverImage,
    searchUsers,
    logout  
};


