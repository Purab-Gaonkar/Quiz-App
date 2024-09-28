import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Timer from '../shared/Timer';
import QuizResults from './QuizResults';

function TakeQuiz() {
  const { id: quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setQuiz(response.data);
        setTimeRemaining(response.data.time_limit);
        setUserAnswers(new Array(response.data.questions.length).fill(null));
        setError(null);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Failed to fetch quiz. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleAnswer = (answerIndex) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`/api/quizzes/${quizId}/submit`, {
        answers: userAnswers.map((answer, index) => ({
          questionId: quiz.questions[index].id,
          selectedOptionId: quiz.questions[index].options[answer].id,
        })),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setScore(response.data.score);
      setQuizSubmitted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!quiz) return null;

  if (quizSubmitted) {
    return <QuizResults quiz={quiz} userAnswers={userAnswers} score={score} />;
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div>
      <h2>{quiz.title}</h2>
      <Timer initialTime={timeRemaining} onTimeUp={handleSubmit} />
      <h3>Question {currentQuestion + 1} of {quiz.questions.length}</h3>
      <p>{question.question_text}</p>
      <ul>
        {question.options.map((option, index) => (
          <li key={option.id}>
            <button
              onClick={() => handleAnswer(index)}
              style={{ fontWeight: userAnswers[currentQuestion] === index ? 'bold' : 'normal' }}
            >
              {option.option_text}
            </button>
          </li>
        ))}
      </ul>
      <button onClick={handleNextQuestion}>
        {currentQuestion < quiz.questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
      </button>
    </div>
  );
}

export default TakeQuiz;