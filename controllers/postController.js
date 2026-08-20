const Post = require('../models/Post');

const createPost = async (req, res) => {
    try {
        const newPost = new Post({
            author: req.session.userId,
            text: req.body.text,
            image: req.body.image,
            group: req.body.group || null
        });

        const savedPost = await newPost.save();

        res.status(201).json({
            message: 'Post created successfully',
            post: savedPost
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error creating post',
            error: error.message
        });
    }
};

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
    .populate('author', 'username firstName lastName')
    .populate('group', 'name')
    .sort({ createdAt: -1 });

        res.status(200).json(posts);

    } catch (error) {
        res.status(500).json({
            message: 'Error getting posts',
            error: error.message
        });
    }
};

const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: 'Post not found'
            });
        }

        if (post.author.toString() !== req.session.userId.toString()) {
            return res.status(403).json({
                message: 'You are not allowed to delete this post'
            });
        }

        await Post.findByIdAndDelete(postId);

        res.status(200).json({
            message: 'Post deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error deleting post',
            error: error.message
        });
    }
};

const toggleLike = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: 'Post not found'
            });
        }

        const alreadyLiked = post.likes.some(
            likeUserId => likeUserId.toString() === userId.toString()
        );

        if (alreadyLiked) {
            post.likes = post.likes.filter(
                likeUserId => likeUserId.toString() !== userId.toString()
            );
        } else {
            post.likes.push(userId);
        }

        await post.save();

        res.status(200).json({
            message: alreadyLiked ? 'Like removed' : 'Post liked',
            likesCount: post.likes.length
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error updating like',
            error: error.message
        });
    }
};


const getFeedPosts = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const Group = require('../models/Group');
        const User = require('../models/User');

        const currentUser = await User.findById(userId).select('friends');

        const friendIds = currentUser.friends || [];

        const myGroups = await Group.find({
            members: userId
        }).select('_id');

        const myGroupIds = myGroups.map(group => group._id);

        const posts = await Post.find({
            $or: [
                {
                    group: null,
                    author: {
                        $in: [userId, ...friendIds]
                    }
                },
                {
                    group: {
                        $in: myGroupIds
                    }
                }
            ]
        })
            .populate('author', 'username firstName lastName')
            .populate('group', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(posts);

    } catch (error) {
        res.status(500).json({
            message: 'Error getting feed posts',
            error: error.message
        });
    }
};    
   


module.exports = {
    createPost,
    getPosts,
    deletePost,
    toggleLike,
    getFeedPosts
};