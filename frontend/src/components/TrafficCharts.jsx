import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from "recharts";

// The base URL of our API. In local dev it's localhost; in production
// we'll set VITE_API_URL in Vercel to the deployed domain.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Colors for the protocol pie slices
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function TrafficCharts() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      // Get the logged-in user's session token (JWT)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Not logged in");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/stats`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        setStats(await res.json());
      } catch (e) {
        setError(e.message);
      }
    }
    loadStats();
  }, []);

  if (error) return <p className="text-red-400">Couldn't load stats: {error}</p>;
  if (!stats) return <p className="text-slate-400">Loading charts…</p>;

  // Recharts wants arrays of objects. Convert the protocol counts:
  // { TCP: 12, UDP: 5 }  →  [{ name: "TCP", value: 12 }, ...]
  const protocolData = Object.entries(stats.by_protocol).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Protocol distribution pie */}
      <div className="bg-slate-800 rounded p-4">
        <h2 className="text-lg font-semibold mb-2">Protocol Distribution</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={protocolData} dataKey="value" nameKey="name" outerRadius={90} label>
              {protocolData.map((entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top destinations bar */}
      <div className="bg-slate-800 rounded p-4">
        <h2 className="text-lg font-semibold mb-2">Top Destinations</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stats.top_destinations}>
            <XAxis dataKey="dst_ip" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94a3b8" }} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TrafficCharts;