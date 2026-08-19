const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groupController');

router.post('/groups', groupController.createGroup);
router.get('/groups', groupController.getGroups);
router.put('/groups/:id/join', groupController.joinGroup);

module.exports = router;