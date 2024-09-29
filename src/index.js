// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Use 'react-dom/client' instead
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')); // Create root using createRoot
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
