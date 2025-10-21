import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (token && role) setUser({ token, role });
        setLoading(false); // ✅ Done initializing
    }, []);

    const login = (token, role) => {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        setUser({ token, role });
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    // 🔧 Wait for token check before rendering children
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 text-gray-600">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
