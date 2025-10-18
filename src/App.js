import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";




export default function App() {
  const initial = [
    { id: "T1", desc: "Ransomware Attack", L: 5, I: 5, C: 0.6 ,CM: "Network segmentation"},
    { id: "T2", desc: "Insider Threat", L: 3, I: 4, C: 0.6 ,CM: "activity monitoring"},
    { id: "T3", desc: "Vendor Data Breach", L: 4, I: 5, C: 0.5 ,CM: "Encryption"},
    { id: "T4", desc: "Phishing Attack", L: 5, I: 3, C: 0.7 ,CM: " email filtering"},
    { id: "T5", desc: "Unpatched Systems", L: 4, I: 4, C: 0.3 ,CM: "Patch management"},
  ];

  const [rows, setRows] = useState(initial);
  const [newRow, setNewRow] = useState({ id: "", desc: "", L: 3, I: 3, C: 0.5 });

  const computeTR = (r) => {
    const L = Number(r.L) || 0;
    const I = Number(r.I) || 0;
    return L * I;
  };

  const computeRR = (r) => {
    const TR = computeTR(r);
    const C = Number(r.C) || 0;
    return +(TR * (1 - C)).toFixed(2);
  };

  const riskLevel = (rr) => {
    if (rr <= 5) return "Low";
    if (rr <= 10) return "Medium";
    if (rr <= 15) return "High";
    return "Extreme";
  };

  const addRow = () => {
    if (!newRow.id || !newRow.desc) return;
    setRows((p) => [...p, { ...newRow }]);
    setNewRow({ id: "", desc: "", L: 3, I: 3, C: 0.5 ,CM: ""});
  };

  const updateRow = (index, field, value) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeRow = (index) => {
    setRows((p) => p.filter((_, i) => i !== index));
  };

  const exportCSV = () => {
    const header = [
      "Threat ID",
      "Threat Description",
      "Likelihood (1-5)",
      "Impact (1-5)",
      "Control Effectiveness (0.1-1.0)",
      "Total Risk (TR)",
      "Residual Risk (RR)",
      "Risk Level",
      "Countermeasures",
    ];
    const lines = [header.join(",")];
    rows.forEach((r) => {
      const TR = computeTR(r);
      const RR = computeRR(r);
      const level = riskLevel(RR);
      lines.push([
        r.id,
        `"${r.desc}"`,
        r.L,
        r.I,
        r.C,
        TR,
        RR,
        level,
        r.CM,
        ""
      ].join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "NRAST_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartData = useMemo(() => {
    return rows.map((r) => ({ name: r.desc, RR: computeRR(r) }));
  }, [rows]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">NRAST- NHS Risk Analysis & Scoring Tool</h1>
        </header>

        <section className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-semibold mb-3">Add new threat</h2>
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-2">
              <label className="block text-xs text-gray-600">Threat ID</label>
              <input className="mt-1 p-2 border rounded w-full" value={newRow.id} onChange={(e)=>setNewRow({...newRow,id:e.target.value})} />
            </div>
            <div className="col-span-5">
              <label className="block text-xs text-gray-600">Description</label>
              <input className="mt-1 p-2 border rounded w-full" value={newRow.desc} onChange={(e)=>setNewRow({...newRow,desc:e.target.value})} />
            </div>
            <div className="col-span-1">
              <label className="block text-xs text-gray-600">Likelihood</label>
              <select className="mt-1 p-2 border rounded w-full" value={newRow.L} onChange={(e)=>setNewRow({...newRow,L:Number(e.target.value)})}>
                {[1,2,3,4,5].map(i=> <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-xs text-gray-600">Impact</label>
              <select className="mt-1 p-2 border rounded w-full" value={newRow.I} onChange={(e)=>setNewRow({...newRow,I:Number(e.target.value)})}>
                {[1,2,3,4,5].map(i=> <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-600">Control Effectiveness (0.1–1.0)</label>
              <input className="mt-1 p-2 border rounded w-full" type="number" step="0.1" min="0.1" max="1" value={newRow.C} onChange={(e)=>setNewRow({...newRow,C:Number(e.target.value)})} />
            </div>
            <div className="col-span-5">
              <label className="block text-xs text-gray-600">Countermeasures</label>
              <input className="mt-1 p-2 border rounded w-full" value={newRow.CM} onChange={(e)=>setNewRow({...newRow,CM:e.target.value})} />
            </div>

            <div className="col-span-1 text-right">
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={addRow}>Add</button>
            </div>
          </div>
        </section>

        <section className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-semibold mb-3">Risk Register</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Threat Description</th>
                  <th className="p-2">Likelihood</th>
                  <th className="p-2">Impact</th>
                  <th className="p-2">Control Effectiveness</th>
                  <th className="p-2">TR</th>
                  <th className="p-2">RR</th>
                  <th className="p-2">Level</th>
                  <th className="p-2">Counter Measures</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => {
                  const TR = computeTR(r);
                  const RR = computeRR(r);
                  const level = riskLevel(RR);
                  const bg = level === "Low" ? "bg-green-50" : level === "Medium" ? "bg-yellow-50" : level === "High" ? "bg-orange-50" : "bg-red-50";
                  return (
                    <tr key={r.id+idx} className={`${bg} border-b`}>
                      <td className="p-2 align-top">
                        <input className="p-1 border rounded w-20" value={r.id} onChange={(e)=>updateRow(idx,'id',e.target.value)} />
                      </td>
                      <td className="p-2 align-top">
                        <input className="p-1 border rounded w-full" value={r.desc} onChange={(e)=>updateRow(idx,'desc',e.target.value)} />
                      </td>
                      <td className="p-2 text-center">
                        <select className="p-1 border rounded" value={r.L} onChange={(e)=>updateRow(idx,'L',Number(e.target.value))}>
                          {[1,2,3,4,5].map(i=> <option key={i} value={i}>{i}</option>)}
                        </select>
                      </td>
                      <td className="p-2 text-center">
                        <select className="p-1 border rounded" value={r.I} onChange={(e)=>updateRow(idx,'I',Number(e.target.value))}>
                          {[1,2,3,4,5].map(i=> <option key={i} value={i}>{i}</option>)}
                        </select>
                      </td>
                      <td className="p-2 text-center">
                        <input className="p-1 border rounded w-20 text-center" type="number" step="0.1" min="0.1" max="1" value={r.C} onChange={(e)=>updateRow(idx,'C',Number(e.target.value))} />
                      </td>
                      <td className="p-2 text-center">{TR}</td>
                      <td className="p-2 text-center font-semibold">{RR}</td>
                      <td className="p-2 text-center"><span className="px-2 py-1 rounded text-xs font-medium" style={{backgroundColor: level === 'Low' ? '#C6EFCE' : level === 'Medium' ? '#FFEB9C' : level === 'High' ? '#F4B084' : '#FFC7CE'}}>{level}</span></td>
                      <td className="p-2 align-top">
                        <input className="p-1 border rounded w-full" value={r.CM} onChange={(e)=>updateRow(idx,'CM',e.target.value)} />
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex gap-2 justify-end">
                          <button className="text-sm text-gray-600" onClick={()=>removeRow(idx)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex justify-between items-center">
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded" onClick={exportCSV}>Export CSV</button>
            </div>
          </div>
        </section>

        <section className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-semibold mb-3">Dashboard</h2>
          <div style={{height:300}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="RR" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-xs text-gray-500">Average Residual Risk</div>
              <div className="text-xl font-semibold">{(chartData.reduce((s,it)=>s+it.RR,0)/chartData.length).toFixed(2)}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-xs text-gray-500">Max Residual Risk</div>
              <div className="text-xl font-semibold">{Math.max(...chartData.map(d=>d.RR))}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-xs text-gray-500">Min Residual Risk</div>
              <div className="text-xl font-semibold">{Math.min(...chartData.map(d=>d.RR))}</div>
            </div>
          </div>
        </section>
        <footer className="text-sm text-gray-500 text-center mt-6">NRAST prototype based on NIST.</footer>
      </div>
    </div>
  );
}
