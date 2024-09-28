const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'quiz_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'your-secret-key-here';
  }

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.sendStatus(403);
      }

      console.log('Authenticated user:', user);
      req.user = user;
      next();
    });
  } else {
    console.log('No authorization header');
    res.sendStatus(401);
  }
};

// Add this middleware function
const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      'INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)',
      [username, hashedPassword, isAdmin]
    );
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);
    
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (users.length === 0) {
      console.log('User not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    console.log('User found:', user);
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log('Password mismatch for user:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, isAdmin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('Login successful for user:', username, 'Is Admin:', user.is_admin);
    res.json({ token, isAdmin: user.is_admin });
  } catch (error) {
    console.error('Error in login route:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Quiz routes
app.post('/api/quizzes', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { title, questions, time_limit } = req.body;
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    const [quizResult] = await connection.query(
      'INSERT INTO quizzes (title, time_limit) VALUES (?, ?)',
      [title, time_limit]
    );
    const quizId = quizResult.insertId;

    for (const question of questions) {
      const [questionResult] = await connection.query(
        'INSERT INTO questions (quiz_id, question_text) VALUES (?, ?)',
        [quizId, question.question_text]
      );
      const questionId = questionResult.insertId;

      for (let i = 0; i < question.options.length; i++) {
        await connection.query(
          'INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)',
          [questionId, question.options[i], i === question.correctAnswer]
        );
      }
    }

    await connection.commit();
    connection.release();

    res.status(201).json({ message: 'Quiz created successfully', quizId });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Error creating quiz' });
  }
});

app.get('/api/quizzes', authenticateJWT, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM quizzes');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Error fetching quizzes' });
  }
});

app.get('/api/quizzes/:id', authenticateJWT, async (req, res) => {
  try {
    const [quizRows] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [req.params.id]);
    if (quizRows.length === 0) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const quiz = quizRows[0];
    const [questionRows] = await pool.query('SELECT * FROM questions WHERE quiz_id = ?', [quiz.id]);
    const questions = await Promise.all(questionRows.map(async (question) => {
      const [optionRows] = await pool.query('SELECT id, option_text, is_correct FROM options WHERE question_id = ?', [question.id]);
      return { ...question, options: optionRows };
    }));

    res.json({ ...quiz, questions });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Error fetching quiz' });
  }
});

app.post('/api/quizzes/:id/submit', authenticateJWT, async (req, res) => {
  try {
    const { answers } = req.body;
    const quizId = req.params.id;
    const userId = req.user.id; // Make sure this is correct

    console.log('Quiz submission attempt:', { quizId, userId, answers });

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    let score = 0;
    const totalQuestions = answers.length;

    for (const answer of answers) {
      const [correctOption] = await connection.query(
        'SELECT id FROM options WHERE question_id = ? AND is_correct = 1',
        [answer.questionId]
      );

      if (correctOption.length === 0) {
        throw new Error(`No correct option found for question ${answer.questionId}`);
      }

      const isCorrect = correctOption[0].id === answer.selectedOptionId;
      if (isCorrect) score++;

      await connection.query(
        'INSERT INTO user_answers (user_id, quiz_id, question_id, selected_option_id) VALUES (?, ?, ?, ?)',
        [userId, quizId, answer.questionId, answer.selectedOptionId]
      );
    }

    const scorePercentage = (score / totalQuestions) * 100;

    await connection.query(
      'INSERT INTO quiz_results (user_id, quiz_id, score, total_questions) VALUES (?, ?, ?, ?)',
      [userId, quizId, scorePercentage, totalQuestions]
    );

    await connection.commit();
    connection.release();

    console.log('Quiz submitted successfully:', { quizId, userId, score: scorePercentage });
    res.status(201).json({ message: 'Quiz submitted successfully', score: scorePercentage });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Error submitting quiz', error: error.message });
  }
});

app.get('/api/quizzes/:id/results', authenticateJWT, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const [results] = await pool.query(
      'SELECT users.username, quiz_results.score, quiz_results.total_questions, quiz_results.created_at ' +
      'FROM quiz_results ' +
      'JOIN users ON quiz_results.user_id = users.id ' +
      'WHERE quiz_results.quiz_id = ?',
      [req.params.id]
    );

    res.json(results);
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ message: 'Error fetching quiz results' });
  }
});

app.delete('/api/quizzes/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.query('DELETE FROM user_answers WHERE quiz_id = ?', [req.params.id]);
    await connection.query('DELETE FROM options WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ?)', [req.params.id]);
    await connection.query('DELETE FROM questions WHERE quiz_id = ?', [req.params.id]);
    await connection.query('DELETE FROM quizzes WHERE id = ?', [req.params.id]);

    await connection.commit();
    connection.release();

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Error deleting quiz' });
  }
});

app.post('/api/logout', (req, res) => {
  // In a real application, you might want to invalidate the token
  res.json({ message: 'Logged out successfully' });
});

// Achievements route
app.get('/api/user/achievements', authenticateJWT, async (req, res) => {
  try {
    const [achievements] = await pool.query(
      'SELECT * FROM achievements WHERE user_id = ?',
      [req.user.id]
    );
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ message: 'Error fetching achievements' });
  }
});

// User profile routes
app.get('/api/user/profile', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT id, username, email, bio, created_at FROM users WHERE id = ?', [userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle null values
    const user = rows[0];
    user.email = user.email || '';
    user.bio = user.bio || '';

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/user/profile', authenticateJWT, async (req, res) => {
  const { username, email, bio } = req.body;
  try {
    await pool.query(
      'UPDATE users SET username = ?, email = ?, bio = ? WHERE id = ?',
      [username, email, bio, req.user.id]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));