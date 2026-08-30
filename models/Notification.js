const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    type: {
        type: String,
        enum: [
            'like',
            'comment',
            'friend',
            'group_post',
            'share'
        ],
        required: true
    },

    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        default: null
    },

    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        default: null
    },

    isRead: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model(
    'Notification',
    notificationSchema
);