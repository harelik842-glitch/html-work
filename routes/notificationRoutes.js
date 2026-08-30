const express = require('express');
const router = express.Router();

const notificationController =
    require('../controllers/notificationController');

router.get(
    '/notifications/latest',
    notificationController.getLatestNotifications
);

router.get(
    '/notifications',
    notificationController.getAllNotifications
);

router.get(
    '/notifications-unread-count',
    notificationController.getUnreadNotificationsCount
);

router.put(
    '/notifications/read-all',
    notificationController.markAllNotificationsAsRead
);

module.exports = router;