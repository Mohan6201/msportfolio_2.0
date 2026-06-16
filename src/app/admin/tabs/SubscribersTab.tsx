"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type Subscriber = { id: number; email: string; created_at: string };

export function SubscribersTab() {
  const [data, setData] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin?tab=subscribers").then(r => r.json()).then(j => { setData(j.data ?? []); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan animate-spin" /></div>;

  return (
    <div className="bg-black/30 border border-lightBrown rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-lightBrown">
            <th className="text-left px-5 py-3 text-cyan text-xs uppercase tracking-wider">#</th>
            <th className="text-left px-5 py-3 text-cyan text-xs uppercase tracking-wider">Email</th>
            <th className="text-left px-5 py-3 text-cyan text-xs uppercase tracking-wider">Subscribed</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && <tr><td colSpan={3} className="px-5 py-8 text-lightGrey text-center">No subscribers yet.</td></tr>}
          {data.map((s, i) => (
            <tr key={s.id} className="border-b border-lightBrown/40 hover:bg-white/2 transition-colors">
              <td className="px-5 py-3 text-grey">{i + 1}</td>
              <td className="px-5 py-3 text-white">{s.email}</td>
              <td className="px-5 py-3 text-grey">{new Date(s.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
