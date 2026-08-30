const MarketplaceItem = require('../models/MarketplaceItem');


// יצירת מודעה חדשה
const createItem = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const {
            name,
            description,
            price,
            location
        } = req.body;

        if (!name || !price) {
            return res.status(400).json({
                message: 'Name and price are required'
            });
        }

        let image = '';

        if (req.file) {
            image = `/uploads/${req.file.filename}`;
        }

        const newItem = new MarketplaceItem({
            seller: userId,
            name: name.trim(),
            description: description
                ? description.trim()
                : '',
            price: Number(price),
            location: location
                ? location.trim()
                : '',
            image: image
        });

        const savedItem =
            await newItem.save();

        const populatedItem =
            await MarketplaceItem.findById(savedItem._id)
                .populate(
                    'seller',
                    'username firstName lastName profileImage'
                );

        res.status(201).json({
            message: 'Marketplace item created successfully',
            item: populatedItem
        });

    } catch (error) {
        console.error(
            'Error creating marketplace item:',
            error
        );

        res.status(500).json({
            message: 'Error creating marketplace item',
            error: error.message
        });
    }
};


// קבלת כל המודעות
const getItems = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'User is not logged in'
            });
        }

        const items =
            await MarketplaceItem.find({})
                .populate(
                    'seller',
                    'username firstName lastName profileImage'
                )
                .sort({
                    createdAt: -1
                })
                .lean();

        res.status(200).json(items);

    } catch (error) {
        console.error(
            'Error getting marketplace items:',
            error
        );

        res.status(500).json({
            message: 'Error getting marketplace items',
            error: error.message
        });
    }
};


module.exports = {
    createItem,
    getItems
};