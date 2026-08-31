const Group =
    require('../models/Group');


const createGroup = async (req, res) => {
    try {

        const userId =
            req.session.userId;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
            });
        }


        const newGroup =
            new Group({
                name:
                    req.body.name,

                description:
                    req.body.description,

                creator:
                    userId,

                members: [
                    userId
                ],

                image:
                    req.body.image,

                address:
                    req.body.address
            });


        const savedGroup =
            await newGroup.save();


        res.status(201).json({
            message:
                'Group created successfully',
            group:
                savedGroup
        });


    } catch (error) {

        console.error(
            'CREATE GROUP ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error creating group',
            error:
                error.message
        });
    }
};


const getGroups = async (req, res) => {
    try {

        const groups =
            await Group.find()
                .populate(
                    'creator',
                    'username firstName lastName'
                )
                .populate(
                    'members',
                    'username firstName lastName'
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).json(
            groups
        );


    } catch (error) {

        console.error(
            'GET GROUPS ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error getting groups',
            error:
                error.message
        });
    }
};


const joinGroup = async (req, res) => {
    try {

        const groupId =
            req.params.id;

        const userId =
            req.session.userId;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
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


        const alreadyMember =
            group.members.some(
                memberId =>
                    memberId.toString() ===
                    userId.toString()
            );


        if (alreadyMember) {

            return res.status(400).json({
                message:
                    'User is already a member of this group'
            });
        }


        group.members.push(
            userId
        );


        await group.save();


        res.status(200).json({
            message:
                'Joined group successfully',
            membersCount:
                group.members.length
        });


    } catch (error) {

        console.error(
            'JOIN GROUP ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error joining group',
            error:
                error.message
        });
    }
};


const getMyGroups = async (req, res) => {
    try {

        const userId =
            req.session.userId;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
            });
        }


        const groups =
            await Group.find({
                members:
                    userId
            })
                .populate(
                    'creator',
                    'username firstName lastName'
                )
                .populate(
                    'members',
                    'username firstName lastName'
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).json(
            groups
        );


    } catch (error) {

        console.error(
            'GET MY GROUPS ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error getting user groups',
            error:
                error.message
        });
    }
};


const updateGroup = async (req, res) => {
    try {

        const groupId =
            req.params.id;

        const userId =
            req.session.userId;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
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


        if (
            group.creator.toString() !==
            userId.toString()
        ) {

            return res.status(403).json({
                message:
                    'Only the group creator can edit this group'
            });
        }


        group.name =
            req.body.name ??
            group.name;

        group.description =
            req.body.description ??
            group.description;

        group.address =
            req.body.address ??
            group.address;


        if (req.file) {

            group.image =
                `/uploads/${req.file.filename}`;
        }


        const updatedGroup =
            await group.save();


        res.status(200).json({
            message:
                'Group updated successfully',
            group:
                updatedGroup
        });


    } catch (error) {

        console.error(
            'UPDATE GROUP ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error updating group',
            error:
                error.message
        });
    }
};


const removeMember = async (req, res) => {
    try {

        const groupId =
            req.params.groupId;

        const memberId =
            req.params.memberId;

        const userId =
            req.session.userId;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
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


        if (
            group.creator.toString() !==
            userId.toString()
        ) {

            return res.status(403).json({
                message:
                    'Only the group creator can remove members'
            });
        }


        if (
            memberId ===
            group.creator.toString()
        ) {

            return res.status(400).json({
                message:
                    'The group creator cannot be removed'
            });
        }


        group.members =
            group.members.filter(
                member =>
                    member.toString() !==
                    memberId
            );


        await group.save();


        res.status(200).json({
            message:
                'Member removed successfully',
            membersCount:
                group.members.length
        });


    } catch (error) {

        console.error(
            'REMOVE GROUP MEMBER ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error removing member',
            error:
                error.message
        });
    }
};


const getGroupsByUserId =
    async (req, res) => {

        try {

            const userId =
                req.params.id;


            const groups =
                await Group.find({
                    members:
                        userId
                })
                    .populate(
                        'creator',
                        'username firstName lastName'
                    )
                    .populate(
                        'members',
                        'username firstName lastName'
                    )
                    .sort({
                        createdAt: -1
                    });


            res.status(200).json(
                groups
            );


        } catch (error) {

            console.error(
                'GET GROUPS BY USER ERROR:',
                error
            );


            res.status(500).json({
                message:
                    'Error getting user groups',
                error:
                    error.message
            });
        }
    };


