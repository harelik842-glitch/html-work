const mongoose = require('mongoose');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const Group = require('../models/Group');
const User = require('../models/User');
const Comment = require('../models/Comment');


const createPost = async (req, res) => {
    try {

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


        const group =
            req.body.group &&
            req.body.group !== 'null'
                ? req.body.group
                : null;


        let image = '';
        let video = '';


        if (req.file) {

            const filePath =
                `/uploads/${req.file.filename}`;


            if (
                req.file.mimetype.startsWith(
                    'image/'
                )
            ) {
                image = filePath;
            }


            if (
                req.file.mimetype.startsWith(
                    'video/'
                )
            ) {
                video = filePath;
            }
        }


        if (
            text === '' &&
            image === '' &&
            video === ''
        ) {

            return res.status(400).json({
                message:
                    'Post must contain text, image or video'
            });
        }


        const newPost =
            new Post({
                author: userId,
                text: text,
                image: image,
                video: video,
                group: group
            });


        const savedPost =
            await newPost.save();


        // אם הפוסט בקבוצה שולחים התראה לשאר חברי הקבוצה
        if (group) {

            const groupData =
                await Group.findById(group)
                    .select('members');


            if (groupData) {

                const otherMembers =
                    groupData.members.filter(
                        memberId =>
                            memberId.toString() !==
                            userId.toString()
                    );


                if (
                    otherMembers.length > 0
                ) {

                    const notifications =
                        otherMembers.map(
                            memberId => ({
                                recipient:
                                    memberId,
                                sender:
                                    userId,
                                type:
                                    'group_post',
                                post:
                                    savedPost._id,
                                group:
                                    group
                            })
                        );


                    await Notification.insertMany(
                        notifications
                    );
                }
            }
        }


        const populatedPost =
            await Post.findById(
                savedPost._id
            )
                .populate(
                    'author',
                    'username firstName lastName profileImage'
                )
                .populate(
                    'group',
                    'name'
                );


        res.status(201).json({
            message:
                'Post created successfully',
            post: populatedPost
        });


    } catch (error) {

        console.error(
            'CREATE POST ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error creating post',
            error: error.message
        });
    }
};


const getPosts = async (req, res) => {
    try {

        const posts =
            await Post.find()
                .populate(
                    'author',
                    'username firstName lastName profileImage'
                )
                .populate(
                    'group',
                    'name'
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).json(
            posts
        );


    } catch (error) {

        console.error(
            'GET POSTS ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error getting posts',
            error: error.message
        });
    }
};


const deletePost = async (req, res) => {
    try {

        const userId =
            req.session.userId;

        const postId =
            req.params.id;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
            });
        }


        const post =
            await Post.findById(postId);


        if (!post) {

            return res.status(404).json({
                message:
                    'Post not found'
            });
        }


        if (
            post.author.toString() !==
            userId.toString()
        ) {

            return res.status(403).json({
                message:
                    'You are not allowed to delete this post'
            });
        }


        await Post.findByIdAndDelete(
            postId
        );


        // מוחק גם התראות ששייכות לפוסט שנמחק
        await Notification.deleteMany({
            post: postId
        });


        res.status(200).json({
            message:
                'Post deleted successfully'
        });


    } catch (error) {

        console.error(
            'DELETE POST ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error deleting post',
            error: error.message
        });
    }
};


