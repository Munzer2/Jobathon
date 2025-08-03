import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    jobsApplied: 0,
    jobsPosted: 0,
    applications: 0,
    totalViews: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
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
      
      // Simulate fetching dashboard data
      setTimeout(() => {
        if (parsedUser.type === 'Seeker') {
          setStats({
            jobsApplied: 12,
            savedJobs: 8,
            profileViews: 156,
            applications: 12
          });
        } else if (parsedUser.type === 'Employer') {
          setStats({
            jobsPosted: 5,
            totalApplications: 234,
            activeJobs: 3,
            hired: 8
          });
        }
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

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
          <p className="text-white mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const renderSeekerDashboard = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 bg-opacity-20">
              <i className="fas fa-briefcase text-blue-400 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Jobs Applied</p>
              <p className="text-white text-2xl font-bold">{stats.jobsApplied}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 bg-opacity-20">
              <i className="fas fa-heart text-green-400 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Saved Jobs</p>
              <p className="text-white text-2xl font-bold">{stats.savedJobs}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500 bg-opacity-20">
              <i className="fas fa-eye text-purple-400 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Profile Views</p>
              <p className="text-white text-2xl font-bold">{stats.profileViews}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-500 bg-opacity-20">
              <i className="fas fa-paper-plane text-yellow-400 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Applications</p>
              <p className="text-white text-2xl font-bold">{stats.applications}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-xl font-bold">Recent Applications</h3>
          <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {recentJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex-1">
                <h4 className="text-white font-medium">{job.title}</h4>
                <p className="text-gray-400 text-sm">{job.company} • {job.location}</p>
                <p className="text-green-400 text-sm font-medium">{job.salary}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  job.status === 'Applied' ? 'bg-blue-500 bg-opacity-20 text-blue-400' :
                  job.status === 'Interview' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                  'bg-yellow-500 bg-opacity-20 text-yellow-400'
                }`}>
                  {job.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-yellow-400 text-gray-900 p-6 rounded-lg hover:bg-yellow-500 transition-colors">
          <i className="fas fa-search text-2xl mb-2"></i>
          <p className="font-bold">Browse Jobs</p>
        </button>
        <button className="bg-gray-800 text-white p-6 rounded-lg hover:bg-gray-700 transition-colors">
          <i className="fas fa-user text-2xl mb-2 text-yellow-400"></i>
          <p className="font-bold">Update Profile</p>
        </button>
        <button className="bg-gray-800 text-white p-6 rounded-lg hover:bg-gray-700 transition-colors">
          <i className="fas fa-file-alt text-2xl mb-2 text-yellow-400"></i>
          <p className="font-bold">Upload Resume</p>
        </button>
      </div>
    </div>
  );

  const renderEmployerDashboard = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 bg-opacity-20">
              <i className="fas fa-briefcase text-blue-400 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Jobs Posted</p>
              <p className="text-white text-2xl font-bold">{stats.jobsPosted}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 bg-opacity-20">
              <i className="fas fa-users text-green-400 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Applications</p>
              <p className="text-white text-2xl font-bold">{stats.totalApplications}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500 bg-opacity-20">
              <i className="fas fa-chart-line text-purple-400 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Active Jobs</p>
              <p className="text-white text-2xl font-bold">{stats.activeJobs}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-500 bg-opacity-20">
              <i className="fas fa-check-circle text-yellow-400 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Hired</p>
              <p className="text-white text-2xl font-bold">{stats.hired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-xl font-bold">Your Job Listings</h3>
          <button className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-medium">
            Post New Job
          </button>
        </div>
        <div className="space-y-4">
          {recentJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex-1">
                <h4 className="text-white font-medium">{job.title}</h4>
                <p className="text-gray-400 text-sm">{job.applications} applications • Posted {job.posted}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  job.status === 'Active' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                  'bg-red-500 bg-opacity-20 text-red-400'
                }`}>
                  {job.status}
                </span>
                <button className="text-yellow-400 hover:text-yellow-300">
                  <i className="fas fa-edit"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-yellow-400 text-gray-900 p-6 rounded-lg hover:bg-yellow-500 transition-colors">
          <i className="fas fa-plus text-2xl mb-2"></i>
          <p className="font-bold">Post New Job</p>
        </button>
        <button className="bg-gray-800 text-white p-6 rounded-lg hover:bg-gray-700 transition-colors">
          <i className="fas fa-users text-2xl mb-2 text-yellow-400"></i>
          <p className="font-bold">View Candidates</p>
        </button>
        <button className="bg-gray-800 text-white p-6 rounded-lg hover:bg-gray-700 transition-colors">
          <i className="fas fa-chart-bar text-2xl mb-2 text-yellow-400"></i>
          <p className="font-bold">Analytics</p>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation Header */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-yellow-400">JOBATHON</h1>
            <span className="ml-4 text-gray-400">|</span>
            <span className="ml-4 text-white">Dashboard</span>
          </div>
          
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
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.firstName}!
          </h2>
          <p className="text-gray-400">
            {user.type === 'Seeker' 
              ? 'Ready to find your next opportunity?' 
              : 'Manage your job postings and find great candidates.'
            }
          </p>
        </div>

        {user.type === 'Seeker' ? renderSeekerDashboard() : renderEmployerDashboard()}
      </main>

      {/* Include Font Awesome for icons */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
      />
    </div>
  );
};

export default Dashboard;
