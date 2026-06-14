import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function PacketFeed() {
  const [packets, setPackets] = useState([]);
  const [error, setError] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    async function loadPackets() {
      // Get the logged-in user's session token (JWT) — same as the charts
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const res = await fetch(`${API_URL}/api/packets?limit=100`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        setPackets(data.packets);
      } catch (e) {
        setError(e.message);
      }
    }

    loadPackets();                                   // run once right away
    timer.current = setInterval(loadPackets, 2000);  // then refresh every 2s
    return () => clearInterval(timer.current);        // stop polling when leaving the page
  }, []);

  if (error) return <p className="text-red-400">Couldn't load packets: {error}</p>;

  return (
    <div className="bg-slate-800 rounded p-4 mt-6">
      <h2 className="text-lg font-semibold mb-3">Live Packet Feed</h2>
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
          <p className="text-slate-400 py-3">No packets yet. Run the agent to see live traffic.</p>
        )}
      </div>
    </div>
  );
}
