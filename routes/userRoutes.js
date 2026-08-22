const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const userController = require('../controllers/userController');
const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1E9);

        cb(
            null,
            uniqueName + path.extname(file.originalname)
        );
    }
});

const upload = multer({
    storage: storage
});





router.post('/users', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/current-user', userController.getCurrentUser);
router.put('/users/:id/friend', userController.addFriend);
router.get('/users', userController.getUsers);
router.delete('/users/:id/friend', userController.removeFriend);
router.put('/profile', userController.updateProfile);
router.get('/my-friends', userController.getMyFriends);
router.get('/users/:id', userController.getUserById);
router.get('/users/:id/friends', userController.getFriendsByUserId);
router.post('/profile-image', upload.single('profileImage'),userController.uploadProfileImage);
router.post('/cover-image',upload.single('coverImage'),userController.uploadCoverImage);
module.exports = router;