import React from "react";

export default function Pill({ color, label }) {
    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}
        >
      {label}
    </span>
    );
}
