import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Achievements() {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await axios.get('/api/user/achievements', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAchievements(response.data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  return (
    <div className="achievements">
      <h2>Your Achievements</h2>
      {achievements.length === 0 ? (
        <p>No achievements yet. Keep taking quizzes to earn badges!</p>
      ) : (
        <ul>
          {achievements.map((achievement) => (
            <li key={achievement.id}>
              <img src={achievement.icon} alt={achievement.name} />
              <h3>{achievement.name}</h3>
              <p>{achievement.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Achievements;