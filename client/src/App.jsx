import React, {useEffect, useState} from "react";
import AddDeliveryForm from "./components/AddDeliveryForm";
import DeliveryList from "./components/DeliveryList";
import DeliverySummary from "./components/DeliverySummary";
import BaleTable from "./components/BaleTable";
import {API} from "./components/utils";

export default function App() {
    const [deliveries, setDeliveries] = useState([]);
    const [bales, setBales] = useState([]);
    const [form, setForm] = useState({date: "", supplier: "", bales: ""});
    const [view, setView] = useState("list");
    const [selectedId, setSelectedId] = useState(null);
    const [editDeliveryField, setEditDeliveryField] = useState(null);

    // --- Load data ---
    const loadDeliveries = async () => {
        const res = await fetch(`${API}/deliveries`);
        setDeliveries(await res.json());
    };

    const loadBales = async (id) => {
        const res = await fetch(`${API}/bales/${id}`);
        setBales(await res.json());
    };

    useEffect(() => {
        loadDeliveries();
    }, []);

    // --- CRUD operations ---
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
    const savePaid = async (id, paid) => {
        await updateDelivery(id, { paid });
    };

    const updateBale = async (id, data) => {
        await fetch(`${API}/bales/${id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        });
        await loadBales(selectedId);
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

    // --- View control ---
    if (view === "bales" && selectedId != null) {
        const delivery = deliveries.find((d) => d.id === selectedId);
        const saveDeliveryEdit = async (field, value) => {
            await updateDelivery(delivery.id, {[field]: value});
            setEditDeliveryField(null);
        };

        return (
            <div className="bg-gray-50 min-h-screen py-8 px-4">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-semibold text-gray-800">Bales</h1>
                        <button
                            onClick={() => {
                                setView("list");
                                setSelectedId(null);
                            }}
                            className="text-sm bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:bg-gray-100 transition"
                        >
                            ← Back to Deliveries
                        </button>
                    </div>

                    {/* Delivery Summary */}
                    <DeliverySummary
                        delivery={delivery}
                        editField={editDeliveryField}
                        setEditField={setEditDeliveryField}
                        onSave={saveDeliveryEdit}
                        onUploadInvoice={uploadInvoice}
                        onDeleteInvoice={deleteInvoice}
                    />


                    {/* Bale Table */}
                    <BaleTable
                        bales={bales}
                        updateBale={updateBale}
                        refreshBales={() => loadBales(selectedId)}
                    /></div>
            </div>
        );
    }

    // --- Delivery list view ---
    return (
        <div className="bg-gray-50 min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                <h1 className="text-3xl font-semibold text-gray-800">Hay Bale Deliveries</h1>

                {/* Add Delivery */}
                <AddDeliveryForm form={form} setForm={setForm} onAdd={addDelivery}/>

                {/* Delivery Table */}
                <DeliveryList
                    deliveries={deliveries}
                    onView={(id) => {
                        setSelectedId(id);
                        loadBales(id);
                        setView("bales");
                    }}
                    onUpload={uploadInvoice}
                    onDelete={deleteInvoice}
                    onSavePaid={savePaid}
                />

            </div>
        </div>
    );
}
