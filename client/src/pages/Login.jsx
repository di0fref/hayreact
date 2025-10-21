import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { API } from "../components/utils";

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");

    const handleLogin = async () => {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (!res.ok) return setError("Invalid credentials");
        const data = await res.json();
        const { token } = data;
        const payload = JSON.parse(atob(token.split(".")[1]));
        login(token, payload.role);
        navigate("/");
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="bg-white shadow-md rounded-2xl p-8 w-80 border border-gray-200">
                <h1 className="text-2xl font-semibold mb-4 text-center">Login</h1>
                <input
                    type="text"
                    placeholder="Username"
                    className="w-full mb-3 border border-gray-300 rounded-full px-4 py-2"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-3 border border-gray-300 rounded-full px-4 py-2"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white rounded-full py-2 hover:bg-blue-700 transition"
                >
                    Login
                </button>
            </div>
        </div>
    );
}
