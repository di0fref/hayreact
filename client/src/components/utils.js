export const API = "http://localhost:4000/api";

export function formatDate(dateStr) {
    if (!dateStr) return "—";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? "—" : d.toISOString().slice(0, 10);
}
