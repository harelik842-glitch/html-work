const Group = require('../models/Group');

const createGroup = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const newGroup = new Group({
            name: req.body.name,
            description: req.body.description,
            creator: userId,
            members: [userId],
            image: req.body.image,
            address: req.body.address
        });

        const savedGroup = await newGroup.save();

        res.status(201).json({
            message: 'Group created successfully',
            group: savedGroup
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error creating group',
            error: error.message
        });
    }
};


const getGroups = async (req, res) => {
    try {
        const groups = await Group.find()
            .populate('creator', 'username firstName lastName')
            .populate('members', 'username firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json(groups);

    } catch (error) {
        res.status(500).json({
            message: 'Error getting groups',
            error: error.message
        });
    }
};

const joinGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                message: 'Group not found'
            });
        }

        const alreadyMember = group.members.some(
            memberId => memberId.toString() === userId.toString()
        );

        if (alreadyMember) {
            return res.status(400).json({
                message: 'User is already a member of this group'
            });
        }

        group.members.push(userId);

        await group.save();

        res.status(200).json({
            message: 'Joined group successfully',
            membersCount: group.members.length
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error joining group',
            error: error.message
        });
    }
};

module.exports = {
    createGroup,
    getGroups,
    joinGroup
};