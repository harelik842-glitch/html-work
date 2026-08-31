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





router.post( '/users',upload.fields([{name: 'profileImage',maxCount: 1},{name: 'coverImage',maxCount: 1}]),userController.createUser);router.post('/login', userController.loginUser);
router.get('/current-user', userController.getCurrentUser);
router.put('/users/:id/friend', userController.addFriend);
router.get('/users', userController.getUsers);
router.delete('/users/:id/friend', userController.removeFriend);
router.put('/profile', userController.updateProfile);
router.get('/my-friends', userController.getMyFriends);
router.get('/users/map',userController.getUsersForMap);
router.get('/users/:id', userController.getUserById);
router.get('/users/:id/friends', userController.getFriendsByUserId);
router.post('/profile-image', upload.single('profileImage'),userController.uploadProfileImage);
router.post('/cover-image',upload.single('coverImage'),userController.uploadCoverImage);
router.get('/search/users', userController.searchUsers);
router.post('/logout', userController.logout);
router.put('/saved-posts/:postId', userController.savePost);

router.delete('/saved-posts/:postId', userController.unsavePost);

router.get('/saved-posts', userController.getSavedPosts);

router.put('/users/:id/friend-request/accept',userController.acceptFriendRequest);

router.delete( '/users/:id/friend-request/reject',userController.rejectFriendRequest);
router.delete('/users/:id/friend-request/cancel',userController.cancelFriendRequest);
router.delete('/users/me',userController.deleteUser);
router.get('/users/stats/by-city',userController.getUsersCountByCity);
module.exports = router;