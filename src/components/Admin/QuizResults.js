import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './QuizResult.css'; // Import the CSS file

function QuizResults() {
  const { id: quizId } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(`/api/quizzes/${quizId}/results`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setResults(response.data);
      } catch (error) {
        console.error('Error fetching quiz results:', error);
        setError('Failed to fetch quiz results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="container">
      <h2>Quiz Results</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Score</th>
            <th>Total Questions</th>
            <th>Date Taken</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => {
            const score = parseFloat(result.score); // Ensure score is a number
            const formattedScore = !isNaN(score) ? score.toFixed(2) : 'N/A';

            return (
              <tr key={index}>
                <td>{result.username}</td>
                <td>{formattedScore}%</td>
                <td>{result.total_questions}</td>
                <td>{new Date(result.created_at).toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default QuizResults;
