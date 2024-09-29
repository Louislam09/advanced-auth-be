import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const verifyToken = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; // Get token from cookies or authorization header

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        const user = await User.findById(decoded.userId).select('-password'); // Get the user without the password
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user; // Attach the user to the request object
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};
