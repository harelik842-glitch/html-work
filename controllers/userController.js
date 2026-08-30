const mongoose = require('mongoose');
const User = require('../models/User');
const Notification = require('../models/Notification');

const createUser = async (req, res) => {
    try {
        let profileImage = '';
        let coverImage = '';

        // תמונת פרופיל
        if (
            req.files &&
            req.files.profileImage &&
            req.files.profileImage[0]
        ) {
            profileImage =
                `/uploads/${req.files.profileImage[0].filename}`;
        }

        // תמונת נושא
        if (
            req.files &&
            req.files.coverImage &&
            req.files.coverImage[0]
        ) {
            coverImage =
                `/uploads/${req.files.coverImage[0].filename}`;
        }

        const newUser = new User({
            username: req.body.username,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            city: req.body.city,
            birthday: req.body.birthday,

            profileImage: profileImage,
            coverImage: coverImage
        });

        const savedUser = await newUser.save();

        res.status(201).json({
            message: 'User created successfully',
            user: savedUser
        });

    } catch (error) {
        console.error(
            'Error creating user:',
            error
        );

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
    console.log('GET CURRENT USER CALLED');
    console.log('MongoDB state:', mongoose.connection.readyState);
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }
        const startTime = Date.now();

const user = await User.findById(userId)
    .select('username firstName lastName email city birthday friends  profileImage coverImage savedPosts friendRequestsSent friendRequestsReceived') 
    .lean();

console.log(
    'CURRENT USER QUERY TIME:',
    Date.now() - startTime,
    'ms'
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

const acceptFriendRequest = async (req, res) => {
    try {
        const userId = req.session.userId;
        const senderId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const user = await User.findById(userId);
        const sender = await User.findById(senderId);
console.log('USER ID:', userId);
console.log('SENDER ID:', senderId);
console.log('RECEIVED REQUESTS:', user?.friendRequestsReceived);
console.log('SENDER SENT REQUESTS:', sender?.friendRequestsSent);
        if (!user || !sender) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const requestExists =
            user.friendRequestsReceived?.some(
                id =>
                    id.toString() ===
                    senderId.toString()
            );

        if (!requestExists) {
            return res.status(400).json({
                message: 'Friend request not found'
            });
        }

        const userAlreadyFriend =
            user.friends.some(
                id =>
                    id.toString() ===
                    senderId.toString()
            );

        const senderAlreadyFriend =
            sender.friends.some(
                id =>
                    id.toString() ===
                    userId.toString()
            );

        if (!userAlreadyFriend) {
            user.friends.push(senderId);
        }

        if (!senderAlreadyFriend) {
            sender.friends.push(userId);
        }

        user.friendRequestsReceived =
            user.friendRequestsReceived.filter(
                id =>
                    id.toString() !==
                    senderId.toString()
            );

        sender.friendRequestsSent =
            sender.friendRequestsSent.filter(
                id =>
                    id.toString() !==
                    userId.toString()
            );

        await user.save();
        await sender.save();

        await Notification.deleteMany({
            recipient: userId,
            sender: senderId,
            type: 'friend'
        });

        res.status(200).json({
            message: 'Friend request accepted successfully'
        });

    } catch (error) {

        console.error(
            'ACCEPT FRIEND REQUEST ERROR:',
            error
        );

        res.status(500).json({
            message: 'Error accepting friend request',
            error: error.message
        });
    }
};


const rejectFriendRequest = async (req, res) => {
    try {
        const userId = req.session.userId;
        const senderId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const user = await User.findById(userId);
        const sender = await User.findById(senderId);

        if (!user || !sender) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        user.friendRequestsReceived =
            user.friendRequestsReceived.filter(
                id => id.toString() !== senderId.toString()
            );

        sender.friendRequestsSent =
            sender.friendRequestsSent.filter(
                id => id.toString() !== userId.toString()
            );

        await user.save();
        await sender.save();

        res.status(200).json({
            message: 'Friend request rejected'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error rejecting friend request',
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

        const alreadySent =
            user.friendRequestsSent?.some(
                id => id.toString() === friendId.toString()
            );

        if (alreadySent) {
            return res.status(400).json({
                message: 'Friend request already sent'
            });
        }

        const alreadyReceived =
            user.friendRequestsReceived?.some(
                id => id.toString() === friendId.toString()
            );

        if (alreadyReceived) {
            return res.status(400).json({
                message: 'This user already sent you a friend request'
            });
        }

        user.friendRequestsSent.push(friendId);
        friend.friendRequestsReceived.push(userId);

        await user.save();
        await friend.save();

        await Notification.create({
            recipient: friendId,
            sender: userId,
            type: 'friend'
        });

        res.status(200).json({
            message: 'Friend request sent successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error sending friend request',
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
        }).select('username firstName lastName city profileImage friends birthday');

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
                'username firstName lastName city profileImage birthday'
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

const savePost = async (req, res) => {
    try {
        const userId = req.session.userId;
        const postId = req.params.postId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const alreadySaved = user.savedPosts.some(
            id => id.toString() === postId.toString()
        );

        if (alreadySaved) {
            return res.status(400).json({
                message: 'Post already saved'
            });
        }

        user.savedPosts.push(postId);

        await user.save();

        res.status(200).json({
            message: 'Post saved successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error saving post',
            error: error.message
        });
    }
};


const unsavePost = async (req, res) => {
    try {
        const userId = req.session.userId;
        const postId = req.params.postId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        user.savedPosts = user.savedPosts.filter(
            id => id.toString() !== postId.toString()
        );

        await user.save();

        res.status(200).json({
            message: 'Post removed from saved posts'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error removing saved post',
            error: error.message
        });
    }
};


const getSavedPosts = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const user = await User.findById(userId)
            .populate({
                path: 'savedPosts',
                populate: [
                    {
                        path: 'author',
                        select: 'username firstName lastName profileImage'
                    },
                    {
                        path: 'group',
                        select: 'name'
                    }
                ]
            });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const savedPosts = user.savedPosts
            .filter(post => post !== null)
            .reverse();

        res.status(200).json(savedPosts);

    } catch (error) {
        res.status(500).json({
            message: 'Error getting saved posts',
            error: error.message
        });
    }
};
 

const cancelFriendRequest = async (req, res) => {
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

        const requestExists =
            user.friendRequestsSent?.some(
                id => id.toString() === friendId.toString()
            );

        if (!requestExists) {
            return res.status(400).json({
                message: 'Friend request not found'
            });
        }

        user.friendRequestsSent =
            user.friendRequestsSent.filter(
                id => id.toString() !== friendId.toString()
            );

        friend.friendRequestsReceived =
            friend.friendRequestsReceived.filter(
                id => id.toString() !== userId.toString()
            );

        await user.save();
        await friend.save();

        await Notification.deleteMany({
            recipient: friendId,
            sender: userId,
            type: 'friend'
        });

        res.status(200).json({
            message: 'Friend request cancelled'
        });

    } catch (error) {
        console.error(
            'CANCEL FRIEND REQUEST ERROR:',
            error
        );

        res.status(500).json({
            message: 'Error cancelling friend request',
            error: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        await User.findByIdAndDelete(userId);

        req.session.destroy(error => {

            if (error) {
                console.error(
                    'SESSION DESTROY ERROR:',
                    error
                );
            }

            res.clearCookie('connect.sid');

            res.status(200).json({
                message: 'User deleted successfully'
            });
        });

    } catch (error) {

        console.error(
            'DELETE USER ERROR:',
            error
        );

        res.status(500).json({
            message: 'Error deleting user',
            error: error.message
        });
    }
};

const getUsersCountByCity = async (req, res) => {
    try {

        const result = await User.aggregate([

            // רק משתמשים שיש להם עיר
            {
                $match: {
                    city: {
                        $exists: true,
                        $ne: ''
                    }
                }
            },

            // GroupBy לפי עיר
            {
                $group: {
                    _id: '$city',
                    usersCount: {
                        $sum: 1
                    }
                }
            },

            // מסדר מהעיר עם הכי הרבה משתמשים
            {
                $sort: {
                    usersCount: -1
                }
            },

            // מבנה התוצאה
            {
                $project: {
                    _id: 0,
                    city: '$_id',
                    usersCount: 1
                }
            }

        ]);

        res.status(200).json(result);

    } catch (error) {

        console.error(
            'USERS COUNT BY CITY ERROR:',
            error
        );

        res.status(500).json({
            message: 'Error getting users count by city',
            error: error.message
        });
    }
};

module.exports = {
    createUser,
    loginUser,
    getCurrentUser,
    getUsers,
    removeFriend,
    updateProfile,
    getMyFriends,
    getUserById,
    getFriendsByUserId,
    uploadProfileImage,
    uploadCoverImage,
    searchUsers,
    logout,
    savePost,
    unsavePost,
    getSavedPosts,
    acceptFriendRequest,
    rejectFriendRequest,
    addFriend,
    cancelFriendRequest,
    deleteUser,
    getUsersCountByCity
};