const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.post('/users', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/current-user', userController.getCurrentUser);
router.put('/users/:id/friend', userController.addFriend);
router.get('/users', userController.getUsers);
router.delete('/users/:id/friend', userController.removeFriend);

module.exports = router;