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

const groupController = require('../controllers/groupController');

router.post('/groups', groupController.createGroup);
router.post(
    '/groups-with-image',
    upload.single('image'),
    groupController.createGroupWithImage
);
router.get('/groups', groupController.getGroups);
router.get('/search/groups', groupController.searchGroups);
router.get('/groups/:id', groupController.getGroupById);
router.put('/groups/:id/join', groupController.joinGroup);
router.put('/groups/:id/leave', groupController.leaveGroup);
router.get('/my-groups', groupController.getMyGroups);
router.put('/groups/:id',upload.single('image'), groupController.updateGroup);
router.delete('/groups/:groupId/members/:memberId', groupController.removeMember);
router.get('/users/:id/groups', groupController.getGroupsByUserId);
module.exports = router;