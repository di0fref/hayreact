import React, { useEffect, useState } from "react";

const API = "http://localhost:4000/api";

function formatDate(dateStr) {
    if (!dateStr) return "—";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? "—" : d.toISOString().slice(0, 10);
}

export default function App() {
    const [deliveries, setDeliveries] = useState([]);
    const [bales, setBales] = useState([]);
    const [form, setForm] = useState({ date: "", supplier: "", bales: "" });
    const [view, setView] = useState("list");
    const [selectedId, setSelectedId] = useState(null);
    const [editDeliveryField, setEditDeliveryField] = useState(null);
    const [edit, setEdit] = useState({ id: null, field: null });
    const [openDropdown, setOpenDropdown] = useState(null);

    const loadDeliveries = async () => {
        const res = await fetch(`${API}/deliveries`);
        setDeliveries(await res.json());
    };

    const loadBales = async (id) => {
        const res = await fetch(`${API}/bales/${id}`);
        setBales(await res.json());
    };

    useEffect(() => { loadDeliveries(); }, []);

    const addDelivery = async () => {
        if (!form.date || !form.supplier || !form.bales) return;
        await fetch(`${API}/deliveries`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        setForm({ date: "", supplier: "", bales: "" });
        await loadDeliveries();
    };

    const updateDelivery = async (id, data) => {
        await fetch(`${API}/deliveries/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        await loadDeliveries();
    };

    const updateBale = async (id, data) => {
        await fetch(`${API}/bales/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        await loadBales(selectedId);
    };

    const uploadInvoice = async (deliveryId, file) => {
        const formData = new FormData();
        formData.append("file", file);
        await fetch(`${API}/invoice/${deliveryId}`, { method: "POST", body: formData });
        await loadDeliveries();
    };

    const deleteInvoice = async (deliveryId) => {
        await fetch(`${API}/invoice/${deliveryId}`, { method: "DELETE" });
        await loadDeliveries();
    };

    if (view === "bales" && selectedId != null) {
        const delivery = deliveries.find((d) => d.id === selectedId);
        const saveDeliveryEdit = async (field, value) => {
            await updateDelivery(delivery.id, { [field]: value });
            setEditDeliveryField(null);
        };

        const Pill = ({ color, label }) => (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
        {label}
      </span>
        );

        const renderPills = (b) => {
            const pills = [];
            if (b.isOpen) pills.push(<Pill key="open" color="bg-green-100 text-green-700" label="Open" />);
            if (b.isClosed) pills.push(<Pill key="closed" color="bg-blue-100 text-blue-700" label="Closed" />);
            if (b.bad) pills.push(<Pill key="bad" color="bg-yellow-100 text-yellow-700" label="Bad" />);
            if (b.reimbursed) pills.push(<Pill key="reimbursed" color="bg-purple-100 text-purple-700" label="Reimbursed" />);
            if (b.warm) pills.push(<Pill key="warm" color="bg-orange-100 text-red-700 font-semibold" label="Warm" />);
            return <div className="flex flex-wrap justify-start gap-2">{pills}</div>;
        };

        return (
            <div className="bg-gray-50 min-h-screen py-8 px-4">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-semibold text-gray-800">Bales</h1>
                        <button
                            onClick={() => { setView("list"); setSelectedId(null); }}
                            className="text-sm bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:bg-gray-100 transition"
                        >
                            ← Back to Deliveries
                        </button>
                    </div>

                    {/* Delivery Summary */}
                    <div className="bg-white shadow-md border border-gray-100 rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-base">
                        <div><strong>Date:</strong> {formatDate(delivery?.date)}</div>
                        <div><strong>Supplier:</strong> {delivery?.supplier}</div>
                        <div><strong>Bales:</strong> {delivery?.bales}</div>
                        <div><strong>Paid:</strong> {delivery?.paid ? "Yes" : "No"}</div>
                        <div>
                            <strong>Price:</strong>{" "}
                            {editDeliveryField === "price" ? (
                                <input
                                    type="number"
                                    autoFocus
                                    defaultValue={delivery?.price || 0}
                                    onBlur={(e) => saveDeliveryEdit("price", Number(e.target.value))}
                                    className="border border-gray-300 rounded-xl p-2 w-24 text-base"
                                />
                            ) : (
                                <span
                                    onClick={() => setEditDeliveryField("price")}
                                    className="cursor-pointer hover:underline"
                                >
                  {delivery?.price || 0}
                </span>
                            )}
                        </div>
                        <div>
                            <strong>Kg:</strong>{" "}
                            {editDeliveryField === "kg" ? (
                                <input
                                    type="number"
                                    autoFocus
                                    defaultValue={delivery?.kg || 0}
                                    onBlur={(e) => saveDeliveryEdit("kg", Number(e.target.value))}
                                    className="border border-gray-300 rounded-xl p-2 w-24 text-base"
                                />
                            ) : (
                                <span
                                    onClick={() => setEditDeliveryField("kg")}
                                    className="cursor-pointer hover:underline"
                                >
                  {delivery?.kg || 0}
                </span>
                            )}
                        </div>
                    </div>

                    {/* Bales Table */}
                    <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100">
                        <table className="min-w-full text-base">
                            <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">#</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-center">Days Open</th>
                                <th className="px-4 py-3 text-center">Open Date</th>
                                <th className="px-4 py-3 text-center">Close Date</th>
                                <th className="px-4 py-3 text-center">Warm Date</th>
                                <th className="px-4 py-3 text-center">Menu</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {bales.map((b) => {
                                const daysOpen = b.openDate
                                    ? Math.max(0, Math.floor((new Date(b.closeDate || new Date()) - new Date(b.openDate)) / 86400000))
                                    : "—";
                                return (
                                    <tr key={b.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3">{b.number}</td>
                                        <td className="px-4 py-3">{renderPills(b)}</td>
                                        <td className="px-4 py-3 text-center">{daysOpen}</td>
                                        {["openDate", "closeDate", "warmDate"].map((f) => (
                                            <td
                                                key={f}
                                                className="px-4 py-3 text-center cursor-pointer"
                                                onClick={() => setEdit({ id: b.id, field: f })}
                                            >
                                                {edit.id === b.id && edit.field === f ? (
                                                    <input
                                                        type="date"
                                                        defaultValue={formatDate(b[f])}
                                                        onBlur={(e) => {
                                                            updateBale(b.id, { [f]: e.target.value });
                                                            setEdit({ id: null, field: null });
                                                        }}
                                                        autoFocus
                                                        className="border border-gray-300 rounded-xl p-1 text-base"
                                                    />
                                                ) : f === "warmDate" && b.warm ? (
                                                    <span className="text-red-600 font-semibold">{formatDate(b[f])}</span>
                                                ) : (
                                                    formatDate(b[f])
                                                )}
                                            </td>
                                        ))}
                                        <td className="px-4 py-3 text-center relative">
                        <span
                            className="text-blue-600 hover:underline cursor-pointer"
                            onClick={() => setOpenDropdown(openDropdown === b.id ? null : b.id)}
                        >
                          Menu
                        </span>
                                            {openDropdown === b.id && (
                                                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg text-left z-10">
                                                    {[
                                                        { label: "Mark Open", data: { isOpen: 1, isClosed: 0, openDate: new Date().toISOString() } },
                                                        { label: "Mark Closed", data: { isClosed: 1, isOpen: 0, closeDate: new Date().toISOString() } },
                                                        { label: "Toggle Bad", data: { bad: b.bad ? 0 : 1 } },
                                                        { label: "Toggle Reimbursed", data: { reimbursed: b.reimbursed ? 0 : 1 } },
                                                        { label: "Toggle Warm", data: { warm: b.warm ? 0 : 1, warmDate: new Date().toISOString() } },
                                                    ].map((m) => (
                                                        <button
                                                            key={m.label}
                                                            onClick={() => { updateBale(b.id, m.data); setOpenDropdown(null); }}
                                                            className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                                                        >
                                                            {m.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // Deliveries view
    return (
        <div className="bg-gray-50 min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                <h1 className="text-3xl font-semibold text-gray-800">Hay Bale Deliveries v2.0</h1>

                {/* Add Delivery Form */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white shadow-md rounded-2xl p-6 border border-gray-100">
                    <input
                        type="date"
                        className="border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Supplier"
                        className="border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        value={form.supplier}
                        onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Bales"
                        className="border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        value={form.bales}
                        onChange={(e) => setForm({ ...form, bales: Number(e.target.value) })}
                    />
                    <button
                        onClick={addDelivery}
                        className="bg-white border border-gray-300 rounded-full px-4 py-3 shadow-sm hover:bg-gray-100 transition"
                    >
                        Add
                    </button>
                </div>

                {/* Deliveries Table */}
                <div className="bg-white shadow-md rounded-2xl border border-gray-100 overflow-x-auto">
                    <table className="min-w-full text-base">
                        <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left">Supplier</th>
                            <th className="px-4 py-3 text-center">Bales</th>
                            <th className="px-4 py-3 text-center">Invoice</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {deliveries.map((del) => (
                            <tr key={del.id} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-3">{formatDate(del.date)}</td>
                                <td className="px-4 py-3">{del.supplier}</td>
                                <td className="px-4 py-3 text-center">{del.bales}</td>
                                <td className="px-4 py-3 text-center">
                                    {del.invoicePath ? (
                                        <div className="flex justify-center items-center gap-2">
                                            <a href={`http://localhost:4000${del.invoicePath}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                                Invoice
                                            </a>
                                            <button
                                                onClick={() => deleteInvoice(del.id)}
                                                className="text-gray-400 hover:text-red-600"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="text-gray-500 hover:underline cursor-pointer">
                                            📎 Upload
                                            <input
                                                type="file"
                                                accept=".pdf,image/*"
                                                className="hidden"
                                                onChange={(e) =>
                                                    e.target.files?.[0] && uploadInvoice(del.id, e.target.files[0])
                                                }
                                            />
                                        </label>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => { setSelectedId(del.id); loadBales(del.id); setView("bales"); }}
                                        className="text-blue-600 hover:underline"
                                    >
                                        View →
                                    </button>
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
