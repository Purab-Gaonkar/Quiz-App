import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function QuizList({ quizzes, isAdmin, onDelete }) {
  const handleDelete = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await axios.delete(`/api/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        onDelete();
      } catch (error) {
        console.error('Detailed error deleting quiz:', error.response?.data || error);
        alert('Failed to delete quiz. Please try again.');
      }
    }
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
                <Link to={`/admin/edit-quiz/${quiz.id}`}>Edit</Link>
                <button onClick={() => handleDelete(quiz.id)}>Delete</button>
                <Link to={`/admin/quiz-results/${quiz.id}`}>View Results</Link>
              </>
            ) : (
              <Link to={`/user/take-quiz/${quiz.id}`}>Take Quiz</Link>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default QuizList;