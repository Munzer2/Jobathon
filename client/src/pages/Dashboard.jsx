import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
      
      // Set dashboard data immediately
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
      
      // Simulate recent jobs data
      setRecentJobs([
        { id: 1, title: 'Senior Frontend Developer', company: 'TechCorp', location: 'San Francisco, CA', type: 'Full-time' },
        { id: 2, title: 'UX Designer', company: 'DesignStudio', location: 'New York, NY', type: 'Remote' },
        { id: 3, title: 'Product Manager', company: 'StartupXYZ', location: 'Austin, TX', type: 'Full-time' }
      ]);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderSeekerDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 bg-opacity-20">
              <i className="fas fa-paper-plane text-blue-400 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Applications</p>
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
              <i className="fas fa-chart-line text-yellow-400 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Success Rate</p>
              <p className="text-white text-2xl font-bold">67%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-white text-xl font-bold mb-4">Recent Job Applications</h3>
        <div className="space-y-3">
          {recentJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div>
                <p className="text-white font-medium">{job.title}</p>
                <p className="text-gray-400 text-sm">{job.company} • {job.location}</p>
              </div>
              <span className="text-gray-400 text-sm">
                {job.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => navigate('/jobs')}
          className="bg-yellow-400 text-gray-900 p-6 rounded-lg hover:bg-yellow-500 transition-colors"
        >
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
      {/* Stats Cards */}
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
              <i className="fas fa-check-circle text-purple-400 text-xl"></i>
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
              <i className="fas fa-user-check text-yellow-400 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Hired</p>
              <p className="text-white text-2xl font-bold">{stats.hired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-white text-xl font-bold mb-4">Recent Job Postings</h3>
        <div className="space-y-3">
          {recentJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div>
                <p className="text-white font-medium">{job.title}</p>
                <p className="text-gray-400 text-sm">{job.location} • {job.type}</p>
              </div>
              <span className="text-gray-400 text-sm">
                Active
              </span>
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
          <i className="fas fa-chart-bar text-2xl mb-2 text-yellow-400"></i>
          <p className="font-bold">View Analytics</p>
        </button>
        <button className="bg-gray-800 text-white p-6 rounded-lg hover:bg-gray-700 transition-colors">
          <i className="fas fa-cog text-2xl mb-2 text-yellow-400"></i>
          <p className="font-bold">Settings</p>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-yellow-400">Jobathon</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                Dashboard
              </a>
              <a 
                href="#" 
                onClick={(e) => {e.preventDefault(); navigate('/jobs');}}
                className="text-gray-300 hover:text-yellow-400 transition-colors"
              >
                Jobs
              </a>
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">
                Profile
              </a>
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">
                Messages
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {user.name}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Dashboard
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
