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
        console.error('Error deleting quiz:', error);
        alert('Failed to delete quiz. Please try again.');
      }
    }
  };

  return (
    <ul>
      {quizzes.map((quiz) => (
        <li key={quiz.id}>
          {quiz.title} - Time Limit: {quiz.time_limit} seconds
          {isAdmin ? (
            <>
              <Link to={`/admin/edit-quiz/${quiz.id}`}>Edit</Link>
              <button onClick={() => handleDelete(quiz.id)}>Delete</button>
              <Link to={`/admin/quiz-results/${quiz.id}`}>View Results</Link>
            </>
          ) : (
            <Link to={`/user/take-quiz/${quiz.id}`}>Take Quiz</Link>
          )}
        </li>
      ))}
    </ul>
  );
}

export default QuizList;