// src/components/MeetingPortal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MeetingPortal = () => {
    const [meetings, setMeetings] = useState([]);
    const [date, setDate] = useState('');
    const [mentorId, setMentorId] = useState('');
    const [menteeId, setMenteeId] = useState('');
    const [error, setError] = useState('');

    // Fetch meetings when the component mounts
    useEffect(() => {
        fetchMeetings();
    }, []);
    
    const fetchMeetings = async () => {
        const token = localStorage.getItem('token'); // Retrieve the token
        try {
            const response = await axios.get('http://localhost:5000/api/meetings', { // Change to port 5000
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the request
                },
            });
            setMeetings(response.data);
        } catch (error) {
            console.error('Error fetching meetings', error);
        }
    };
    
    const handleAddMeeting = async () => {
        const token = localStorage.getItem('token'); // Retrieve the token
        try {
            const response = await axios.post('http://localhost:5000/api/meetings', { date, mentorId, menteeId }, { // Change to port 5000
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the request
                },
            });
            if (response.status === 201) {
                fetchMeetings(); // Refresh the meeting list after adding a new one
                clearForm();
            }
        } catch (error) {
            console.error('Error scheduling meeting', error);
        }
    };
    
    
    const clearForm = () => {
        setDate('');
        setMentorId('');
        setMenteeId('');
        setError(''); // Clear any previous errors
    };

    return (
        <div>
            <h1>Meeting Portal</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message if any */}
            <h2>Add a New Meeting</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddMeeting(); }}>
                <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Mentor ID"
                    value={mentorId}
                    onChange={(e) => setMentorId(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Mentee ID"
                    value={menteeId}
                    onChange={(e) => setMenteeId(e.target.value)}
                    required
                />
                <button type="submit">Add Meeting</button>
            </form>
            <h2>Scheduled Meetings</h2>
            <ul>
                {meetings.length > 0 ? meetings.map((meeting) => (
                    <li key={meeting.id}>
                        {new Date(meeting.date).toLocaleString()} - Mentor ID: {meeting.mentorId}, Mentee ID: {meeting.menteeId}
                    </li>
                )) : <li>No meetings scheduled.</li>}
            </ul>
        </div>
    );
};

export default MeetingPortal;
