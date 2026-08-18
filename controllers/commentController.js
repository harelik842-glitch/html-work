const Comment = require('../models/Comment');
const Post = require('../models/Post');

const createComment = async (req, res) => {
    try {
        const postId = req.params.postId;
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

        const newComment = new Comment({
            post: postId,
            author: userId,
            text: req.body.text
        });

        const savedComment = await newComment.save();

        res.status(201).json({
            message: 'Comment created successfully',
            comment: savedComment
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error creating comment',
            error: error.message
        });
    }
};

const getCommentsByPost = async (req, res) => {
    try {
        const postId = req.params.postId;

        const comments = await Comment.find({ post: postId })
            .populate('author', 'username firstName lastName')
            .sort({ createdAt: 1 });

        res.status(200).json(comments);

    } catch (error) {
        res.status(500).json({
            message: 'Error getting comments',
            error: error.message
        });
    }
};

module.exports = {
    createComment,
    getCommentsByPost
};