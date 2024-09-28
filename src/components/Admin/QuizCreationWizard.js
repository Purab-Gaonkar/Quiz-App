// src/components/Admin/QuizCreationWizard.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

function QuizCreationWizard() {
  const [step, setStep] = useState(1);
  const { register, handleSubmit, errors } = useForm();

  const onSubmit = (data) => {
    console.log('Form data:', data);
    // Perform actions based on the current step
    if (step === 1) {
      // Handle step 1 submission
      // For example, save basic quiz information
      console.log('Saving basic quiz information');
      // Move to the next step
      setStep(2);
    } else if (step === 2) {
      // Handle step 2 submission
      // For example, save quiz questions
      console.log('Saving quiz questions');
      // Move to the next step
      setStep(3);
    } else {
      // Final step: submit the entire quiz
      console.log('Submitting entire quiz');
      // Here you would typically send the data to your backend
      // For example:
      // submitQuizToBackend(data);
    }
    // Handle form submission
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {step === 1 && (
        <div>
          <h2>Step 1: Basic Quiz Information</h2>
          <input
            type="text"
            placeholder="Quiz Title"
            {...register("quizTitle", { required: "Quiz title is required" })}
          />
          {errors.quizTitle && <span>{errors.quizTitle.message}</span>}
          <textarea
            placeholder="Quiz Description"
            {...register("quizDescription", { required: "Quiz description is required" })}
          />
          {errors.quizDescription && <span>{errors.quizDescription.message}</span>}
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Step 2: Add Questions</h2>
          {/* Here you would typically map through an array of questions */}
          <input
            type="text"
            placeholder="Question"
            {...register("question", { required: "Question is required" })}
          />
          {errors.question && <span>{errors.question.message}</span>}
          {/* Add more inputs for answer options */}
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Step 3: Review and Submit</h2>
          {/* Display a summary of the quiz here */}
          <p>Review your quiz details before submitting.</p>
        </div>
      )}

      <button type="submit">
        {step < 3 ? "Next" : "Submit Quiz"}
      </button>
    </form>
  );

  // Render multi-step form for quiz creation
}

export default QuizCreationWizard;