// client/src/components/MeetingScheduler.js
import React, { useState } from 'react';
import axios from '../axiosConfig';

const MeetingScheduler = () => {
    const [date, setDate] = useState('');
    const [mentorId, setMentorId] = useState('');
    const [menteeId, setMenteeId] = useState('');

    const handleSchedule = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        await axios.post('/meetings', { date, mentorId, menteeId }, { headers: { Authorization: `Bearer ${token}` } });
        // Refresh meetings or provide feedback
        window.location.href = '/dashboard';
    };

    return (
        <div>
            <h1>Schedule Meeting</h1>
            <form onSubmit={handleSchedule}>
                <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
                <input type="number" placeholder="Mentor ID" value={mentorId} onChange={(e) => setMentorId(e.target.value)} required />
                <input type="number" placeholder="Mentee ID" value={menteeId} onChange={(e) => setMenteeId(e.target.value)} required />
                <button type="submit">Schedule</button>
            </form>
        </div>
    );
};

export default MeetingScheduler;
