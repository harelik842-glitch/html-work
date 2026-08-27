const Post = require('../models/Post');

const createPost = async (req, res) => {
    try {
        const userId = req.session.userId;
        console.log('BODY:', req.body);
console.log('FILE:', req.file);

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const text = req.body.text
            ? req.body.text.trim()
            : '';

        const group =
            req.body.group && req.body.group !== 'null'
                ? req.body.group
                : null;

        let image = '';
        let video = '';

        if (req.file) {
            const filePath =
                `/uploads/${req.file.filename}`;

            if (req.file.mimetype.startsWith('image/')) {
                image = filePath;
            }

            if (req.file.mimetype.startsWith('video/')) {
                video = filePath;
            }
        }

        if (text === '' && image === '' && video === '') {
            return res.status(400).json({
                message: 'Post must contain text, image or video'
            });
        }

        const newPost = new Post({
            author: userId,
            text: text,
            image: image,
            video: video,
            group: group
        });

        const savedPost = await newPost.save();

        const populatedPost = await Post.findById(savedPost._id)
            .populate(
                'author',
                'username firstName lastName profileImage'
            )
            .populate(
                'group',
                'name'
            );

        res.status(201).json({
            message: 'Post created successfully',
            post: populatedPost
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
    .populate('author', 'username firstName lastName profileImage')
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
            .populate('author', 'username firstName lastName profileImage')
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
   
const getMyPosts = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const posts = await Post.find({
            author: userId
        })
            .populate('author', 'username firstName lastName profileImage')
            .populate('group', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(posts);

    } catch (error) {
        res.status(500).json({
            message: 'Error getting user posts',
            error: error.message
        });
    }
};

const getPostsByUserId = async (req, res) => {
    try {
        const userId = req.params.id;

        const posts = await Post.find({
            author: userId
        })
            .populate('author', 'username firstName lastName profileImage')
            .populate('group', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(posts);

    } catch (error) {
        res.status(500).json({
            message: 'Error getting user posts',
            error: error.message
        });
    }
};


const getPostsByGroupId = async (req, res) => {
    try {
        const groupId = req.params.groupId;

        const posts = await Post.find({
            group: groupId
        })
            .populate(
                'author',
                'username firstName lastName profileImage'
            )
            .populate('group', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(posts);

    } catch (error) {
        res.status(500).json({
            message: 'Error getting group posts',
            error: error.message
        });
    }
};

const createGroupPost = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const { text, groupId } = req.body;
        const Group = require('../models/Group');

const group = await Group.findById(groupId);

if (!group) {
    return res.status(404).json({
        message: 'Group not found'
    });
}

const isMember = group.members.some(
    memberId => memberId.toString() === userId.toString()
);

if (!isMember) {
    return res.status(403).json({
        message: 'Only group members can create posts'
    });
}

        if (!groupId) {
            return res.status(400).json({
                message: 'Group ID is required'
            });
        }

        if ((!text || text.trim() === '') && !req.file) {
            return res.status(400).json({
                message: 'Post must contain text or an image'
            });
        }

        const imagePath = req.file
            ? `/uploads/${req.file.filename}`
            : '';

        const newPost = new Post({
            author: userId,
            text: text ? text.trim() : '',
            image: imagePath,
            group: groupId
        });

        await newPost.save();

        const populatedPost = await Post.findById(newPost._id)
            .populate(
                'author',
                'username firstName lastName profileImage'
            )
            .populate('group', 'name');

        res.status(201).json(populatedPost);

    } catch (error) {
        res.status(500).json({
            message: 'Error creating group post',
            error: error.message
        });
    }
};

const getRandomVideos = async (req, res) => {
    try {
        const posts = await Post.aggregate([
            {
                $match: {
                    video: {
                        $exists: true,
                        $ne: ''
                    }
                }
            },
            {
                $sample: {
                    size: 50
                }
            }
        ]);

        await Post.populate(posts, {
            path: 'author',
            select: 'username firstName lastName profileImage'
        });

        res.status(200).json(posts);

    } catch (error) {
        console.error('Error getting videos:', error);

        res.status(500).json({
            message: 'Error getting videos',
            error: error.message
        });
    }
};

module.exports = {
    createPost,
    getPosts,
    deletePost,
    getRandomVideos,
    createGroupPost,
    getPostsByGroupId,
    getPostsByUserId,
    getMyPosts,
    toggleLike,
    getFeedPosts
};