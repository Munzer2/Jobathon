const express = require('express');
const Job = require('../Models/jobModel'); // Fixed: Jobs -> Job
const User = require('../Models/dbModel'); 
const router = express.Router();
const { auth, authorize } = require('../middleware/auth'); // Import auth middleware

// Get all jobs with filtering and search - public endpoint with optional auth
router.get('/', async (req, res) => {
    try {
        const { search, location, type, category, page = 1, limit = 100 } = req.query;
        
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

        // Check if user is authenticated and add application status
        let jobsWithApplicationStatus = jobs;
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                jobsWithApplicationStatus = jobs.map(job => {
                    const hasApplied = job.applications.some(
                        app => app.applicantId.toString() === decoded.userId.toString()
                    );
                    return {
                        ...job.toObject(),
                        hasApplied
                    };
                });
            } catch (error) {
                // If token is invalid, just return jobs without application status
                console.log('Invalid token, returning jobs without application status');
                jobsWithApplicationStatus = jobs.map(job => ({
                    ...job.toObject(),
                    hasApplied: false
                }));
            }
        } else {
            // No token provided, return jobs without application status
            jobsWithApplicationStatus = jobs.map(job => ({
                ...job.toObject(),
                hasApplied: false
            }));
        }
            
        const total = await Job.countDocuments(query);
        
        res.json({
            success: true,
            data: jobsWithApplicationStatus,
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

/// Get applications for the authenticated user.
router.get('/applications', auth, async(req, res)=> {
    try {
        const userId = req.user._id; // Get from authenticated user
        const jobsWithApplications = await Job.find({
            'applications.applicantId': userId, isActive: true
        }).populate('employerId', 'firstName lastName company')
        .sort({'applications.appliedAt' : - 1 });

        const userApps = [];
        jobsWithApplications.forEach(job => {
            const application = job.applications.find(app => app.applicantId.toString() === userId.toString());
            if(application) {
                userApps.push({
                    _id: application._id,
                    jobId: job._id,
                    jobTitle: job.title,
                    company: job.company,
                    location: job.location,
                    type: job.type,
                    salary: job.salary,
                    appliedAt: application.appliedAt,
                    status: application.status || 'Applied',
                    coverLetter: application.coverLetter,
                    employer: job.employerId
                });
            }
        });

        res.json({
            success: true,
            applications: userApps,
            total: userApps.length
        });
    }
    catch(error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ success: false, message: 'Error fetching the applications'});
    }
}); 


router.get('/employer/:employerId', async(req,res) => {
    try {
        const jobs = await Job.find({ employerId : req.params.employerId })
            .populate('applications.applicantId', 'firstName lastName email')
            .sort({ postedAt: -1}); /// sort by most recent first

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

/// Create a new job - protected by auth middleware
/// Only employers can create jobs
router.post('/create', auth, authorize('Employer'), async (req, res) => {
    try{
        const { title, company, description, requirements, location, type, salary,
            experience, category, skills, benefits, deadline } = req.body;
            
        const employerId = req.user._id; // Get from authenticated user

        const newJob = new Job({
            title, company, description, requirements, location, type, salary,
            experience, category, skills, benefits, deadline, employerId
        }); 

        await newJob.save(); 

        const PopulatedJob = await Job.findById(newJob._id)
        .populate('employerId', 'firstName lastName company'); 

        res.status(201).json({
            success: true,
            data: PopulatedJob
        }); 
    }
    catch(error) { 
        console.error('Error creating a job: ' ,error);
        res.status(500).json({
            success: false,
            message: 'Server error' 
        });
    }
}); 

router.get('/stats', async(req,res)=> {
    try {

        const totalJobs = await Job.countDocuments({ isActive: true }); /// Count total active jobs

        const cat = await Job.aggregate([
            { $match : { isActive : true }}, /// filter actiive jobs
            { $group : { _id: '$category', count: { $sum: 1 } } }, // group by category
            { $sort: { count: -1 } } // sort by count descending
        ]);  

        const totalApplications = await Job.aggregate([
            { $match : { isActive : true }},
            { $project: { applicationCount : { $size: '$applications'}}}, /// get application count. WHat project does is it creates a new field applicationCount which is the size of the applications array
            { $group : { _id : null, total: { $sum: 'applicationCount'}}} /// total applications
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
                cat,
                types
            }
        }); 
    }
    catch(error) {
        console.error('Error fetching job stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}); 


// Get single job by ID
router.get('/:id', async(req,res) => {
    try { 
        const job = await Job.findById(req.params.id) // Fixed: Jobs -> Job
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


/// Apply to a job - protected by auth middleware
router.post('/:id/apply', auth, async(req, res) => { 
    try {
        const { coverLetter } = req.body; 
        const applicantId = req.user._id; // Get from authenticated user
        const JobId = req.params.id; 

        // Check if user is a seeker
        if (req.user.type !== 'Seeker') {
            return res.status(403).json({
                success: false,
                message: 'Only job seekers can apply to jobs'
            });
        }

        const job = await Job.findById(JobId); 
        if(!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found' 
            }); 
        }

        const existingApp = job.applications.find(
            app => app.applicantId.toString() === applicantId.toString() 
        );

        if(existingApp) { 
            return res.status(400).json({
                success: false, message: 'Already applied to this job' 
            }); 
        }

        /// add the application
        job.applications.push({
            applicantId, 
            coverLetter: coverLetter || 'Applied through job portal', 
            appliedAt : new Date() 
        }); 

        await job.save();

        res.json({
            success: true, 
            message: 'Application submitted successfully',
            application: {
                jobId: JobId,
                jobTitle: job.title,
                company: job.company,
                appliedAt: new Date()
            }
        }); 
    }
    catch(error) { 
        console.error('Error applying to job:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


module.exports = router;