/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setState({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } catch (e) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setState(prev => ({ ...prev, isLoading: false }));
            }
        } else {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    const login = (token: string, user: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
    };

    const updateUser = (updates: Partial<User>) => {
        setState(prev => {
            if (!prev.user) return prev;
            const updatedUser = { ...prev.user, ...updates };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return { ...prev, user: updatedUser };
        });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
