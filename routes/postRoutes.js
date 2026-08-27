const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
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

const postController = require('../controllers/postController');

router.post( '/posts',upload.single('media'),  postController.createPost);
router.post( '/group-posts',upload.single('image'), postController.createGroupPost);
router.get('/videos', postController.getRandomVideos);
router.get('/posts', postController.getPosts);
router.delete('/posts/:id', postController.deletePost);
router.put('/posts/:id/like', postController.toggleLike);
router.get('/feed', postController.getFeedPosts);
router.get('/my-posts', postController.getMyPosts);
router.get('/users/:id/posts', postController.getPostsByUserId);
router.get( '/groups/:groupId/posts', postController.getPostsByGroupId);

module.exports = router;