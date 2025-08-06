const express = require('express');
const Job = require('../Models/jobModel');
const User = require('../Models/dbModel'); 
const router = express.Router();

// Get all jobs with filtering and search
router.get('/', async (req, res) => {
    try {
        const { search, location, type, category, page = 1, limit = 10 } = req.query;
        
        let query = { isActive: true };
        
        // Add search functionality
        if (search) {
            query.$text = { $search: search };
        }
        
        // Add filters
        if (location) query.location = new RegExp(location, 'i');
        if (type) query.type = type;
        if (category) query.category = category;
        
        const jobs = await Job.find(query)
            .populate('employerId', 'firstName lastName company')
            .sort({ postedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Job.countDocuments(query);
        
        res.json({
            success: true,
            data: jobs,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get single job by ID
router.get('/:id', async(req,res) => {
    try { 
        const job = await Job.findById(req.params.id)
            .populate('employerId', 'firstName lastName email phone company')
            .populate('applications.applicantId', 'firstName lastName email');

        if(!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.json({
            success: true,
            data: job
        });
    } 
    catch(error) {
        console.error( 'Error fetching job: ' , error); 
        res.status(500).json({
            success: false,
            message: 'Server error' 
        }); 
    }
});

// Create a new job
router.post('/create', async (req, res) => {
    try{
        const { title, company, description, requirements, location, type, salary,
            experience, category, skills, benefits, deadline, employerId } = req.body;

        const newJob = new Job({
            title, company, description, requirements, location, type, salary,
            experience, category, skills, benefits, deadline, employerId
        }); 

        await newJob.save(); 

        const populatedJob = await Job.findById(newJob._id)
            .populate('employerId', 'firstName lastName company'); 

        res.status(201).json({
            success: true,
            data: populatedJob
        });
    } catch(error) {
        console.error('Error creating job:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Apply to a job
router.post('/:id/apply', async (req, res) => {
    try {
        const { applicantId, coverLetter } = req.body;
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if already applied
        const existingApp = job.applications.find(
            app => app.applicantId.toString() === applicantId
        );

        if (existingApp) {
            return res.status(400).json({
                success: false,
                message: 'Already applied to this job'
            });
        }

        // Add application
        job.applications.push({
            applicantId,
            coverLetter,
            appliedAt: new Date()
        });

        await job.save();

        res.json({
            success: true,
            message: 'Application submitted successfully'
        });
    } catch (error) {
        console.error('Error applying to job:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get jobs for specific employer
router.get('/employer/:employerId', async(req,res) => {
    try {
        const jobs = await Job.find({ employerId : req.params.employerId })
            .populate('applications.applicantId', 'firstName lastName email')
            .sort({ postedAt: -1});

        res.json({
            success: true, 
            data: jobs
        });
    }
    catch(error) {
        console.error('Error fetching jobs for employer:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get job statistics
router.get('/stats', async(req,res)=> {
    try {
        const totalJobs = await Job.countDocuments({ isActive: true });

        const categories = await Job.aggregate([
            { $match : { isActive : true }},
            { $group : { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);  

        const totalApplications = await Job.aggregate([
            { $match : { isActive : true }},
            { $project: { applicationCount : { $size: '$applications'}}},
            { $group : { _id : null, total: { $sum: '$applicationCount'}}}
        ]); 

        const types = await Job.aggregate([
            { $match : { isActive : true }},
            { $group: {_id: '$type', count : { $sum:1 }}},
            { $sort: { count: -1 } }
        ]); 

        res.json({
            success: true,
            data: {
                totalJobs,
                totalApplications: totalApplications[0]?.total || 0, 
                categories,
                types
            }
        }); 
    }
    catch(error) {
        console.error('Error fetching job stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}); 

module.exports = router;
