const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const eventController =
    require('../controllers/eventController');

const uploadDir =
    path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() +
            '-' +
            Math.round(Math.random() * 1E9);

        cb(
            null,
            uniqueName +
            path.extname(file.originalname)
        );
    }
});

const upload = multer({
    storage: storage
});

router.get(
    '/events',
    eventController.getEvents
);

router.post(
    '/events',
    upload.single('image'),
    eventController.createEvent
);

router.put(
    '/events/:id/join',
    eventController.joinEvent
);

router.delete(
    '/events/:id/join',
    eventController.leaveEvent
);

module.exports = router;