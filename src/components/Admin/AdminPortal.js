import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import CreateQuiz from './CreateQuiz';
import QuizResults from './QuizResults';

function AdminPortal() {
  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/admin">Dashboard</Link></li>
          <li><Link to="/admin/create-quiz">Create Quiz</Link></li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/quiz-results/:id" element={<QuizResults />} />
      </Routes>
    </div>
  );
}

export default AdminPortal;