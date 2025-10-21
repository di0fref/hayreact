import React, {useEffect, useState, useContext} from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate,
    useParams,
    Navigate,
} from "react-router-dom";
import {AuthContext} from "../AuthContext";
import AddDeliveryForm from "../components/AddDeliveryForm";
import DeliveryList from "../components/DeliveryList";
import ReportModal from "../components/ReportModal"; // adjust path if needed


export default function DeliveriesPage({
                            loadDeliveries,
                            deliveries,
                            addDelivery,
                            form,
                            setForm,
                            uploadInvoice,
                            deleteInvoice,
                            updateDelivery,
                        }) {
    const navigate = useNavigate();
    const {user} = useContext(AuthContext);
    const [showReport, setShowReport] = useState(false);

    const savePaid = async (id, paid) => {
        await updateDelivery(id, {paid});
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-semibold text-gray-800">
                        Hay Bale Deliveries
                    </h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowReport(true)}
                            className="text-sm bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:bg-gray-100 transition"
                        >
                            📊 Rapport
                        </button>
                        {user?.role === "admin" && (
                            <button
                                onClick={() => navigate("/users")}
                                className="bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:bg-gray-100 transition text-sm"
                            >
                                Manage Users
                            </button>
                        )}
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = "/login";
                            }}
                            className="text-sm bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:bg-gray-100 transition"
                        >
                            Logout
                        </button>


                        <ReportModal isOpen={showReport} onClose={() => setShowReport(false)} />


                    </div>
                </div>

                {user?.role === "admin" && (
                    <AddDeliveryForm form={form} setForm={setForm} onAdd={addDelivery}/>
                )}

                <DeliveryList
                    deliveries={deliveries}
                    onView={(id) => navigate(`/delivery/${id}`)}
                    onUpload={uploadInvoice}
                    onDelete={deleteInvoice}
                    onSavePaid={savePaid}
                />
            </div>
        </div>
    );
}