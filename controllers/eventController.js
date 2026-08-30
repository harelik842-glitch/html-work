const Event = require('../models/Event');

const createEvent = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        let image = '';

        if (req.file) {
            image = `/uploads/${req.file.filename}`;
        }

        const event = new Event({
            name: req.body.name,
            description: req.body.description,
            location: req.body.location,
            date: req.body.date,
            image: image,
            creator: userId,
            attendees: [userId]
        });

        const savedEvent = await event.save();

        res.status(201).json({
            message: 'Event created successfully',
            event: savedEvent
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error creating event',
            error: error.message
        });
    }
};


const getEvents = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const events = await Event.find({})
            .populate(
                'creator',
                'username firstName lastName profileImage'
            )
            .populate(
                'attendees',
                'username firstName lastName profileImage'
            )
            .sort({ date: 1 });

        res.status(200).json(events);

    } catch (error) {
        res.status(500).json({
            message: 'Error getting events',
            error: error.message
        });
    }
};


const joinEvent = async (req, res) => {
    try {
        const userId = req.session.userId;
        const eventId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: 'Event not found'
            });
        }

        const alreadyAttending =
            event.attendees.some(
                attendeeId =>
                    attendeeId.toString() ===
                    userId.toString()
            );

        if (!alreadyAttending) {
            event.attendees.push(userId);
            await event.save();
        }

        res.status(200).json({
            message: 'Joined event successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error joining event',
            error: error.message
        });
    }
};


const leaveEvent = async (req, res) => {
    try {
        const userId = req.session.userId;
        const eventId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: 'Event not found'
            });
        }

        event.attendees =
            event.attendees.filter(
                attendeeId =>
                    attendeeId.toString() !==
                    userId.toString()
            );

        await event.save();

        res.status(200).json({
            message: 'Left event successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error leaving event',
            error: error.message
        });
    }
};


module.exports = {
    createEvent,
    getEvents,
    joinEvent,
    leaveEvent
};