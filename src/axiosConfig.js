// src/axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api', // Your API URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add the Authorization header with the token
axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('token'); // Assuming the token is stored here
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;
