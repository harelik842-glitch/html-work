const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const messageController = require('../controllers/messageController');

const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
});

router.post('/messages', upload.single('media'), messageController.sendMessage);

router.get('/conversations', messageController.getConversations);

router.get('/messages/:userId', messageController.getConversationMessages);

router.put('/messages/:userId/read', messageController.markConversationAsRead);

router.get('/messages-unread-count', messageController.getUnreadMessagesCount);

module.exports = router;