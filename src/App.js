// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar'; // Import the Navbar
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import MeetingPortal from './components/MeetingPortal'; // Import your MeetingPortal component
import Feedback from './components/Feedback';

function App() {
    return (
        <Router>
            <Navbar /> {/* Include the Navbar */}
            <Routes>
                <Route path="/" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/meeting-portal" element={<MeetingPortal />} />
                <Route path="/feedback" element={<Feedback />} />
                {/* Add other routes as necessary */}
            </Routes>
        </Router>
    );
}

export default App;
