import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Timer from '../shared/Timer';
import QuizResults from './QuizResults';
import '../shared/Quiz.css';

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
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

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

  const handleAnswer = (index) => {
    setSelectedOption(index);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = index;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    try {
      setLoadingSubmit(true);
      
      // Map user answers to question and corresponding option IDs
      const answers = userAnswers.map((answer, index) => {
        // Only include answers where a selection has been made
        if (answer !== null) {
          return {
            questionId: quiz.questions[index].id,
            selectedOptionId: quiz.questions[index].options[answer].id // Use the ID of the selected option
          };
        }
        return null; // Return null for unanswered questions
      }).filter(answer => answer !== null); // Filter out nulls
  
      if (answers.length === 0) {
        throw new Error("No valid answers selected.");
      }
  
      console.log('Submitting answers:', answers);
  
      const response = await axios.post(`/api/quizzes/${quizId}/submit`, { answers }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
  
      setScore(response.data.score);
      setQuizSubmitted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error.response ? error.response.data : error.message);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setLoadingSubmit(false);
    }
  };
  
  

  const handleNextQuestion = () => {
    setSelectedOption(null);
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!quiz) return <div>Quiz not found</div>;

  if (quizSubmitted) {
    return <QuizResults quiz={quiz} userAnswers={userAnswers} score={score} />;
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="quiz-container">
      <h2>{quiz.title}</h2>
      <div className="timer">
        <Timer initialTime={timeRemaining} onTimeUp={handleSubmit} />
      </div>
      <h3>Question {currentQuestion + 1} of {quiz.questions.length}</h3>
      <p className="quiz-question">{question.question_text}</p>
      <div className="quiz-options">
        {question.options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => handleAnswer(index)}
            className={`quiz-option ${selectedOption === index ? 'selected' : ''}`}
          >
            {option.option_text}
          </button>
        ))}
      </div>
      <div className="quiz-nav">
        <button onClick={handleNextQuestion}>
          {currentQuestion < quiz.questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
        </button>
      </div>
    </div>
  );
}

export default TakeQuiz;