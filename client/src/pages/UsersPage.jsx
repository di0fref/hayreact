// ----------------------
// Users Page (Admin)
// ----------------------
import {API} from "../components/utils";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../AuthContext";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({username: "", password: "", role: "user"});
    const {user} = useContext(AuthContext);

    const loadUsers = async () => {
        const res = await fetch(`${API}/users`, {
            headers: {Authorization: `Bearer ${user.token}`},
        });
        setUsers(await res.json());
    };

    const addUser = async () => {
        await fetch(`${API}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify(form),
        });
        setForm({username: "", password: "", role: "user"});
        await loadUsers();
    };

    const deleteUser = async (id) => {
        await fetch(`${API}/users/${id}`, {
            method: "DELETE",
            headers: {Authorization: `Bearer ${user.token}`},
        });
        await loadUsers();
    };

    useEffect(() => {
        loadUsers();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-semibold text-gray-800">User Management</h1>
                    <button
                        onClick={() => (window.location.href = "/")}
                        className="text-sm bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:bg-gray-100 transition"
                    >
                        ← Back
                    </button>
                </div>

                {/* Add User */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-wrap gap-4">
                    <input
                        type="text"
                        placeholder="Username"
                        className="border border-gray-300 rounded-full px-4 py-2"
                        value={form.username}
                        onChange={(e) => setForm({...form, username: e.target.value})}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="border border-gray-300 rounded-full px-4 py-2"
                        value={form.password}
                        onChange={(e) => setForm({...form, password: e.target.value})}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="border border-gray-300 rounded-full px-4 py-2"
                        value={form.email || ""}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />

                    <select
                        className="border border-gray-300 rounded-full px-4 py-2"
                        value={form.role}
                        onChange={(e) => setForm({...form, role: e.target.value})}
                    >
                        <option value="user">Regular</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button
                        onClick={addUser}
                        className="bg-blue-600 text-white rounded-full px-6 py-2 hover:bg-blue-700 transition"
                    >
                        Add User
                    </button>
                </div>

                {/* Users Table */}
                <div className="bg-white shadow-md rounded-2xl border border-gray-100 overflow-x-auto">
                    <table className="min-w-full text-base">
                        <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left">Username</th>
                            <th className="px-4 py-3 text-left">Role</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td className="px-4 py-3">{u.username}</td>
                                <td className="px-4 py-3 capitalize">{u.role}</td>
                                <td className="px-4 py-3">{u.email || "—"}</td>

                                <td className="px-4 py-3 text-center">
                                    {u.username !== "admin" && (
                                        <button
                                            onClick={() => deleteUser(u.id)}
                                            className="text-gray-400 hover:text-red-600"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </td>

                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
