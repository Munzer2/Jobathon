import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Navigation Header */}
      <nav className="absolute w-full z-10 px-6 py-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-3xl font-bold text-yellow-400 tracking-wide">
            JOBATHON
          </div>
          <div className="space-x-3">
            <Link 
              to="/login" 
              className="px-6 py-2.5 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900 transition-all duration-300 rounded-lg font-medium"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="px-6 py-2.5 bg-yellow-400 text-gray-900 hover:bg-yellow-500 hover:shadow-lg transition-all duration-300 rounded-lg font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen px-6 pt-20 pb-16">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight">
            Find Your 
            <span className="text-yellow-400 block md:inline"> Dream Job</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Connect with top employers, discover opportunities, and build your career with Jobathon - 
            the modern job portal that puts you first.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/signup" 
              className="w-full sm:w-auto px-10 py-4 bg-yellow-400 text-gray-900 hover:bg-yellow-500 hover:shadow-xl transition-all duration-300 rounded-lg font-semibold text-lg transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-10 py-4 border-2 border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500 transition-all duration-300 rounded-lg font-semibold text-lg"
            >
              I'm Already a Member
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-8 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/30 hover:bg-gray-700/50 transition-all duration-300 group">
              <div className="text-5xl text-yellow-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                🔍
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Find Jobs</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Search through thousands of job opportunities from top companies worldwide.
              </p>
            </div>
            
            <div className="text-center p-8 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/30 hover:bg-gray-700/50 transition-all duration-300 group">
              <div className="text-5xl text-yellow-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                🤝
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Connect</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Network with professionals and build meaningful career connections.
              </p>
            </div>
            
            <div className="text-center p-8 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/30 hover:bg-gray-700/50 transition-all duration-300 group">
              <div className="text-5xl text-yellow-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                🚀
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Grow</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Advance your career with personalized recommendations and insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="text-yellow-400 font-bold text-2xl mb-6 tracking-wide">JOBATHON</div>
          <p className="text-gray-400 text-lg">
            © 2025 Jobathon. All rights reserved. Building careers, connecting futures.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;