const toggleLike = async (req, res) => {
    try {

        const postId =
            req.params.id;

        const userId =
            req.session.userId;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
            });
        }


        const post =
            await Post.findById(postId);


        if (!post) {

            return res.status(404).json({
                message:
                    'Post not found'
            });
        }


        const alreadyLiked =
            post.likes.some(
                likeUserId =>
                    likeUserId.toString() ===
                    userId.toString()
            );


        if (alreadyLiked) {

            post.likes =
                post.likes.filter(
                    likeUserId =>
                        likeUserId.toString() !==
                        userId.toString()
                );


            // אם הלייק הוסר אין צורך להשאיר את ההתראה
            await Notification.deleteMany({
                recipient: post.author,
                sender: userId,
                type: 'like',
                post: post._id
            });


        } else {

            post.likes.push(
                userId
            );


            if (
                post.author &&
                post.author.toString() !==
                userId.toString()
            ) {

                const existingNotification =
                    await Notification.findOne({
                        recipient:
                            post.author,
                        sender:
                            userId,
                        type:
                            'like',
                        post:
                            post._id
                    });


                if (!existingNotification) {

                    await Notification.create({
                        recipient:
                            post.author,
                        sender:
                            userId,
                        type:
                            'like',
                        post:
                            post._id
                    });
                }
            }
        }


        await post.save();


        res.status(200).json({
            message:
                alreadyLiked
                    ? 'Like removed'
                    : 'Post liked',

            likesCount:
                post.likes.length
        });


    } catch (error) {

        console.error(
            'UPDATE LIKE ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error updating like',
            error: error.message
        });
    }
};


const getFeedPosts = async (req, res) => {
    try {

        const userId =
            req.session.userId;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
            });
        }


        const [
            currentUser,
            myGroups
        ] = await Promise.all([

            User.findById(userId)
                .select('friends')
                .lean(),

            Group.find({
                members: userId
            })
                .select('_id')
                .lean()
        ]);


        if (!currentUser) {

            return res.status(404).json({
                message:
                    'User not found'
            });
        }


        const friendIds =
            currentUser.friends || [];


        const myGroupIds =
            myGroups.map(
                group =>
                    group._id
            );


        // מציג פוסטים שלי ושל חברים וגם פוסטים מהקבוצות שלי
        const posts =
            await Post.find({
                $or: [
                    {
                        group: null,

                        author: {
                            $in: [
                                userId,
                                ...friendIds
                            ]
                        }
                    },
                    {
                        group: {
                            $in:
                                myGroupIds
                        }
                    }
                ]
            })
                .populate(
                    'author',
                    'username firstName lastName profileImage'
                )
                .populate(
                    'group',
                    'name'
                )
                .populate({
                    path:
                        'sharedPost',

                    select:
                        'author text image video createdAt likes group',

                    populate: [
                        {
                            path:
                                'author',

                            select:
                                'username firstName lastName profileImage'
                        },
                        {
                            path:
                                'group',

                            select:
                                'name'
                        }
                    ]
                })
                .sort({
                    createdAt: -1
                })
                .lean();


        const postIds =
            posts.map(
                post =>
                    post._id
            );


        const sharedPostIds =
            posts
                .filter(
                    post =>
                        post.sharedPost?._id
                )
                .map(
                    post =>
                        post.sharedPost._id
                );


        const allPostIds = [
            ...postIds,
            ...sharedPostIds
        ];


        // סופר תגובות לכל הפוסטים בשאילתה אחת
        const commentCounts =
            await Comment.aggregate([
                {
                    $match: {
                        post: {
                            $in:
                                allPostIds
                        }
                    }
                },
                {
                    $group: {
                        _id:
                            '$post',

                        count: {
                            $sum: 1
                        }
                    }
                }
            ]);


        const commentCountMap = {};


        commentCounts.forEach(
            item => {

                commentCountMap[
                    item._id.toString()
                ] = item.count;
            }
        );


        const postsWithCommentCount =
            posts.map(
                post => {

                    const result = {
                        ...post,

                        commentsCount:
                            commentCountMap[
                                post._id.toString()
                            ] || 0
                    };


                    if (post.sharedPost) {

                        result.sharedPost = {
                            ...post.sharedPost,

                            commentsCount:
                                commentCountMap[
                                    post.sharedPost._id.toString()
                                ] || 0
                        };
                    }


                    return result;
                }
            );


        res.status(200).json(
            postsWithCommentCount
        );


    } catch (error) {

        console.error(
            'GET FEED ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error getting feed posts',
            error: error.message
        });
    }
};


