import React, { useState } from "react";
import Pill from "./Pill";
import { formatDate } from "./utils";

export default function BaleTable({ bales, updateBale, refreshBales }) {
    const [edit, setEdit] = useState({ id: null, field: null });
    const [openDropdown, setOpenDropdown] = useState(null);

    const renderPills = (b) => {
        const pills = [];
        if (b.isOpen) pills.push(<Pill key="open" color="bg-green-100 text-green-700" label="Open" />);
        if (b.isClosed) pills.push(<Pill key="closed" color="bg-blue-100 text-blue-700" label="Closed" />);
        if (b.bad) pills.push(<Pill key="bad" color="bg-yellow-100 text-yellow-700" label="Bad" />);
        if (b.reimbursed) pills.push(<Pill key="reimbursed" color="bg-purple-100 text-purple-700" label="Reimbursed" />);
        if (b.warm) pills.push(<Pill key="warm" color="bg-orange-100 text-red-700 font-semibold" label="Warm" />);
        return <div className="flex flex-wrap justify-start gap-2">{pills}</div>;
    };
    const uploadBaleImage = async (baleId, file) => {
        const formData = new FormData();
        formData.append("file", file);
        await fetch(`http://localhost:4000/api/bale-image/${baleId}`, {
            method: "POST",
            body: formData,
        });
        await refreshBales(); // reload just the bales
    };

    const deleteBaleImage = async (baleId) => {
        await fetch(`http://localhost:4000/api/bale-image/${baleId}`, { method: "DELETE" });
        await refreshBales(); // reload just the bales
    };


    return (
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
                    <th className="px-4 py-3 text-center">Image</th>
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

                            {/* Dates */}
                            {["openDate", "closeDate", "warmDate"].map((f) => {
                                const isWarm = f === "warmDate" && b.warm;
                                const isEditable =
                                    (f === "openDate" && b.isOpen) ||
                                    (f === "closeDate" && b.isClosed) ||
                                    (f === "warmDate" && b.warm);

                                const tooltip =
                                    f === "openDate"
                                        ? "You must mark this bale as Open before setting Open Date"
                                        : f === "closeDate"
                                            ? "You must mark this bale as Closed before setting Close Date"
                                            : "You must mark this bale as Warm before setting Warm Date";

                                return (
                                    <td
                                        key={f}
                                        className={`relative group px-4 py-3 text-center transition ${
                                            isWarm ? "bg-red-50" : ""
                                        } ${isEditable ? "cursor-pointer hover:text-blue-600" : "opacity-60 cursor-not-allowed"}`}
                                        onClick={() => isEditable && setEdit({ id: b.id, field: f })}
                                    >
                                        {/* Tooltip */}
                                        {!isEditable && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20">
                                                <div className="bg-gray-800 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap shadow-md">
                                                    {tooltip}
                                                </div>
                                            </div>
                                        )}

                                        {/* Editable input or value */}
                                        {edit.id === b.id && edit.field === f ? (
                                            <input
                                                type="date"
                                                defaultValue={formatDate(b[f])}
                                                onBlur={(e) => {
                                                    updateBale(b.id, { [f]: e.target.value });
                                                    setEdit({ id: null, field: null });
                                                }}
                                                autoFocus
                                                className={`border rounded-xl p-1 text-base focus:outline-none focus:ring-2 ${
                                                    isWarm
                                                        ? "border-red-300 focus:ring-red-300"
                                                        : "border-gray-300 focus:ring-gray-200"
                                                }`}
                                            />
                                        ) : (
                                            <span
                                                className={`${
                                                    isWarm
                                                        ? "text-red-600 font-semibold"
                                                        : isEditable
                                                            ? "text-blue-600"
                                                            : "text-gray-800"
                                                }`}
                                            >
          {formatDate(b[f])}
        </span>
                                        )}
                                    </td>
                                );
                            })}



                            {/* Bale Image */}
                            <td className="px-4 py-3 text-center">
                                {b.imagePath ? (
                                    <div className="flex justify-center items-center gap-2">
                                        <a
                                            href={`http://localhost:4000${b.imagePath}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            View
                                        </a>
                                        <button
                                            onClick={() => deleteBaleImage(b.id)}
                                            className="text-gray-400 hover:text-red-600"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ) : (
                                    <label className="text-gray-500 hover:underline cursor-pointer">
                                        📸 Upload
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) =>
                                                e.target.files?.[0] && uploadBaleImage(b.id, e.target.files[0])
                                            }
                                        />
                                    </label>
                                )}
                            </td>

                            {/* Menu */}
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
                                                onClick={() => {
                                                    updateBale(b.id, m.data);
                                                    setOpenDropdown(null);
                                                }}
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
    );
}
