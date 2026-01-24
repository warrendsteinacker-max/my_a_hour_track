import jwt from 'jsonwebtoken';

/**
 * PROTECT: Ensures the user is logged in via Tailscale/JWT
 * No longer uses MongoDB; reads user data directly from the token.
 */
export const protect = async (req, res, next) => {
    let token;

    // Check for token in the Authorization header (Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            /** * Instead of a DB lookup, we attach the decoded payload.
             * This contains: { id (username), role, hourlyRate }
             */
            req.user = decoded;

            next();
        } catch (error) {
            console.error('Auth Middleware Error:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * ADMIN ONLY: The Architect Gate
 * Verifies if the user's role matches your private ADMIN_ROLE_ID from .env
 */
export const adminOnly = (req, res, next) => {
    // Check role against the environment variable you set
    if (req.user && req.user.role === process.env.ADMIN_ROLE_ID) {
        next();
    } else {
        // High-level security rejection with your contact info
        res.status(403).json({ 
            message: 'Access Denied: Architect Level Required',
            contact: '231-878-0753' 
        });
    }
};