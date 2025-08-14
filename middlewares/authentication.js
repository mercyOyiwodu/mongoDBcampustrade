const jwt = require('jsonwebtoken');
const Seller = require('../models/seller');


exports.authenticate = async (req, res, next) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) {
            return res.status(400).json({ message: 'token not found' });
        }
        const token = auth.split(' ')[1];
        if (!token) {
            return res.status(404).json({ message: 'Invalid Token' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const seller = await Seller.findById(decodedToken.sellerId);

        if (!seller) {
            return res.status(400).json({ message: 'Authentication failed: seller not found' });
        }

        if (seller.isLoggedIn !== decodedToken.isLoggedIn) {
            return res.status(401).json({
                message: 'Unauthorized: you must be logged in to perform this action'
            });
        }

        req.seller = seller;
        next();
    } catch (error) {
        console.log(error.message);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({
                message: 'Session timeout: Please login to continue'
            });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
