import React from 'react';
import { useNavigate } from 'react-router-dom';

function QuizResults({ quiz, userAnswers, score }) {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Quiz Completed</h2>
      <p>Your score: {score.toFixed(2)}%</p>
      
      {quiz.questions.map((question, index) => (
        <div key={question.id} style={{ marginBottom: '20px' }}>
          <h3>Question {index + 1}: {question.question_text}</h3>
          <ul>
            {question.options.map((option, optionIndex) => (
              <li key={option.id} style={{
                color: option.is_correct ? 'green' : (userAnswers[index] === optionIndex ? 'red' : 'black'),
                fontWeight: (option.is_correct || userAnswers[index] === optionIndex) ? 'bold' : 'normal'
              }}>
                {option.option_text}
                {option.is_correct && ' ✓'}
                {userAnswers[index] === optionIndex && !option.is_correct && ' ✗'}
              </li>
            ))}
          </ul>
        </div>
      ))}
      
      <button onClick={() => navigate('/user')}>Back to Dashboard</button>
    </div>
  );
}

export default QuizResults;
