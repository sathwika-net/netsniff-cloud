import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function PacketFeed() {
  const [packets, setPackets] = useState([]);
  const [error, setError] = useState(null);
  const [protocol, setProtocol] = useState("ALL"); // selected filter
  const timer = useRef(null);

  useEffect(() => {
    async function loadPackets() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Build the URL — only add &protocol=... when a specific one is picked
      let url = `${API_URL}/api/packets?limit=100`;
      if (protocol !== "ALL") url += `&protocol=${protocol}`;

      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        setPackets(data.packets);
      } catch (e) {
        setError(e.message);
      }
    }

    loadPackets();
    timer.current = setInterval(loadPackets, 2000);
    return () => clearInterval(timer.current);
  }, [protocol]); // re-run whenever the filter changes

  if (error) return <p className="text-red-400">Couldn't load packets: {error}</p>;

  return (
    <div className="bg-slate-800 rounded p-4 mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Live Packet Feed</h2>
        <select
          value={protocol}
          onChange={(e) => setProtocol(e.target.value)}
          className="bg-slate-700 text-white text-sm rounded px-2 py-1"
        >
          <option value="ALL">All protocols</option>
          <option value="TCP">TCP</option>
          <option value="UDP">UDP</option>
          <option value="ICMP">ICMP</option>
          <option value="OTHER">OTHER</option>
        </select>
      </div>
      <div className="overflow-auto max-h-96">
        <table className="w-full text-sm text-left">
          <thead className="text-slate-400 border-b border-slate-700">
            <tr>
              <th className="py-2 pr-4">Time</th>
              <th className="py-2 pr-4">Protocol</th>
              <th className="py-2 pr-4">Source</th>
              <th className="py-2 pr-4">Destination</th>
              <th className="py-2 pr-4">Size</th>
            </tr>
          </thead>
          <tbody>
            {packets.map((p) => (
              <tr key={p.id} className="border-b border-slate-700/50">
                <td className="py-1 pr-4">{new Date(p.captured_at).toLocaleTimeString()}</td>
                <td className="py-1 pr-4">{p.protocol}</td>
                <td className="py-1 pr-4">{p.src_ip}{p.src_port ? `:${p.src_port}` : ""}</td>
                <td className="py-1 pr-4">{p.dst_ip}{p.dst_port ? `:${p.dst_port}` : ""}</td>
                <td className="py-1 pr-4">{p.packet_size}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {packets.length === 0 && (
          <p className="text-slate-400 py-3">No packets match this filter yet.</p>
        )}
      </div>
    </div>
  );
}
