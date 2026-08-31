const Notification =
    require('../models/Notification');


const getLatestNotifications =
    async (req, res) => {

        try {

            const userId =
                req.session.userId;


            if (!userId) {

                return res.status(401).json({
                    message:
                        'User is not logged in'
                });
            }


            const notifications =
                await Notification.find({
                    recipient: userId
                })
                    .populate(
                        'sender',
                        'firstName lastName username profileImage'
                    )
                    .populate(
                        'post',
                        'text image video'
                    )
                    .populate(
                        'group',
                        'name image'
                    )
                    .sort({
                        createdAt: -1
                    })
                    .limit(10);


            res.status(200).json(
                notifications
            );


        } catch (error) {

            console.error(
                'GET LATEST NOTIFICATIONS ERROR:',
                error
            );


            res.status(500).json({
                message:
                    'Error loading notifications',
                error: error.message
            });
        }
    };


const getAllNotifications =
    async (req, res) => {

        try {

            const userId =
                req.session.userId;


            if (!userId) {

                return res.status(401).json({
                    message:
                        'User is not logged in'
                });
            }


            const notifications =
                await Notification.find({
                    recipient: userId
                })
                    .populate(
                        'sender',
                        'firstName lastName username profileImage'
                    )
                    .populate(
                        'post',
                        'text image video'
                    )
                    .populate(
                        'group',
                        'name image'
                    )
                    .sort({
                        createdAt: -1
                    });


            res.status(200).json(
                notifications
            );


        } catch (error) {

            console.error(
                'GET ALL NOTIFICATIONS ERROR:',
                error
            );


            res.status(500).json({
                message:
                    'Error loading all notifications',
                error: error.message
            });
        }
    };


const getUnreadNotificationsCount =
    async (req, res) => {

        try {

            const userId =
                req.session.userId;


            if (!userId) {

                return res.status(401).json({
                    message:
                        'User is not logged in'
                });
            }


            const unreadCount =
                await Notification.countDocuments({
                    recipient: userId,
                    isRead: false
                });


            res.status(200).json({
                unreadCount:
                    unreadCount
            });


        } catch (error) {

            console.error(
                'GET UNREAD NOTIFICATIONS COUNT ERROR:',
                error
            );


            res.status(500).json({
                message:
                    'Error loading unread notifications count',
                error: error.message
            });
        }
    };


const markAllNotificationsAsRead =
    async (req, res) => {

        try {

            const userId =
                req.session.userId;


            if (!userId) {

                return res.status(401).json({
                    message:
                        'User is not logged in'
                });
            }


            await Notification.updateMany(
                {
                    recipient:
                        userId,

                    isRead:
                        false
                },
                {
                    $set: {
                        isRead:
                            true
                    }
                }
            );


            res.status(200).json({
                message:
                    'Notifications marked as read'
            });


        } catch (error) {

            console.error(
                'MARK NOTIFICATIONS AS READ ERROR:',
                error
            );


            res.status(500).json({
                message:
                    'Error marking notifications as read',
                error: error.message
            });
        }
    };


module.exports = {
    getLatestNotifications,
    getAllNotifications,
    getUnreadNotificationsCount,
    markAllNotificationsAsRead
};