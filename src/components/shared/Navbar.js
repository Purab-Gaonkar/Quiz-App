import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f0f0f0' }}>
      <div>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        {isLoggedIn && (
          <>
            <Link to={isAdmin ? "/admin" : "/user"} style={{ marginRight: '1rem' }}>Dashboard</Link>
            {isAdmin && <Link to="/admin/create-quiz" style={{ marginRight: '1rem' }}>Create Quiz</Link>}
          </>
        )}
      </div>
      <div>
        {isLoggedIn ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
