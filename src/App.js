import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminPortal from './components/Admin/AdminPortal';
import UserPortal from './components/User/UserPortal';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './components/Home';
import Navbar from './components/shared/Navbar';
import PrivateRoute from './components/Auth/PrivateRoute';
import UserDashboard from './components/User/UserDashboard';
import TakeQuiz from './components/User/TakeQuiz';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/admin/*" 
          element={
            <PrivateRoute adminOnly={true}>
              <AdminPortal />
            </PrivateRoute>
          } 
        />
        <Route path="/user/*" element={<UserDashboard />} />
        <Route path="/user/take-quiz/:id" element={<TakeQuiz />} />
      </Routes>
    </Router>
  );
}

export default App;