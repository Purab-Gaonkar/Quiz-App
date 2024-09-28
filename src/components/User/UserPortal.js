import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import UserDashboard from './UserDashboard';
import TakeQuiz from './TakeQuiz';

function UserPortal() {
  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/user">Dashboard</Link></li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<UserDashboard />} />
        <Route path="/take-quiz/:id" element={<TakeQuiz />} />
      </Routes>
    </div>
  );
}

export default UserPortal;