const getMyPosts = async (req, res) => {
    try {

        const userId =
            req.session.userId;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
            });
        }


        const posts =
            await Post.find({
                author: userId
            })
                .populate(
                    'author',
                    'username firstName lastName profileImage'
                )
                .populate(
                    'group',
                    'name'
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).json(
            posts
        );


    } catch (error) {

        console.error(
            'GET MY POSTS ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error getting user posts',
            error: error.message
        });
    }
};


const getPostsByUserId =
    async (req, res) => {

        try {

            const userId =
                req.params.id;


            const posts =
                await Post.find({
                    author: userId
                })
                    .populate(
                        'author',
                        'username firstName lastName profileImage'
                    )
                    .populate(
                        'group',
                        'name'
                    )
                    .sort({
                        createdAt: -1
                    });


            res.status(200).json(
                posts
            );


        } catch (error) {

            console.error(
                'GET USER POSTS ERROR:',
                error
            );


            res.status(500).json({
                message:
                    'Error getting user posts',
                error: error.message
            });
        }
    };


const getPostsByGroupId =
    async (req, res) => {

        try {

            const groupId =
                req.params.groupId;


            const posts =
                await Post.find({
                    group: groupId
                })
                    .populate(
                        'author',
                        'username firstName lastName profileImage'
                    )
                    .populate(
                        'group',
                        'name'
                    )
                    .sort({
                        createdAt: -1
                    });


            res.status(200).json(
                posts
            );


        } catch (error) {

            console.error(
                'GET GROUP POSTS ERROR:',
                error
            );


            res.status(500).json({
                message:
                    'Error getting group posts',
                error: error.message
            });
        }
    };


const createGroupPost =
    async (req, res) => {

        try {

            const userId =
                req.session.userId;


            if (!userId) {

                return res.status(401).json({
                    message:
                        'User is not logged in'
                });
            }


            const {
                text,
                groupId
            } = req.body;


            if (!groupId) {

                return res.status(400).json({
                    message:
                        'Group ID is required'
                });
            }


            const group =
                await Group.findById(
                    groupId
                );


            if (!group) {

                return res.status(404).json({
                    message:
                        'Group not found'
                });
            }


            const isMember =
                group.members.some(
                    memberId =>
                        memberId.toString() ===
                        userId.toString()
                );


            if (!isMember) {

                return res.status(403).json({
                    message:
                        'Only group members can create posts'
                });
            }


            if (
                (!text ||
                    text.trim() === '') &&
                !req.file
            ) {

                return res.status(400).json({
                    message:
                        'Post must contain text or an image'
                });
            }


            let image = '';
            let video = '';


            if (req.file) {

                const filePath =
                    `/uploads/${req.file.filename}`;


                if (
                    req.file.mimetype.startsWith(
                        'image/'
                    )
                ) {
                    image = filePath;
                }


                if (
                    req.file.mimetype.startsWith(
                        'video/'
                    )
                ) {
                    video = filePath;
                }
            }


            const newPost =
                new Post({
                    author:
                        userId,

                    text:
                        text
                            ? text.trim()
                            : '',

                    image:
                        image,

                    video:
                        video,

                    group:
                        groupId
                });


            await newPost.save();


            const otherMembers =
                group.members.filter(
                    memberId =>
                        memberId.toString() !==
                        userId.toString()
                );


            if (
                otherMembers.length > 0
            ) {

                const notifications =
                    otherMembers.map(
                        memberId => ({
                            recipient:
                                memberId,

                            sender:
                                userId,

                            type:
                                'group_post',

                            post:
                                newPost._id,

                            group:
                                group._id
                        })
                    );


                await Notification.insertMany(
                    notifications
                );
            }


            const populatedPost =
                await Post.findById(
                    newPost._id
                )
                    .populate(
                        'author',
                        'username firstName lastName profileImage'
                    )
                    .populate(
                        'group',
                        'name'
                    );


            res.status(201).json(
                populatedPost
            );


        } catch (error) {

            console.error(
                'CREATE GROUP POST ERROR:',
                error
            );


            res.status(500).json({
                message:
                    'Error creating group post',
                error: error.message
            });
        }
    };

    const getRandomVideos = async (req, res) => {
    try {

        const posts =
            await Post.aggregate([
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


        await Post.populate(
            posts,
            {
                path: 'author',
                select:
                    'username firstName lastName profileImage'
            }
        );


        res.status(200).json(
            posts
        );


    } catch (error) {

        console.error(
            'GET VIDEOS ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error getting videos',
            error: error.message
        });
    }
};


const getMemories = async (req, res) => {
    try {

        const userId =
            req.session.userId;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
            });
        }


        const now =
            new Date();


        const currentMonth =
            now.getMonth() + 1;

        const currentDay =
            now.getDate();

        const currentYear =
            now.getFullYear();


        // מחפש פוסטים שפורסמו באותו יום בשנים קודמות
        const posts =
            await Post.aggregate([
                {
                    $match: {
                        author:
                            new mongoose.Types.ObjectId(
                                userId
                            )
                    }
                },
                {
                    $addFields: {
                        postMonth: {
                            $month:
                                '$createdAt'
                        },

                        postDay: {
                            $dayOfMonth:
                                '$createdAt'
                        },

                        postYear: {
                            $year:
                                '$createdAt'
                        }
                    }
                },
                {
                    $match: {
                        postMonth:
                            currentMonth,

                        postDay:
                            currentDay,

                        postYear: {
                            $lt:
                                currentYear
                        }
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                }
            ]);


        await Post.populate(
            posts,
            [
                {
                    path: 'author',
                    select:
                        'username firstName lastName profileImage'
                },
                {
                    path: 'group',
                    select: 'name'
                }
            ]
        );


        res.status(200).json(
            posts
        );


    } catch (error) {

        console.error(
            'GET MEMORIES ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error getting memories',
            error: error.message
        });
    }
};


