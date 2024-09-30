import React, { useState } from 'react';
import axios from 'axios';
import './QuizList.css';

function QuizList({ quizzes, isAdmin, onDelete }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      setLoading(true);
      try {
        await axios.delete(`/api/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        alert('Quiz deleted successfully.');
        onDelete(); // Refresh quiz list
      } catch (error) {
        console.error('Detailed error deleting quiz:', error.response?.data || error);
        alert('Failed to delete quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (quizId) => {
    // Navigate to edit quiz page
    window.location.href = `/admin/edit-quiz/${quizId}`;
  };

  const handleViewResults = (quizId) => {
    // Navigate to quiz results page
    window.location.href = `/admin/quiz-results/${quizId}`;
  };

  return (
    <ul className="quiz-list">
      {quizzes.map((quiz) => (
        <li key={quiz.id} className="quiz-item">
          <h3>{quiz.title}</h3>
          <p>Time Limit: {quiz.time_limit} seconds</p>
          <div className="quiz-item-actions">
            {isAdmin ? (
              <>
                <button 
                  onClick={() => handleEdit(quiz.id)} 
                  className="action-button"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(quiz.id)} 
                  disabled={loading} 
                  className="action-button"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
                <button 
                  onClick={() => handleViewResults(quiz.id)} 
                  className="action-button"
                >
                  View Results
                </button>
              </>
            ) : (
              <button 
                onClick={() => window.location.href = `/user/take-quiz/${quiz.id}`} 
                className="action-button"
              >
                Take Quiz
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default QuizList;
