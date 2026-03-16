import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';


// React Context is like a variable that any component in the app can read from or write to
const AuthContext = createContext(null)  //creates a "container" that will hold global auth state

export function AuthProvider({ children }) {  //AuthProvider is a wrapper compnent, any component inside it can access the auth state, the whole app will be wrapped with it
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true) 

    // On app load, check if a token exists and restore the session. if a token exists it calls /api/auth/me
    useEffect(() => {
        const token = localStorage.getItem('streeteats_token')
        if (!token) {
            setLoading(false)
            return
        }
        authAPI.me()
            .then(res => setUser(res.data))
            .catch(() => localStorage.removeItem('streeteats_token'))
            .finally(() => setLoading(false))
    }, [])

    const login = async (email, password) => {
        const res = await authAPI.login(email, password)
        localStorage.setItem('streeteats_token', res.data.access_token)
        setUser(res.data.user)
        return res.data.user
    }

    const register = async (email, username, password) => {
        const res = await authAPI.register(email, username, password)
        localStorage.setItem('streeteats_token', res.data.access_token)
        setUser(res.data.user)
        return res.data.user
    }

    const logout = () => {
        localStorage.removeItem('streeteats_token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user,loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook so components can easily access auth with useAuth() instead of useContext(AuthContext)
export const useAuth = () => useContext(AuthContext)
