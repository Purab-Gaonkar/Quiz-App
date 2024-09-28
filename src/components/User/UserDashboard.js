import React, { useState, useEffect } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import QuizList from '../shared/QuizList';
import UserProfile from './UserProfile';

function UserDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/quizzes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched quizzes:', response.data); // Add this line
      setQuizzes(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Failed to fetch quizzes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>User Dashboard</h1>
      <nav>
        <ul>
          <li><Link to="/user/profile">My Profile</Link></li>
          <li><Link to="/user/quizzes">Available Quizzes</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="profile" element={<UserProfile />} />
        <Route path="quizzes" element={
          quizzes.length > 0 
            ? <QuizList quizzes={quizzes} isAdmin={false} /> 
            : <p>No quizzes available.</p>
        } />
      </Routes>
    </div>
  );
}

export default UserDashboard;