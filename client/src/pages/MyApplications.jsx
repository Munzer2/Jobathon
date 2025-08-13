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

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from localStorage
    localStorage.removeItem("user"); // Remove user data from localStorage
    navigate("/login"); // Redirect to login page
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-500 bg-opacity-20 text-yellow-400";
      case "accepted":
        return "bg-green-500 bg-opacity-20 text-green-400";
      case "rejected":
        return "bg-red-500 bg-opacity-20 text-red-400";
      case "interview":
        return "bg-blue-500 bg-opacity-20 text-blue-400";
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

      { /* Main content */}
      <main className = "max-w-7xl mx-auto px-6 py-8">
        {/* { Header } */}
        <div className = "mb-8">
            <h2 className = "text-3xl font-bold text-white mb-2">My Applications</h2>
            <p className = "text-gray-400">
                Track the status of your job applications in one place.
            </p>
        </div>

        { /* Applications stats */}
        <div className = "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className = "bg-gray-800 rounded-lg p-6">
                <div className = "flex items-center">
                    <div className = "p-3 rounded-full bg-blue-500 bg-opacity-20">
                        <i className = "fas - fa-paper-plane text-blue-400 text-xl"></i>
                    </div>
                    <div>
                        
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div> 
  );
};

export default MyApplications;