const getGroupById = async (req, res) => {
    try {

        const groupId =
            req.params.id;


        const group =
            await Group.findById(
                groupId
            )
                .populate(
                    'creator',
                    'username firstName lastName profileImage'
                )
                .populate(
                    'members',
                    'username firstName lastName profileImage'
                );


        if (!group) {

            return res.status(404).json({
                message:
                    'Group not found'
            });
        }


        res.status(200).json(
            group
        );


    } catch (error) {

        console.error(
            'GET GROUP BY ID ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error getting group',
            error:
                error.message
        });
    }
};

const leaveGroup = async (req, res) => {
    try {

        const groupId =
            req.params.id;

        const userId =
            req.session.userId;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
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


        if (
            group.creator.toString() ===
            userId.toString()
        ) {

            return res.status(400).json({
                message:
                    'Group creator cannot leave the group'
            });
        }


        const isMember =
            group.members.some(
                memberId =>
                    memberId.toString() ===
                    userId.toString()
            );


        if (!isMember) {

            return res.status(400).json({
                message:
                    'User is not a member of this group'
            });
        }


        group.members =
            group.members.filter(
                memberId =>
                    memberId.toString() !==
                    userId.toString()
            );


        await group.save();


        res.status(200).json({
            message:
                'Left group successfully',
            membersCount:
                group.members.length
        });


    } catch (error) {

        console.error(
            'LEAVE GROUP ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error leaving group',
            error:
                error.message
        });
    }
};


const createGroupWithImage =
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
                name,
                description,
                address
            } = req.body;


            if (
                !name ||
                name.trim() === ''
            ) {

                return res.status(400).json({
                    message:
                        'Group name is required'
                });
            }


            const imagePath =
                req.file
                    ? `/uploads/${req.file.filename}`
                    : '';


            const newGroup =
                new Group({
                    name:
                        name.trim(),

                    description:
                        description
                            ? description.trim()
                            : '',

                    address:
                        address
                            ? address.trim()
                            : '',

                    image:
                        imagePath,

                    creator:
                        userId,

                    members: [
                        userId
                    ]
                });


            await newGroup.save();


            const populatedGroup =
                await Group.findById(
                    newGroup._id
                )
                    .populate(
                        'creator',
                        'username firstName lastName profileImage'
                    )
                    .populate(
                        'members',
                        'username firstName lastName profileImage'
                    );


            res.status(201).json({
                message:
                    'Group created successfully',
                group:
                    populatedGroup
            });


        } catch (error) {

            console.error(
                'CREATE GROUP WITH IMAGE ERROR:',
                error
            );


            res.status(500).json({
                message:
                    'Error creating group',
                error:
                    error.message
            });
        }
    };


const searchGroups = async (req, res) => {
    try {

        const {
            q,
            name,
            description,
            address
        } = req.query;


        let filter = {};


        // בחיפוש רגיל בודקים שם, תיאור וכתובת
        if (q) {

            filter = {
                $or: [
                    {
                        name: {
                            $regex:
                                q,
                            $options:
                                'i'
                        }
                    },
                    {
                        description: {
                            $regex:
                                q,
                            $options:
                                'i'
                        }
                    },
                    {
                        address: {
                            $regex:
                                q,
                            $options:
                                'i'
                        }
                    }
                ]
            };


        } else {

            if (name) {

                filter.name = {
                    $regex:
                        name,
                    $options:
                        'i'
                };
            }


            if (description) {

                filter.description = {
                    $regex:
                        description,
                    $options:
                        'i'
                };
            }


            if (address) {

                filter.address = {
                    $regex:
                        address,
                    $options:
                        'i'
                };
            }
        }


        const groups =
            await Group.find(
                filter
            )
                .select(
                    'name description address image members'
                )
                .limit(20);


        res.status(200).json(
            groups
        );


    } catch (error) {

        console.error(
            'SEARCH GROUPS ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error searching groups',
            error:
                error.message
        });
    }
};


const deleteGroup = async (req, res) => {
    try {

        const groupId =
            req.params.id;

        const userId =
            req.session.userId;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
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


        if (
            group.creator.toString() !==
            userId.toString()
        ) {

            return res.status(403).json({
                message:
                    'Only the group creator can delete this group'
            });
        }


        await Group.findByIdAndDelete(
            groupId
        );


        res.status(200).json({
            message:
                'Group deleted successfully'
        });


    } catch (error) {

        console.error(
            'DELETE GROUP ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error deleting group',
            error:
                error.message
        });
    }
};


module.exports = {
    createGroup,
    getGroups,
    joinGroup,
    deleteGroup,
    getGroupById,
    getGroupsByUserId,
    removeMember,
    getMyGroups,
    updateGroup,
    searchGroups,
    leaveGroup,
    createGroupWithImage
};