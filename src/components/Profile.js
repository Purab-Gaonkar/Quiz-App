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
            fetchProfile();
        } catch (err) {
            setError('Error updating profile');
        }
    };

    // Inline styles
    const styles = {
        container: {
            maxWidth: '500px',
            margin: '2rem auto',
            padding: '1.5rem',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#f9f9f9',
        },
        header: {
            textAlign: 'center',
            color: '#333',
        },
        errorMessage: {
            color: 'red',
            textAlign: 'center',
            marginBottom: '1rem',
        },
        input: {
            padding: '10px',
            margin: '0.5rem 0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
            width: '100%', // Ensure full width
        },
        button: {
            padding: '10px',
            marginTop: '1rem',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#007bff',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%', // Ensure full width
        },
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Profile</h1>
            {error && <p style={styles.errorMessage}>{error}</p>}
            <form onSubmit={handleUpdate}>
                <input 
                    type="text" 
                    placeholder="Name" 
                    value={profile.name} 
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })} 
                    required 
                    style={styles.input}
                />
                <input 
                    type="text" 
                    placeholder="Interests" 
                    value={profile.interests} 
                    onChange={(e) => setProfile({ ...profile, interests: e.target.value })} 
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Update Profile</button>
            </form>
        </div>
    );
};

export default Profile;
