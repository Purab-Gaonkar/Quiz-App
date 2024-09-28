# Quiz Application

## Description
This is a full-stack quiz application built with React for the frontend and Node.js with Express for the backend. It allows users to take quizzes, view their results, and provides an admin interface for managing quizzes and users.

## Features
- User Authentication (Login/Register)
- Admin and User roles
- Quiz taking functionality
- Real-time scoring
- Admin dashboard for managing quizzes and users
- User dashboard to view past quiz results and available quizzes

## Technologies Used
- Frontend: React, React Router, Axios
- Backend: Node.js, Express
- Database: MySQL
- Authentication: JSON Web Tokens (JWT)

## Installation

### Prerequisites
- Node.js
- MySQL

### Steps
1. Clone the repository
   ```
   git clone https://github.com/Purab-Gaonkar/Quiz-App
   cd quiz-application
   ```

2. Install dependencies for both frontend and backend
   ```
   cd client
   npm install
   cd ../server
   npm install
   ```

3. Set up the database
   - Create a MySQL database named `quiz_app`
   - Import the schema from `database/schema.sql`

4. Configure environment variables
   - Create a `.env` file in the server directory
   - Add the following variables:
     ```
     DB_HOST=localhost
     DB_USER=your_mysql_username
     DB_PASSWORD=your_mysql_password
     DB_NAME=quiz_app
     JWT_SECRET=your_jwt_secret
     ```

5. Start the server
   ```
   cd server
   npm start
   ```

6. Start the client
   ```
   cd client
   npm start
   ```

7. Access the application at `http://localhost:3000`

## Usage
- Register a new account or log in with existing credentials
- Admin users can access the admin dashboard to manage quizzes and users
- Regular users can take quizzes and view their results

## API Endpoints
- POST /api/login - User login
- POST /api/register - User registration
- GET /api/quizzes - Get all quizzes
- POST /api/quizzes - Create a new quiz (Admin only)
- GET /api/quizzes/:id - Get a specific quiz
- POST /api/quizzes/:id/submit - Submit a quiz attempt
- GET /api/user/profile - Get user profile
- PUT /api/user/profile - Update user profile

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License.
