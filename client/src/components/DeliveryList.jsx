import React from "react";
import { API, formatDate } from "./utils";

export default function DeliveryList({ deliveries, onView, onUpload, onDelete, onSavePaid }) {
    return (
        <div className="bg-white shadow-md rounded-2xl border border-gray-100 overflow-x-auto">
            <table className="min-w-full text-base">

                <thead className="bg-gray-100 text-gray-700">
                <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Supplier</th>
                    <th className="px-4 py-3 text-center">Bales</th>
                    <th className="px-4 py-3 text-center">Paid</th>
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

                        {/* Editable Paid checkbox */}
                        <td className="px-4 py-3 text-center">
                            <input
                                type="checkbox"
                                checked={!!del.paid}
                                onChange={() => onSavePaid(del.id, del.paid ? 0 : 1)}
                                className="w-5 h-5 accent-blue-600 cursor-pointer"
                            />
                        </td>

                        {/* Invoice */}
                        <td className="px-4 py-3 text-center">
                            {del.invoicePath ? (
                                <div className="flex justify-center items-center gap-2">
                                    <a
                                        href={`http://localhost:4000${del.invoicePath}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Invoice
                                    </a>
                                    <button
                                        onClick={() => onDelete(del.id)}
                                        className="text-gray-400 hover:text-red-600"
                                        title="Delete invoice"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ) : (
                                <label className="text-gray-500 hover:underline cursor-pointer">
                                    📎 Upload
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={(e) =>
                                            e.target.files?.[0] && onUpload(del.id, e.target.files[0])
                                        }
                                    />
                                </label>
                            )}
                        </td>

                        {/* View button */}
                        <td className="px-4 py-3 text-center">
                            <button
                                onClick={() => onView(del.id)}
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
    );
}
