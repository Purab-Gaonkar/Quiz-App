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
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Delete related records in order
    await connection.query('DELETE FROM user_answers WHERE quiz_id = ?', [id]);
    await connection.query('DELETE FROM quiz_results WHERE quiz_id = ?', [id]);
    await connection.query('DELETE FROM options WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ?)', [id]);
    await connection.query('DELETE FROM questions WHERE quiz_id = ?', [id]);
    
    // Finally, delete the quiz
    await connection.query('DELETE FROM quizzes WHERE id = ?', [id]);

    await connection.commit();
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Detailed error deleting quiz:', error);
    res.status(500).json({ message: 'Error deleting quiz', error: error.message, stack: error.stack });
  } finally {
    connection.release();
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
    const [rows] = await pool.query('SELECT username, email, bio FROM users WHERE id = ?', [req.user.id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

app.put('/api/user/profile', authenticateJWT, async (req, res) => {
  const { email, bio } = req.body;
  try {
    await pool.query('UPDATE users SET email = ?, bio = ? WHERE id = ?', [email, bio, req.user.id]);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
});

app.put('/api/quizzes/:id', authenticateJWT, isAdmin, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { title, time_limit, questions } = req.body;
    
    // Update the quiz
    await connection.query('UPDATE quizzes SET title = ?, time_limit = ? WHERE id = ?', [title, time_limit, id]);
    
    // Get existing questions
    const [existingQuestions] = await connection.query('SELECT id FROM questions WHERE quiz_id = ?', [id]);
    const existingQuestionIds = existingQuestions.map(q => q.id);

    for (const question of questions) {
      if (question.id) {
        // Update existing question
        await connection.query('UPDATE questions SET question_text = ? WHERE id = ?', [question.question_text, question.id]);
        
        // Get existing options
        const [existingOptions] = await connection.query('SELECT id FROM options WHERE question_id = ?', [question.id]);
        const existingOptionIds = existingOptions.map(o => o.id);

        for (let i = 0; i < question.options.length; i++) {
          if (question.options[i].id) {
            // Update existing option
            await connection.query('UPDATE options SET option_text = ?, is_correct = ? WHERE id = ?', 
              [question.options[i].text, i === question.correctAnswer, question.options[i].id]);
          } else {
            // Add new option
            await connection.query('INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)', 
              [question.id, question.options[i].text, i === question.correctAnswer]);
          }
        }

        // Remove options that no longer exist
        const updatedOptionIds = question.options.filter(o => o.id).map(o => o.id);
        const optionsToRemove = existingOptionIds.filter(id => !updatedOptionIds.includes(id));
        if (optionsToRemove.length > 0) {
          await connection.query('UPDATE user_answers SET selected_option_id = NULL WHERE selected_option_id IN (?)', [optionsToRemove]);
          await connection.query('DELETE FROM options WHERE id IN (?)', [optionsToRemove]);
        }
      } else {
        // Add new question
        const [questionResult] = await connection.query('INSERT INTO questions (quiz_id, question_text) VALUES (?, ?)', [id, question.question_text]);
        const newQuestionId = questionResult.insertId;

        for (let i = 0; i < question.options.length; i++) {
          await connection.query('INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)', 
            [newQuestionId, question.options[i].text, i === question.correctAnswer]);
        }
      }
    }

    // Remove questions that no longer exist
    const updatedQuestionIds = questions.filter(q => q.id).map(q => q.id);
    const questionsToRemove = existingQuestionIds.filter(id => !updatedQuestionIds.includes(id));
    if (questionsToRemove.length > 0) {
      await connection.query('UPDATE user_answers SET question_id = NULL WHERE question_id IN (?)', [questionsToRemove]);
      await connection.query('DELETE FROM options WHERE question_id IN (?)', [questionsToRemove]);
      await connection.query('DELETE FROM questions WHERE id IN (?)', [questionsToRemove]);
    }

    await connection.commit();
    res.json({ message: 'Quiz updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating quiz:', error);
    res.status(500).json({ message: 'Error updating quiz', error: error.message });
  } finally {
    connection.release();
  }
});

app.get('/api/user/quiz-scores', authenticateJWT, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT q.title as quiz_title, qr.score
      FROM quiz_results qr
      JOIN quizzes q ON qr.quiz_id = q.id
      WHERE qr.user_id = ?
      ORDER BY qr.created_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching quiz scores:', error);
    res.status(500).json({ message: 'Error fetching quiz scores' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));