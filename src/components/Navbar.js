// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav style={{ padding: '1rem', background: '#f0f0f0', marginBottom: '1rem' }}>
            <Link to="/">Home</Link> | 
            <Link to="/register" style={{ margin: '0 1rem' }}>Register</Link> | 
            <Link to="/login" style={{ margin: '0 1rem' }}>Login</Link> | 
            <Link to="/dashboard" style={{ margin: '0 1rem' }}>Dashboard</Link> | 
            <Link to="/meeting-portal" style={{ margin: '0 1rem' }}>Meeting Portal</Link> | 
            <Link to="/feedback" style={{ margin: '0 1rem' }}>Feedback</Link>
            {/* Add other links as necessary */}
        </nav>
    );
};

export default Navbar;
