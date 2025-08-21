import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    /// check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      alert("You are not logged in. Please log in to view your applications.");
      navigate("/login"); // Redirect to login if not authenticated
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser); // Set user data from localStorage
      if (parsedUser.type != "Seeker") {
        alert("Only job seekers can view applications.");
        navigate("/dashboard"); // Redirect to dashboard if not a seeker
        return;
      }
      fetchApplications();
    } catch (error) {
      console.error("Error fetching user data:", error);
      navigate("/login");
    }
  }, [navigate]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/jobs/applications",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in request headers
          },
        }
      );

      if (res.data.success) {
        setApplications(res.data.applications); // Set applications from response
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please log in again.");
        navigate("/login"); // Redirect to login if unauthorized
      } else {
        alert("Failed to fetch applications. Please try again later.");
      }
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  const handleWithdrawApp = async (jobId, jobTitle) => {
    const confirmed = window.confirm(`Are you sure you want to remove this application for ${jobTitle}?`);

    if(!confirmed) return; 
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `http://localhost:5000/api/jobs/${jobId}/withdraw`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }, 
        }
      ); 

      //// This will remove the application from the list without refetching
      if(res.data.success) {
        alert("Application withdrawn successfully!");
        setApplications(prev => 
          prev.filter(app => app.jobId !== jobId)
        ); 
      }
    }
    catch(error) { 
      console.error("Error withdrawing application:", error); 
      if(error.response?.status === 401) {
        alert("Session expired. Please log in again"); 
      }
      else if(error.response?.status === 404) {
        alert("Application not found or already withdrawn."); 
        fetchApplications();
      }
      else if(error.response?.status === 400 ) {
        alert(error.response.data.message);
      }
      else {
        alert("Failed to withdraw application.")
      }
    }

  };

  const checkWithdrawApp = (status) => { 
    const nonWithdrawable = ['Accepted', 'Hired' , 'Rejected'];
    return  !nonWithdrawable.includes(status); 
  }; 

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from localStorage
    localStorage.removeItem("user"); // Remove user data from localStorage
    navigate("/login"); // Redirect to login page
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-500 bg-opacity-20 text-yellow-400";
      case "applied":
        return "bg-blue-500 bg-opacity-20 text-blue-400";
      case "accepted":
        return "bg-green-500 bg-opacity-20 text-green-400";
      case "rejected":
        return "bg-red-500 bg-opacity-20 text-red-400";
      case "interview":
        return "bg-purple-500 bg-opacity-20 text-purple-400";
      case "hired":
        return "bg-green-600 bg-opacity-20 text-green-300";
      default:
        return "bg-gray-500 bg-opacity-20 text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-white mt-4">Loading applications...</p>
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
            <span className="ml-4 text-white">My Applications</span>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-400 hover:text-white transition-colors flex items-center"
            >
              <i className="fas fa-tachometer-alt mr-2"></i>
              Dashboard
            </button>

            <button
              onClick={() => navigate("/jobs")}
              className="text-gray-400 hover:text-white transition-colors flex items-center"
            >
              <i className="fas fa-briefcase mr-2"></i>
              Browse Jobs
            </button>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-gray-400 text-sm">{user?.type}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-gray-900 font-bold">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
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

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">My Applications</h2>
          <p className="text-gray-400">
            Track the status of your job applications in one place.
          </p>
        </div>

        {/* Applications stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-500 bg-opacity-20">
                <i className="fas fa-paper-plane text-blue-400 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Total Applications</p>
                <p className="text-white text-2xl font-bold">{applications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-500 bg-opacity-20">
                <i className="fas fa-clock text-yellow-400 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">
                  {applications.filter(app => app.status === 'Applied' || app.status === 'Pending' || !app.status).length}
                </p>
                <p className="text-gray-400">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-500 bg-opacity-20">
                <i className="fas fa-users text-purple-400 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">
                  {applications.filter(app => app.status === 'Interview').length}
                </p>
                <p className="text-gray-400">Interview</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-500 bg-opacity-20">
                <i className="fas fa-check text-green-400 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">
                  {applications.filter(app => app.status === 'Accepted' || app.status === 'Hired').length}
                </p>
                <p className="text-gray-400">Accepted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Applications list */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-white text-xl font-bold mb-6">Recent Applications</h3>
          
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-inbox text-4xl text-gray-600 mb-4"></i>
              <p className="text-white text-xl mb-2">No applications yet</p>
              <p className="text-gray-400 mb-6">Start applying to jobs to see them here</p>
              <button
                onClick={() => navigate('/jobs')}
                className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
              >
                <i className="fas fa-search mr-2"></i>
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application._id} className="bg-gray-700 rounded-lg p-6 hover:bg-gray-650 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Job title and status badges */}
                      <div className="flex items-center mb-3">
                        <h4 className="text-white text-xl font-bold mr-4">{application.jobTitle}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status || "Applied"}
                        </span>
                        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                          application.type === 'Full-time' ? 'bg-blue-500 bg-opacity-20 text-blue-400' :
                          application.type === 'Part-time' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                          application.type === 'Remote' ? 'bg-purple-500 bg-opacity-20 text-purple-400' :
                          application.type === 'Internship' ? 'bg-red-500 bg-opacity-20 text-red-400' :
                          'bg-yellow-500 bg-opacity-20 text-yellow-400'
                        }`}>
                          {application.type}
                        </span>
                      </div>

                      {/* Company and location */}
                      <div className="flex items-center text-gray-400 mb-3">
                        <i className="fas fa-building mr-2"></i>
                        <span className="mr-4">{application.company}</span>
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        <span className="mr-4">{application.location}</span>
                      </div>

                      {/* Application date and salary */}
                      <div className="flex items-center text-sm text-gray-400 mb-4 space-x-6">
                        <div className="flex items-center">
                          <i className="fas fa-calendar mr-2"></i>
                          <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                        </div>
                        {application.salary && application.salary.min && (
                          <div className="flex items-center">
                            <i className="fas fa-dollar-sign mr-2"></i>
                            <span className="text-green-400">
                              ${application.salary.min.toLocaleString()} - ${application.salary.max.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Cover letter section */}
                      {application.coverLetter && application.coverLetter !== 'Applied through job portal' && (
                        <div className="mt-4 p-4 bg-gray-600 rounded-lg">
                          <p className="text-gray-300 text-sm">
                            <strong>Cover Letter:</strong> {application.coverLetter}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="ml-6 flex flex-col items-end space-y-2">
                      <button 
                        onClick={() => navigate(`/jobs/${application.jobId}`)}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors flex items-center"
                        title="View Job Details"
                      >
                        <i className="fas fa-eye mr-1"></i>
                        View Job
                      </button>
                      <button 
                        className="text-gray-400 hover:text-gray-300 transition-colors flex items-center"
                        title="Contact Employer"
                      >
                        <i className="fas fa-envelope mr-1"></i>
                        Contact
                      </button>
                  {checkWithdrawApp(application.status) ? (
                    <button onClick = {() => handleWithdrawApp(application.jobId, application.jobTitle)}
                    className = "text-red-400 hover:text-red-300 transition-colors flex items-center px-3 py-2 rounded-lg hover:bg-gray-600"
                    title = "Withdraw Application">
                      <i className = "fas fa-times mr-2"></i>
                      Withdraw</button>
                  ) : (
                    <div className = "text-gray-500 flex items-center px-3 py-2" title = "Can't withdraw this application">
                      <i className = "fas fa-lock mr-2"></i>
                      <span className = "text-xs">Cannot withdraw</span>
                    </div>
                  )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Include font awesome for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    </div> 
  );
};

export default MyApplications;
