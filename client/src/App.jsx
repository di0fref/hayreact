import React, {useEffect, useState, useContext} from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate,
    useParams,
    Navigate,
} from "react-router-dom";


import {API} from "./components/utils";

import {AuthProvider, AuthContext} from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./pages/Login";
import BalesPage from "./pages/BalesPage";
import DeliveriesPage from "./pages/DeliveriesPage";
import UsersPage from "./pages/UsersPage";


// ----------------------
// Main App Component
// ----------------------
export default function App() {
    const [deliveries, setDeliveries] = useState([]);
    const [form, setForm] = useState({date: "", supplier: "", bales: ""});

    const loadDeliveries = async () => {
        const res = await fetch(`${API}/deliveries`);
        setDeliveries(await res.json());
    };

    useEffect(() => {
        loadDeliveries();
    }, []);

    const addDelivery = async () => {
        if (!form.date || !form.supplier || !form.bales) return;
        await fetch(`${API}/deliveries`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(form),
        });
        setForm({date: "", supplier: "", bales: ""});
        await loadDeliveries();
    };

    const updateDelivery = async (id, data) => {
        await fetch(`${API}/deliveries/${id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        });
        await loadDeliveries();
    };

    const uploadInvoice = async (deliveryId, file) => {
        const formData = new FormData();
        formData.append("file", file);
        await fetch(`${API}/invoice/${deliveryId}`, {method: "POST", body: formData});
        await loadDeliveries();
    };

    const deleteInvoice = async (deliveryId) => {
        await fetch(`${API}/invoice/${deliveryId}`, {method: "DELETE"});
        await loadDeliveries();
    };

    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <DeliveriesPage
                                    loadDeliveries={loadDeliveries}
                                    deliveries={deliveries}
                                    addDelivery={addDelivery}
                                    form={form}
                                    setForm={setForm}
                                    uploadInvoice={uploadInvoice}
                                    deleteInvoice={deleteInvoice}
                                    updateDelivery={updateDelivery}
                                />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/delivery/:id"
                        element={
                            <ProtectedRoute>
                                <BalesPage
                                    deliveries={deliveries}
                                    loadDeliveries={loadDeliveries}
                                    updateDelivery={updateDelivery}
                                    uploadInvoice={uploadInvoice}
                                    deleteInvoice={deleteInvoice}
                                />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute adminOnly>
                                <UsersPage/>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/"/>}/>
                </Routes>
            </Router>
        </AuthProvider>
    );
}
