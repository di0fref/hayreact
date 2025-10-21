// ----------------------
// Bales Page
// ----------------------
import React, {useEffect, useState, useContext} from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate,
    useParams,
    Navigate,
} from "react-router-dom";
import {API} from "../components/utils";
import DeliverySummary from "../components/DeliverySummary";
import BaleTable from "../components/BaleTable";

export default function BalesPage({
                       deliveries,
                       loadDeliveries,
                       updateDelivery,
                       uploadInvoice,
                       deleteInvoice,
                   }) {
    const {id} = useParams();
    const navigate = useNavigate();
    const [bales, setBales] = useState([]);
    const [editDeliveryField, setEditDeliveryField] = useState(null);

    const delivery = deliveries.find((d) => d.id === Number(id));

    const fetchBales = async () => {
        const res = await fetch(`${API}/bales/${id}`);
        setBales(await res.json());
    };

    const saveDeliveryEdit = async (field, value) => {
        await updateDelivery(delivery.id, {[field]: value});
        setEditDeliveryField(null);
        await loadDeliveries();
    };

    useEffect(() => {
        fetchBales();
    }, [id]);

    return (
        <div className="bg-gray-50 min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-semibold text-gray-800">Bales</h1>
                    <button
                        onClick={() => navigate("/")}
                        className="text-sm bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:bg-gray-100 transition"
                    >
                        ← Back to Deliveries
                    </button>
                </div>

                {delivery && (
                    <DeliverySummary
                        delivery={delivery}
                        editField={editDeliveryField}
                        setEditField={setEditDeliveryField}
                        onSave={saveDeliveryEdit}
                        onUploadInvoice={uploadInvoice}
                        onDeleteInvoice={deleteInvoice}
                    />
                )}

                <BaleTable
                    bales={bales}
                    // updateBale={updateBale}
                    refreshBales={fetchBales}
                />
            </div>
        </div>
    );
}
