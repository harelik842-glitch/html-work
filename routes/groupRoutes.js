const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groupController');

router.post('/groups', groupController.createGroup);
router.get('/groups', groupController.getGroups);
router.put('/groups/:id/join', groupController.joinGroup);
router.get('/my-groups', groupController.getMyGroups);
router.put('/groups/:id', groupController.updateGroup);
router.delete('/groups/:groupId/members/:memberId', groupController.removeMember);
router.get('/users/:id/groups', groupController.getGroupsByUserId);
module.exports = router;