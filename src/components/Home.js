import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Welcome to the Quiz App</h1>
      <p>Are you a new user or do you already have an account?</p>
      <div>
        <Link to="/login">
          <button style={{ margin: '0.5rem' }}>I already have an account</button>
        </Link>
        <Link to="/register">
          <button style={{ margin: '0.5rem' }}>I'm a new user</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
