import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Components

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          <Routes>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
