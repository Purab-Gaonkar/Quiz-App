import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QuizList from '../shared/QuizList';

function AdminDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/quizzes', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
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
      <h1>Admin Dashboard</h1>
      <QuizList quizzes={quizzes} isAdmin={true} onDelete={fetchQuizzes} />
    </div>
  );
}

export default AdminDashboard;