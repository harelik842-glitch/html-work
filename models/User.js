const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    firstName: {
        type: String,
        required: true,
        trim: true
    },

    lastName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    city: {
        type: String,
        default: ''
    },

    birthday: {
        type: Date,
        default: null
    },

    profileImage: {
        type: String,
        default: ''
    },

    coverImage: {
    type: String,
    default: ''
},

    createdAt: {
        type: Date,
        default: Date.now
    },

   
    friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
}],

});

const User = mongoose.model('User', userSchema);

module.exports = User;