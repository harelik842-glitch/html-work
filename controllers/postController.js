const Post = require('../models/Post');

const createPost = async (req, res) => {
    try {
        const newPost = new Post({
            author: req.session.userId,
            text: req.body.text,
            image: req.body.image
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
            .sort({ createdAt: -1 });

        res.status(200).json(posts);

    } catch (error) {
        res.status(500).json({
            message: 'Error getting posts',
            error: error.message
        });
    }
};

module.exports = {
    createPost,
    getPosts
};