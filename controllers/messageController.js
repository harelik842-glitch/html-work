const Message = require('../models/Message');

const sendMessage = async (req, res) => {
    try {
        const senderId = req.session.userId;
        const receiverId = req.body.receiverId;

        const text = req.body.text
            ? req.body.text.trim()
            : '';

        if (!senderId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        if (!receiverId) {
            return res.status(400).json({
                message: 'Receiver is required'
            });
        }

        if (senderId.toString() === receiverId.toString()) {
            return res.status(400).json({
                message: 'You cannot send a message to yourself'
            });
        }

        let image = '';
        let video = '';

        if (req.file) {
            const filePath = `/uploads/${req.file.filename}`;

            if (req.file.mimetype.startsWith('image/')) {
                image = filePath;
            }

            if (req.file.mimetype.startsWith('video/')) {
                video = filePath;
            }
        }

        if (text === '' && image === '' && video === '') {
            return res.status(400).json({
                message: 'Message must contain text, image or video'
            });
        }

        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            text: text,
            image: image,
            video: video
        });

        const savedMessage = await newMessage.save();

        const populatedMessage = await Message.findById(savedMessage._id)
            .populate(
                'sender',
                'firstName lastName username profileImage'
            )
            .populate(
                'receiver',
                'firstName lastName username profileImage'
            );

        res.status(201).json({
            message: 'Message sent successfully',
            data: populatedMessage
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error sending message',
            error: error.message
        });
    }
};


const getConversations = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const messages = await Message.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        })
            .populate('sender', 'firstName lastName username profileImage')
            .populate('receiver', 'firstName lastName username profileImage')
            .sort({ createdAt: -1 });

        const conversationsMap = new Map();

        messages.forEach(message => {
            const senderId = message.sender._id.toString();
            const receiverId = message.receiver._id.toString();
            const currentUserId = userId.toString();

            const otherUser =
                senderId === currentUserId
                    ? message.receiver
                    : message.sender;

            const otherUserId = otherUser._id.toString();

            if (!conversationsMap.has(otherUserId)) {
                conversationsMap.set(otherUserId, {
                    user: otherUser,
                    lastMessage: message,
                    unreadCount: 0
                });
            }

            if (
                receiverId === currentUserId &&
                message.isRead === false
            ) {
                conversationsMap.get(otherUserId).unreadCount++;
            }
        });

        const conversations = Array.from(conversationsMap.values());

        res.status(200).json(conversations);

    } catch (error) {
        res.status(500).json({
            message: 'Error loading conversations',
            error: error.message
        });
    }
};


const getConversationMessages = async (req, res) => {
    try {
        const userId = req.session.userId;
        const otherUserId = req.params.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const messages = await Message.find({
            $or: [
                {
                    sender: userId,
                    receiver: otherUserId
                },
                {
                    sender: otherUserId,
                    receiver: userId
                }
            ]
        })
            .populate('sender', 'firstName lastName username profileImage')
            .populate('receiver', 'firstName lastName username profileImage')
            .sort({ createdAt: 1 });

        res.status(200).json(messages);

    } catch (error) {
        res.status(500).json({
            message: 'Error loading messages',
            error: error.message
        });
    }
};


const markConversationAsRead = async (req, res) => {
    try {
        const userId = req.session.userId;
        const otherUserId = req.params.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        await Message.updateMany(
            {
                sender: otherUserId,
                receiver: userId,
                isRead: false
            },
            {
                $set: {
                    isRead: true
                }
            }
        );

        res.status(200).json({
            message: 'Messages marked as read'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error marking messages as read',
            error: error.message
        });
    }
};


const getUnreadMessagesCount = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const unreadCount = await Message.countDocuments({
            receiver: userId,
            isRead: false
        });

        res.status(200).json({
            unreadCount: unreadCount
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error loading unread messages count',
            error: error.message
        });
    }
};

module.exports = {
    sendMessage,
    getConversations,
    getConversationMessages,
    markConversationAsRead,
    getUnreadMessagesCount
};
