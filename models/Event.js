const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        default: ''
    },

    location: {
        type: String,
        default: ''
    },

    date: {
        type: Date,
        required: true
    },

    image: {
        type: String,
        default: ''
    },

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;