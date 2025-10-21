import React, { useEffect, useState } from "react";
import {API, formatDate} from "./utils";

export default function ReportModal({ isOpen, onClose }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetch(`${API}/report`)
                .then((res) => res.json())
                .then(setData);
            console.log(data);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-md rounded-xl shadow-xl border border-gray-200 p-5 relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">📊</span>
                        <h2 className="text-lg font-semibold text-gray-800">Rapport</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-lg font-semibold"
                    >
                        ✖
                    </button>
                </div>

                {!data ? (
                    <p className="text-gray-500 text-sm py-4 text-center">Laddar...</p>
                ) : (
                    <div className="text-sm text-gray-800 space-y-2">
                        <p>
                            <strong>Genomsnittlig öppentid:</strong> {data.avgOpenTime} dagar
                        </p>
                        <p>
                            <strong>Öppnade senaste 30 dagarna:</strong> {data.opened30} (
                            {data.ratePerDay}/dag)
                        </p>
                        <p>
                            <strong>Kvar i lager:</strong> {data.stockLeft}
                        </p>
                        <p>
                            <strong>Prognos:</strong> {data.daysLeft} dagar kvar — beräknat slut{" "}
                            {data.predictedEnd}
                        </p>

                        {data.badUnreimbursed.length > 0 && (
                            <>
                                <hr className="my-3" />
                                <p className="font-semibold text-gray-800">
                                    Felaktiga (ej ersatta):
                                </p>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    {data.badUnreimbursed.map((b) => (
                                        <li key={b.id}>
                                            Bal #{b.id} ({b.supplier || "Okänd"}, {formatDate(b.openDate)})
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
