const jwt = require('jsonwebtoken')
const User = require('../Models/dbModel')

/// Middleware to authenticate user using JWT token
/// req is the request object, res is the response object, next is the next middleware function
const auth = async (req, res, next) => { 
    try{
        const token = req.header('Authorization')?.replace('Bearer ', ''); /// Extract token from Authorization header by removing 'Bearer ' prefix
        
        if(!token) { 
            return res.status(401).json({
                success: false, 
                message: 'Authentication token is missing'
            }); 
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using the secret key
        const user = await User.findById(decoded.userId).select('-password'); // Find user by ID and exclude password
        if(!user) {
            return res.status(401).json({
                success: false, 
                message: 'User not found'
            });
        } 
        req.user = user; // Attach user to request object
        next(); // Proceed to the next middleware or route handler
    }
    catch(error) {
        console.error('Authentication error:', error);
        res.status(401).json({ success: false, message: 'Authentication failed' });
    }
};

/// an example of roles: when we use authorize('Admin', 'Manager', 'HR'),
/// roles will be ['Admin', 'Manager', 'HR']
const authorize = (...roles) => {  /// here roles is an array of allowed roles
    /// this function returns a middleware function. Higher order function
    return (req, res, next) => { 
        if(!req.user) { 
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        if(!roles.includes(req.user.type)) { 
            return res.status(403).json({
                success:false,
                message: 'Insufficent permissions'
            }); 
        }
        next(); // Proceed if user has the required role
    };
}; 

module.exports = { auth, authorize }; // Export auth and authorize middleware