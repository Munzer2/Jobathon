import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Jobs = () => {
  const [user, setUser] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchJobs();
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  // Fetch all jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setAllJobs(response.data.data);
        setFilteredJobs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      alert('Error loading jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs based on search and filters
  useEffect(() => {
    let filtered = allJobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    if (selectedType) {
      filtered = filtered.filter(job => job.type === selectedType);
    }

    if (selectedExperience) {
      filtered = filtered.filter(job => job.experience === selectedExperience);
    }

    setFilteredJobs(filtered);
  }, [allJobs, searchTerm, selectedCategory, selectedType, selectedExperience]);

  // Apply to a job
  const handleApplyJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/jobs/${jobId}/apply`, {
        coverLetter: 'Applied through job portal'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert('Application submitted successfully!');
        // Update the job in the local state to reflect application
        setFilteredJobs(prev => prev.map(job => 
          job._id === jobId 
            ? { ...job, hasApplied: true }
            : job
        ));
        setAllJobs(prev => prev.map(job => 
          job._id === jobId 
            ? { ...job, hasApplied: true }
            : job
        ));
      }
    } catch (error) {
      if (error.response?.data?.message === 'Already applied to this job') {
        alert('You have already applied to this job.');
      } else {
        console.error('Error applying to job:', error);
        alert('Error submitting application. Please try again.');
      }
    }
  };

  // Get unique categories, types, and experience levels for filters
  const categories = [...new Set(allJobs.map(job => job.category))].sort();
  const jobTypes = [...new Set(allJobs.map(job => job.type))].sort();
  const experienceLevels = [...new Set(allJobs.map(job => job.experience))].sort();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-white mt-4">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation Header */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-yellow-400">JOBATHON</h1>
            <span className="ml-4 text-gray-400">|</span>
            <span className="ml-4 text-white">Browse Jobs</span>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Navigation Links */}
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white transition-colors flex items-center"
            >
              <i className="fas fa-tachometer-alt mr-2"></i>
              Dashboard
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-gray-400 text-sm">{user.type}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-gray-900 font-bold">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors"
                title="Logout"
              >
                <i className="fas fa-sign-out-alt text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Browse Jobs</h2>
          <p className="text-gray-400">
            Discover your next career opportunity from our extensive job listings.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-white text-xl font-bold mb-4">Find Your Perfect Job</h3>
          
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search jobs, companies, locations..."
                className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              className="px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Job Types</option>
              {jobTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              className="px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
            >
              <option value="">All Experience Levels</option>
              {experienceLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Results Count and Clear Filters */}
          <div className="mt-4 flex justify-between items-center">
            <p className="text-gray-400">
              Showing {filteredJobs.length} of {allJobs.length} jobs
            </p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedType('');
                setSelectedExperience('');
              }}
              className="text-yellow-400 hover:text-yellow-300 text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <i className="fas fa-search text-4xl text-gray-600 mb-4"></i>
              <p className="text-white text-xl mb-2">No jobs found</p>
              <p className="text-gray-400">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job._id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="text-white text-xl font-bold mr-3">{job.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.type === 'Full-time' ? 'bg-blue-500 bg-opacity-20 text-blue-400' :
                        job.type === 'Part-time' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                        job.type === 'Remote' ? 'bg-purple-500 bg-opacity-20 text-purple-400' :
                        'bg-yellow-500 bg-opacity-20 text-yellow-400'
                      }`}>
                        {job.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-400 mb-3">
                      <i className="fas fa-building mr-2"></i>
                      <span className="mr-4">{job.company}</span>
                      <i className="fas fa-map-marker-alt mr-2"></i>
                      <span className="mr-4">{job.location}</span>
                      <i className="fas fa-tag mr-2"></i>
                      <span>{job.category}</span>
                    </div>

                    <p className="text-gray-300 mb-4 overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      textOverflow: 'ellipsis'
                    }}>{job.description}</p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        {job.salary && job.salary.min && (
                          <span className="text-green-400 font-medium">
                            ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                          </span>
                        )}
                        <span className="text-gray-400 text-sm">{job.experience}</span>
                        <span className="text-gray-400 text-sm">
                          Posted {new Date(job.postedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                          {job.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 5 && (
                            <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                              +{job.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Benefits */}
                    {job.benefits && job.benefits.length > 0 && (
                      <div className="mt-3">
                        <p className="text-gray-400 text-sm mb-1">Benefits:</p>
                        <div className="flex flex-wrap gap-1">
                          {job.benefits.slice(0, 3).map((benefit, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 text-xs rounded"
                            >
                              {benefit}
                            </span>
                          ))}
                          {job.benefits.length > 3 && (
                            <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 text-xs rounded">
                              +{job.benefits.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex flex-col items-end space-y-2">
                    {user.type === 'Seeker' && (
                      <button
                        onClick={() => handleApplyJob(job._id)}
                        disabled={job.hasApplied}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          job.hasApplied 
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
                        }`}
                      >
                        <i className={`${job.hasApplied ? 'fas fa-check' : 'fas fa-paper-plane'} mr-2`}></i>
                        {job.hasApplied ? 'Applied' : 'Apply Now'}
                      </button>
                    )}
                    <button className="text-gray-400 hover:text-yellow-400 transition-colors">
                      <i className="fas fa-heart mr-1"></i>
                      Save
                    </button>
                    <button className="text-gray-400 hover:text-yellow-400 transition-colors">
                      <i className="fas fa-share mr-1"></i>
                      Share
                    </button>
                    <button className="text-gray-400 hover:text-yellow-400 transition-colors">
                      <i className="fas fa-info-circle mr-1"></i>
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button (for pagination) */}
        {filteredJobs.length > 0 && filteredJobs.length < allJobs.length && (
          <div className="text-center mt-8">
            <button className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
              Load More Jobs
            </button>
          </div>
        )}
      </main>

      {/* Include Font Awesome for icons */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
      />
    </div>
  );
};

export default Jobs;
