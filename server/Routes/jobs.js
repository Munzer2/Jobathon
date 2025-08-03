const express = require('express');
const Jobs = require('../Models/jobModel');
const User = require('../Models/dbModel'); 
const router = express.Router();



router.get('/:userId', async(req,res) => {
    try { 
        const job = await Jobs.findById(req.params.id)
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

/// Create a new job
router.post('/create', async (req, res) => {
    try{
        const { title, company, description, requirements, location, type, salary,
            experience, category, skills, benefits, deadline } = req.body;
            
        const { employerId } = req.body; 

        const newJob = new Job({
            title, company, description, requirements, location, type, salary,
            experience, category, skills, benefits, deadline
        }); 

        await newJob.save(); 

        const PopulatedJob = await Jobs.findById(newJob._id)
        .populate('employerId', 'firstName lastName company'); 

        res.status(201).json({
            success: true,
            data: PopulatedJob
        }); 
    }
    catch(error) { 
        console.error('Error creating a job: ' ,error);
        res.status(500).json({
            status: false,
            message: 'Server error' 
        });
    }
}); 


router.get('/apply', async(req, res) => { 
    try {
        const { applicantId, coverLetter } = req.body; 
        const JobId = req.params.id; 

        const job = await Jobs.findById(JobId); 
        if(!job) {
            return res.status(404).json({
                success: true,
                message: 'Job not found' 
            }); 
        }

        const existingApp = job.applications.find(
            app => app.applicantId.toString() == applicantId 
        );


        if(existingApp) { 
            return res.status(400).json({
                success: true, message: 'Already applied to this job' 
            }); 
        }

        /// add the application

        job.applications.push({
            applicantId, 
            coverLetter, 
            appliedAt : new Date() 
        }); 

        res.json({
            success: true, message: 'Application submitted successfully'
        }); 
    }
    catch(error) { 
        console.error('Error applying to job:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
})