const sharePost = async (req, res) => {
    try {

        const userId =
            req.session.userId;

        const postId =
            req.params.id;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
            });
        }


        const originalPost =
            await Post.findById(
                postId
            );


        if (!originalPost) {

            return res.status(404).json({
                message:
                    'Post not found'
            });
        }


        const sharedPost =
            await Post.create({
                author:
                    userId,

                text:
                    'שיתף פוסט',

                sharedPost:
                    originalPost._id
            });


        // לא שולחים התראה אם המשתמש שיתף פוסט של עצמו
        if (
            originalPost.author.toString() !==
            userId.toString()
        ) {

            await Notification.create({
                recipient:
                    originalPost.author,

                sender:
                    userId,

                type:
                    'share',

                post:
                    originalPost._id
            });
        }


        const populatedSharedPost =
            await Post.findById(
                sharedPost._id
            )
                .populate(
                    'author',
                    'username firstName lastName profileImage'
                )
                .populate({
                    path:
                        'sharedPost',

                    populate: [
                        {
                            path:
                                'author',

                            select:
                                'username firstName lastName profileImage'
                        },
                        {
                            path:
                                'group',

                            select:
                                'name'
                        }
                    ]
                });


        res.status(201).json(
            populatedSharedPost
        );


    } catch (error) {

        console.error(
            'SHARE POST ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error sharing post',
            error: error.message
        });
    }
};


