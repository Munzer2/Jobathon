const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../Models/dbModel'); 
const { auth } = require('../middleware/auth');
const router = express.Router();


router.post('/login', async ( req, res ) => {
    try {
        const { email , password } = req.body;

        const user = await User.findOne({ email }) ; 
        if(!user || !await user.comparePassword(password)) {
            return res.status(401).json({ success: false, message: 'Invalid creds'});
        }

        const token = jwt.sign({ userId: user._id}, process.env.JWT_SECRET, { expiresIn: '7d'});
        res.json({
            success: true, 
            token,
            user: {
                id: user._id, 
                firstName: user.firstName, 
                lastName: user.lastName, 
                email: user.email, 
                type: user.type
            }
        });
    }
    catch(error) {
        res.status(500).json({ success: false, message: 'Server error'});
    }
}); 


router.post('/register', async (req,res) => {
    try {
        const { firstName, lastName, email, password, city, state, country, age, gender, phone , type } = req.body;

        const existing = await User.findOne({email}); 
        if(existing) {
            return res.status(400).json({ success: false, message: 'User already exists'});
        }

        const newUser = new User({
            firstName,
            lastName,
            email,  
            password,
            city,
            state,
            country,
            age,
            gender, 
            phone,
            type,
            hobbies: []
        }); 

        await newUser.save();

        res.status(201).json({
            success: true, 
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                type: newUser.type
            }
        }); 
    }
    catch(error) {
        res.status(500).json({ success: false, message: 'Server error'});
    }
}); 



router.get('/profile/:userId', async (req, res) => {
    try { 
        const user = await User.findById(req.params.userId).select('-password');
        if(!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch(error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}); 

// Test route to verify auth routes are working
router.get('/test-users', auth, async (req, res) => {
    try {
        console.log('TEST: Auth routes working, user:', req.user?.firstName);
        res.json({ 
            success: true, 
            message: 'Auth routes working',
            userCount: await User.countDocuments()
        });
    } catch(error) {
        console.error('Test route error:', error);
        res.status(500).json({ success: false, message: 'Test route error' });
    }
});

// Get all users for messaging (excluding current user)
router.get('/users', auth, async (req, res) => {
    try {
        // console.log('GET /users endpoint called');
        // console.log('User making request:', req.user?.firstName, req.user?.lastName);
        
        const users = await User.find({ _id: { $ne: req.user._id } })
            .select('firstName lastName type email')
            .sort({ firstName: 1 });
        
        // console.log('Found users:', users.length);
        
        res.json({ 
            success: true, 
            users 
        });
    } catch(error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}); 


router.get('/hobbies/:userId', async (req, res) => { 
    try { 
        const user = await User.findById( req.params.userId ).select('hobbies');
        if(!user) {
            return res.status(404).json({
                success: false, 
                message: 'User not found',
            }); 
        }
        res.json({
            success: true, 
            hobbies: user.hobbies
        }); 
    }
    catch(error) {  
        res.status(500).json({ success: false, message: 'Server error' });
    }
}); 


router.post('/hobbies/:userId', async(req, res) => {
    try{
        const { hobby } = req.body;
        const user = await User.findById(req.params.userId);

        if(!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if(!user.hobbies.includes(hobby)) {
            user.hobbies.push(hobby); 
            await user.save(); 
        }

        res.json({
            success: true, 
            hobbies: user.hobbies
        }); 
    }
    catch(error) {
        console.error('Error adding hobby:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}); 



router.get('/stats', async (req, res) =>  {
    try {
        const totusers = await User.countDocuments;
        const seekers = await User.countDocuments({ type: 'Seeker'}); 
        const employers = await User.countDocuments({ type: 'Employer'});
        const recruiters = await User.countDocuments({ type: 'Recruiter'});
        res.json({
            success: true ,
            statistics: {
                total: totusers,
                seekers: seekers,
                employers: employers,
                recruiters: recruiters
            }
        }); 
    }
    catch(error) { 
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}); 





module.exports = router;