import React from "react";

export default function AddDeliveryForm({ form, setForm, onAdd }) {
    return (
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
                onClick={onAdd}
                className="bg-white border border-gray-300 rounded-full px-4 py-3 shadow-sm hover:bg-gray-100 transition"
            >
                Add
            </button>
        </div>
    );
}
