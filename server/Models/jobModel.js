const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [String], 
    location: { type: String, required: true },
    type: { type: String, enum: ['Full-time', 'Part-time', 'Remote', 'Internship'], required: true}, 
    salary: {
        min: Number,
        max: Number, 
        currency: { type: String, default:'USD'}
    },
    experience: { type: String, enum: ['Entry-level', 'Mid-level', 'Senior-level'], required: true },
    category: { type: String, required: true },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applications: [{
        applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        appliedAt: { type: Date, default: Date.now}, 
        status: { type: String, enum: ['Applied', 'Reviewing', 'Interview', 'Rejected', 'Hired'], default: 'Applied'}, 
        coverLetter: String
    }],
    isActive: {type: Boolean, default: true},
    postedAt : { type: Date, default: Date.now}, 
    deadline: Date, 
    skills: [ String ],
    benefits: [String] 
}, {
    timestamps : true /// Automatically adds createdAt and updatedAt fields
}); 


/// These lines create indexes on the job schema to optimize search and query performance.
/// The first line creates a text index for full-text search on the title, company, and description fields.
/// The second line creates a compound index on location, category, and type for faster queries based on these fields.
jobSchema.index({ title: 'text', company: 'text', description: 'text'});  
jobSchema.index({ location: 1 , category: 1, type: 1 }); 


module.exports = mongoose.model('Job', jobSchema);