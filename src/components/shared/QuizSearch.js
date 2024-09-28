// src/components/shared/QuizSearch.js
import React, { useState } from 'react';

function QuizSearch({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search quizzes..."
      />
      <button type="submit">Search</button>
    </form>
  );
}

export default QuizSearch;