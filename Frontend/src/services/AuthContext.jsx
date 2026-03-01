import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error('Failed to restore user session:', error);
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (role, credentials) => {
        // Handle admin login locally — no backend needed
        if (role === 'ADMIN') {
            const userObj = credentials; // passed directly as { name, id, role }
            setUser(userObj);
            localStorage.setItem('user', JSON.stringify(userObj));
            return userObj;
        }

        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        const userData = await response.json();
        const userObj = { ...userData };
        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
        return userObj;
    };

    const signup = async (userData) => {
        const response = await fetch('http://localhost:8080/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Signup failed');
        }

        const data = await response.json();
        return data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
