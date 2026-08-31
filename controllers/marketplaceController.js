const MarketplaceItem =
    require('../models/MarketplaceItem');


const createItem = async (req, res) => {
    try {

        const userId =
            req.session.userId;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
            });
        }


        const {
            name,
            description,
            price,
            location
        } = req.body;


        if (
            !name ||
            name.trim() === '' ||
            price === undefined ||
            price === ''
        ) {

            return res.status(400).json({
                message:
                    'Name and price are required'
            });
        }


        const numericPrice =
            Number(price);


        if (
            !Number.isFinite(numericPrice) ||
            numericPrice < 0
        ) {

            return res.status(400).json({
                message:
                    'Price must be a valid number'
            });
        }


        let image = '';


        if (req.file) {

            image =
                `/uploads/${req.file.filename}`;
        }


        const newItem =
            new MarketplaceItem({
                seller:
                    userId,

                name:
                    name.trim(),

                description:
                    description
                        ? description.trim()
                        : '',

                price:
                    numericPrice,

                location:
                    location
                        ? location.trim()
                        : '',

                image:
                    image
            });


        const savedItem =
            await newItem.save();


        const populatedItem =
            await MarketplaceItem.findById(
                savedItem._id
            )
                .populate(
                    'seller',
                    'username firstName lastName profileImage'
                );


        res.status(201).json({
            message:
                'Marketplace item created successfully',
            item:
                populatedItem
        });


    } catch (error) {

        console.error(
            'CREATE MARKETPLACE ITEM ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error creating marketplace item',
            error: error.message
        });
    }
};


const getItems = async (req, res) => {
    try {

        const userId =
            req.session.userId;


        if (!userId) {

            return res.status(401).json({
                message:
                    'User is not logged in'
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


        res.status(200).json(
            items
        );


    } catch (error) {

        console.error(
            'GET MARKETPLACE ITEMS ERROR:',
            error
        );


        res.status(500).json({
            message:
                'Error getting marketplace items',
            error: error.message
        });
    }
};


module.exports = {
    createItem,
    getItems
};