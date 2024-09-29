import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig';

const Dashboard = () => {
    const [meetings, setMeetings] = useState([]);

    const fetchMeetings = async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get('/meetings', { headers: { Authorization: `Bearer ${token}` } });
        setMeetings(response.data);
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
            <h2>Your Meetings</h2>
            <ul>
                {meetings.map(meeting => (
                    <li key={meeting.id}>{meeting.date} - Mentor ID: {meeting.mentorId} - Mentee ID: {meeting.menteeId}</li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;
