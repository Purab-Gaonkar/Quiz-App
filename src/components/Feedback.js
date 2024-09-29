// client/src/components/Feedback.js
import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const Feedback = () => {
    const [feedback, setFeedback] = useState('');
    const [meetingId, setMeetingId] = useState('');
    const [feedbackList, setFeedbackList] = useState([]);

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        await axios.post('/feedback', { feedback, meetingId }, { headers: { Authorization: `Bearer ${token}` } });
        fetchFeedback();
    };

    const fetchFeedback = async () => {
        const response = await axios.get('/feedback');
        setFeedbackList(response.data);
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    return (
        <div>
            <h1>Feedback</h1>
            <form onSubmit={handleSubmitFeedback}>
                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} required />
                <input type="number" placeholder="Meeting ID" value={meetingId} onChange={(e) => setMeetingId(e.target.value)} required />
                <button type="submit">Submit Feedback</button>
            </form>
            <h2>Previous Feedback</h2>
            <ul>
                {feedbackList.map(fb => (
                    <li key={fb.id}>{fb.feedback} (Meeting ID: {fb.meetingId})</li>
                ))}
            </ul>
        </div>
    );
};

export default Feedback;
