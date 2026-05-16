"use client";

import { useState } from "react";

export default function ExportForm() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function handleExport() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const url = `/api/export-orders?${params.toString()}`;
    window.open(url, "_blank");
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="rounded-lg border border-stone-200 px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none"
      />
      <span className="text-xs text-stone-400">a</span>
      <input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="rounded-lg border border-stone-200 px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none"
      />
      <button
        onClick={handleExport}
        className="rounded-lg bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-200 transition"
      >
        📥 Exportar CSV
      </button>
    </div>
  );
}
