import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Ensure this is imported for additional styles

function Home() {
  return (
    <div>
      <div className="hero-container">
        <div className="hero-overlay">
          <h2 className="overlay-text">Take Your Knowledge to the Next Level</h2>
        </div>
      </div>
      <div className="hero-content">
        <h1 className="overlay-text">Welcome to the Quiz App</h1>
        <p>Are you a new user or do you already have an account?</p>
        <div>
          <Link to="/login">
            <button className="hero-button">I already have an account</button>
          </Link>
          <Link to="/register">
            <button className="hero-button">I'm a new user</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
