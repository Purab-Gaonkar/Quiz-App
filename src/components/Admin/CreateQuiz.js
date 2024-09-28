import React, { useState } from 'react';
import axios from 'axios';

function CreateQuiz({ onQuizCreated }) {
  const [quizData, setQuizData] = useState({
    title: '',
    questions: [{ question_text: '', options: ['', '', '', ''], correctAnswer: 0 }],
    time_limit: 60,
  });

  const handleQuizDataChange = (e) => {
    const { name, value } = e.target;
    setQuizData({ ...quizData, [name]: value });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[index][field] = value;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, { question_text: '', options: ['', '', '', ''], correctAnswer: 0 }],
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = [...quizData.questions];
    newQuestions.splice(index, 1);
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/quizzes', quizData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Quiz created successfully!');
      onQuizCreated();
      setQuizData({
        title: '',
        questions: [{ question_text: '', options: ['', '', '', ''], correctAnswer: 0 }],
        time_limit: 60,
      });
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Quiz Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={quizData.title}
          onChange={handleQuizDataChange}
          required
        />
      </div>
      <div>
        <label htmlFor="time_limit">Time Limit (seconds):</label>
        <input
          type="number"
          id="time_limit"
          name="time_limit"
          value={quizData.time_limit}
          onChange={handleQuizDataChange}
          required
        />
      </div>
      {quizData.questions.map((question, questionIndex) => (
        <div key={questionIndex}>
          <h3>Question {questionIndex + 1}</h3>
          <input
            type="text"
            value={question.question_text}
            onChange={(e) => handleQuestionChange(questionIndex, 'question_text', e.target.value)}
            placeholder="Enter question"
            required
          />
          {question.options.map((option, optionIndex) => (
            <div key={optionIndex}>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                placeholder={`Option ${optionIndex + 1}`}
                required
              />
              <input
                type="radio"
                name={`correctAnswer-${questionIndex}`}
                checked={question.correctAnswer === optionIndex}
                onChange={() => handleQuestionChange(questionIndex, 'correctAnswer', optionIndex)}
                required
              />
            </div>
          ))}
          <button type="button" onClick={() => removeQuestion(questionIndex)}>Remove Question</button>
        </div>
      ))}
      <button type="button" onClick={addQuestion}>Add Question</button>
      <button type="submit">Create Quiz</button>
    </form>
  );
}

export default CreateQuiz;