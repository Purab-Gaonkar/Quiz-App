// client/src/components/Profile.js
import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig';

const Profile = () => {
    const [profile, setProfile] = useState({ name: '', interests: '' });
    const [error, setError] = useState('');

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get('/profile', { headers: { Authorization: `Bearer ${token}` } });
        setProfile(response.data);
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.put('/profile', profile, { headers: { Authorization: `Bearer ${token}` } });
            // Refresh the profile
            fetchProfile();
        } catch (err) {
            setError('Error updating profile');
        }
    };

    return (
        <div>
            <h1>Profile</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleUpdate}>
                <input type="text" placeholder="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
                <input type="text" placeholder="Interests" value={profile.interests} onChange={(e) => setProfile({ ...profile, interests: e.target.value })} />
                <button type="submit">Update Profile</button>
            </form>
        </div>
    );
};

export default Profile;
