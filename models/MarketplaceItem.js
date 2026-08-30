const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        default: ''
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    location: {
        type: String,
        default: ''
    },

    image: {
        type: String,
        default: ''
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model(
    'MarketplaceItem',
    marketplaceItemSchema
);