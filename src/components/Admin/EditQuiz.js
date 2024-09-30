import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditQuiz.css';


function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState({
    title: '',
    time_limit: 0,
    questions: []
  });

  useEffect(() => {
    fetchQuizData();
  }, [id]);

  const fetchQuizData = async () => {
    try {
      const response = await axios.get(`/api/quizzes/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Transform the data to ensure it's in the correct format
      const formattedData = {
        ...response.data,
        questions: response.data.questions.map(question => ({
          ...question,
          options: question.options.map(option => ({
            id: option.id,
            text: option.option_text, // Ensure we're using the correct property name
            is_correct: option.is_correct
          })),
          correctAnswer: question.options.findIndex(option => option.is_correct)
        }))
      };
      setQuizData(formattedData);
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    }
  };

  const handleQuizDataChange = (e) => {
    setQuizData({ ...quizData, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index][field] = value;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].options[optionIndex].text = value;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].correctAnswer = optionIndex;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, { question_text: '', options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }], correctAnswer: 0 }]
    });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format the data before sending
      const formattedData = {
        ...quizData,
        questions: quizData.questions.map(question => ({
          ...question,
          options: question.options.map((option, index) => ({
            ...option,
            text: option.text || '', // Ensure option text is never null
            is_correct: index === question.correctAnswer
          }))
        }))
      };

      await axios.put(`/api/quizzes/${id}`, formattedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate('/admin');
    } catch (error) {
      console.error('Error updating quiz:', error.response?.data || error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Edit Quiz</h1>
      <div>
        <label>Title:</label>
        <input
          type="text"
          name="title"
          value={quizData.title}
          onChange={handleQuizDataChange}
        />
      </div>
      <div>
        <label>Time Limit (seconds):</label>
        <input
          type="number"
          name="time_limit"
          value={quizData.time_limit}
          onChange={handleQuizDataChange}
        />
      </div>
      {quizData.questions.map((question, questionIndex) => (
        <div key={questionIndex} className="question-container">
          <input
            type="text"
            placeholder="Question text"
            value={question.question_text}
            onChange={(e) => handleQuestionChange(questionIndex, 'question_text', e.target.value)}
          />
          <div className="options">
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex}>
                <input
                  type="text"
                  placeholder={`Option ${optionIndex + 1}`}
                  value={option.text}
                  onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                />
                <input
                  type="radio"
                  checked={question.correctAnswer === optionIndex}
                  onChange={() => handleCorrectAnswerChange(questionIndex, optionIndex)}
                />
              </div>
            ))}
          </div>
          <button type="button" onClick={() => removeQuestion(questionIndex)}>Remove Question</button>
        </div>
      ))}
      <button type="button" onClick={addQuestion}>Add Question</button>
      <button type="submit">Save Changes</button>
    </form>
  );  
}

export default EditQuiz;