const updatePost = async (req, res) => {
    try {

        const userId =
            req.session.userId;

        const postId =
            req.params.id;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
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


        if (
            post.author.toString() !==
            userId.toString()
        ) {

            return res.status(403).json({
                message:
                    'You are not allowed to edit this post'
            });
        }


        const text =
            req.body.text !== undefined
                ? req.body.text.trim()
                : post.text;


        if (
            text === '' &&
            !post.image &&
            !post.video &&
            !post.sharedPost
        ) {

            return res.status(400).json({
                message:
                    'Post cannot be empty'
            });
        }


        post.text =
            text;


        await post.save();


        const updatedPost =
            await Post.findById(
                post._id
            )
                .populate(
                    'author',
                    'username firstName lastName profileImage'
                )
                .populate(
                    'group',
                    'name'
                );


        res.status(200).json({
            message:
                'Post updated successfully',
            post: updatedPost
        });


    } catch (error) {

        console.error(
            'UPDATE POST ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error updating post',
            error: error.message
        });
    }
};


const searchPosts = async (req, res) => {
    try {

        const userId =
            req.session.userId;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
            });
        }


        const {
            text,
            author,
            date
        } = req.query;


        const query = {};


        if (
            text &&
            text.trim() !== ''
        ) {

            query.text = {
                $regex:
                    text.trim(),
                $options:
                    'i'
            };
        }


        // בחיפוש לפי משתמש בודקים שם פרטי, משפחה ושם משתמש
        if (
            author &&
            author.trim() !== ''
        ) {

            const matchingUsers =
                await User.find({
                    $or: [
                        {
                            firstName: {
                                $regex:
                                    author.trim(),
                                $options:
                                    'i'
                            }
                        },
                        {
                            lastName: {
                                $regex:
                                    author.trim(),
                                $options:
                                    'i'
                            }
                        },
                        {
                            username: {
                                $regex:
                                    author.trim(),
                                $options:
                                    'i'
                            }
                        }
                    ]
                })
                    .select('_id');


            query.author = {
                $in:
                    matchingUsers.map(
                        user =>
                            user._id
                    )
            };
        }


        if (date) {

            const startDate =
                new Date(
                    `${date}T00:00:00`
                );


            const endDate =
                new Date(
                    `${date}T23:59:59.999`
                );


            if (
                !isNaN(
                    startDate.getTime()
                ) &&
                !isNaN(
                    endDate.getTime()
                )
            ) {

                query.createdAt = {
                    $gte:
                        startDate,

                    $lte:
                        endDate
                };
            }
        }


        const posts =
            await Post.find(query)
                .populate(
                    'author',
                    'username firstName lastName profileImage'
                )
                .populate(
                    'group',
                    'name'
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).json(
            posts
        );


    } catch (error) {

        console.error(
            'SEARCH POSTS ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error searching posts',
            error: error.message
        });
    }
};


const getPostsCountByGroup =
    async (req, res) => {

        try {

            // סופר כמה פוסטים פורסמו בכל קבוצה
            const result =
                await Post.aggregate([
                    {
                        $match: {
                            group: {
                                $ne: null
                            }
                        }
                    },
                    {
                        $group: {
                            _id:
                                '$group',

                            postsCount: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $lookup: {
                            from:
                                'groups',

                            localField:
                                '_id',

                            foreignField:
                                '_id',

                            as:
                                'group'
                        }
                    },
                    {
                        $unwind:
                            '$group'
                    },
                    {
                        $project: {
                            _id: 0,

                            groupId:
                                '$_id',

                            groupName:
                                '$group.name',

                            postsCount:
                                1
                        }
                    },
                    {
                        $sort: {
                            postsCount: -1
                        }
                    }
                ]);


            res.status(200).json(
                result
            );


        } catch (error) {

            console.error(
                'POSTS COUNT BY GROUP ERROR:',
                error
            );


            res.status(500).json({
                message:
                    'Error getting posts count by group',
                error: error.message
            });
        }
    };


module.exports = {
    createPost,
    getPosts,
    deletePost,
    searchPosts,
    getRandomVideos,
    updatePost,
    createGroupPost,
    getPostsByGroupId,
    getPostsByUserId,
    getMyPosts,
    toggleLike,
    getFeedPosts,
    getMemories,
    sharePost,
    getPostsCountByGroup
};