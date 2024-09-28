import React, { useState, useEffect } from 'react';
import axios from 'axios';

function QuizAnalytics({ quizId }) {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [quizId]);

  const fetchAnalytics = async () => {
    const response = await axios.get(`/api/admin/quizzes/${quizId}/analytics`);
    setAnalytics(response.data);
  };
  const renderAnalytics = () => {
    if (!analytics) {
      return <p>Loading analytics...</p>;
    }

    return (
      <div className="quiz-analytics">
        <h2>Quiz Analytics</h2>
        <p>Total Attempts: {analytics.totalAttempts}</p>
        <p>Average Score: {analytics.averageScore.toFixed(2)}%</p>
        <p>Completion Rate: {analytics.completionRate.toFixed(2)}%</p>
        
        <h3>Question Breakdown</h3>
        <ul>
          {analytics.questionBreakdown.map((question, index) => (
            <li key={index}>
              Question {index + 1}: {question.correctRate.toFixed(2)}% correct
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Render analytics data
  return (
    <div>
      {renderAnalytics()}
    </div>
  );
}

export default QuizAnalytics;
