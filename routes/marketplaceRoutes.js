const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const marketplaceController =
    require('../controllers/marketplaceController');

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
    '/marketplace',
    marketplaceController.getItems
);

router.post(
    '/marketplace',
    upload.single('image'),
    marketplaceController.createItem
);

module.exports = router;