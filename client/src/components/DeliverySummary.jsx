import React from "react";

export default function DeliverySummary({
                                            delivery,
                                            editField,
                                            setEditField,
                                            onSave,
                                            onUploadInvoice,
                                            onDeleteInvoice,
                                        }) {
    const togglePaid = async () => {
        await onSave("paid", delivery.paid ? 0 : 1);
    };

    return (
        <div className="bg-white shadow-md border border-gray-100 rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-base">
            <div>
                <strong>Date:</strong> {delivery?.date}
            </div>
            <div>
                <strong>Supplier:</strong> {delivery?.supplier}
            </div>
            <div>
                <strong>Bales:</strong> {delivery?.bales}
            </div>

            {/* Paid toggle */}
            <div className="flex items-center gap-2">
                <strong>Paid:</strong>
                <input
                    type="checkbox"
                    checked={!!delivery?.paid}
                    onChange={togglePaid}
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                />
            </div>

            {/* Editable Price & Kg */}
            {["price", "kg"].map((f) => (
                <div key={f}>
                    <strong>{f === "price" ? "Price" : "Kg"}:</strong>{" "}
                    {editField === f ? (
                        <input
                            type="number"
                            autoFocus
                            defaultValue={delivery?.[f] || 0}
                            onBlur={(e) => onSave(f, Number(e.target.value))}
                            className="border border-gray-300 rounded-xl p-2 w-24 text-base focus:ring-2 focus:ring-blue-300"
                        />
                    ) : (
                        <span
                            onClick={() => setEditField(f)}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer transition"
                        >
              {delivery?.[f] || 0}
            </span>
                    )}
                </div>
            ))}

            {/* Invoice Upload / View / Delete */}
            <div className="col-span-2 sm:col-span-4 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mt-2">
                <div className="font-medium text-gray-700">
                    Invoice:
                    {delivery.invoicePath ? (
                        <span className="ml-2 text-blue-600 hover:underline">
              <a
                  href={`http://localhost:4000${delivery.invoicePath}`}
                  target="_blank"
                  rel="noreferrer"
              >
                View PDF
              </a>
            </span>
                    ) : (
                        <label className="ml-2 text-gray-500 hover:underline cursor-pointer">
                            📎 Upload
                            <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) =>
                                    e.target.files?.[0] &&
                                    onUploadInvoice(delivery.id, e.target.files[0])
                                }
                            />
                        </label>
                    )}
                </div>

                {delivery.invoicePath && (
                    <button
                        onClick={() => onDeleteInvoice(delivery.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                        title="Delete invoice"
                    >
                        🗑️
                    </button>
                )}
            </div>
        </div>
    );
}
