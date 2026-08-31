const Comment =
    require('../models/Comment');

const Post =
    require('../models/Post');

const Notification =
    require('../models/Notification');


const createComment = async (req, res) => {
    try {

        const postId =
            req.params.postId;

        const userId =
            req.session.userId;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
            });
        }


        const text =
            req.body.text
                ? req.body.text.trim()
                : '';


        if (text === '') {

            return res.status(400).json({
                message:
                    'Comment cannot be empty'
            });
        }


        const post =
            await Post.findById(
                postId
            );


        if (!post) {

            return res.status(404).json({
                message:
                    'Post not found'
            });
        }


        const newComment =
            new Comment({
                post:
                    postId,

                author:
                    userId,

                text:
                    text
            });


        const savedComment =
            await newComment.save();


        if (
            post.author &&
            post.author.toString() !==
            userId.toString()
        ) {

            await Notification.create({
                recipient:
                    post.author,

                sender:
                    userId,

                type:
                    'comment',

                post:
                    post._id
            });
        }


        const populatedComment =
            await Comment.findById(
                savedComment._id
            )
                .populate(
                    'author',
                    'username firstName lastName profileImage'
                );


        res.status(201).json({
            message:
                'Comment created successfully',
            comment:
                populatedComment
        });


    } catch (error) {

        console.error(
            'CREATE COMMENT ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error creating comment',
            error:
                error.message
        });
    }
};


const getCommentsByPost =
    async (req, res) => {

        try {

            const postId =
                req.params.postId;


            const comments =
                await Comment.find({
                    post:
                        postId
                })
                    .populate(
                        'author',
                        'username firstName lastName profileImage'
                    )
                    .sort({
                        createdAt: 1
                    });


            res.status(200).json(
                comments
            );


        } catch (error) {

            console.error(
                'GET COMMENTS ERROR:',
                error
            );


            res.status(500).json({
                message:
                    'Error getting comments',
                error:
                    error.message
            });
        }
    };


const deleteComment = async (req, res) => {
    try {

        const commentId =
            req.params.id;

        const userId =
            req.session.userId;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
            });
        }


        const comment =
            await Comment.findById(
                commentId
            );


        if (!comment) {

            return res.status(404).json({
                message:
                    'Comment not found'
            });
        }


        if (
            comment.author.toString() !==
            userId.toString()
        ) {

            return res.status(403).json({
                message:
                    'You are not allowed to delete this comment'
            });
        }


        await Comment.findByIdAndDelete(
            commentId
        );


        await Notification.deleteMany({
            sender:
                userId,

            type:
                'comment',

            post:
                comment.post
        });


        res.status(200).json({
            message:
                'Comment deleted successfully'
        });


    } catch (error) {

        console.error(
            'DELETE COMMENT ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error deleting comment',
            error:
                error.message
        });
    }
};


module.exports = {
    createComment,
    getCommentsByPost,
    deleteComment
};