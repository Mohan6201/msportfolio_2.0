"use client";
import { useState } from "react";
import { INSTANCES, calculateEC2Cost, type EC2Estimate } from "../utils/ec2Calculator";

const HOURS_PRESETS = [
  { label: "24/7", hours: 744 },
  { label: "Business hours (8h/d)", hours: 176 },
  { label: "Dev env (4h/d)", hours: 88 },
  { label: "Custom", hours: 0 },
];

function fmt(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function EC2Calculator() {
  const [instanceType, setInstanceType] = useState("t3.medium");
  const [hoursPreset, setHoursPreset] = useState(744);
  const [customHours, setCustomHours] = useState(744);
  const [count, setCount] = useState(1);
  const [estimate, setEstimate] = useState<EC2Estimate | null>(null);

  const hours = hoursPreset > 0 ? hoursPreset : customHours;

  function calculate() {
    setEstimate(calculateEC2Cost(instanceType, hours, count));
  }

  const selectedInstance = INSTANCES.find((i) => i.type === instanceType);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Instance type */}
        <div>
          <label className="block text-[10px] font-mono text-lightGrey/60 mb-1 uppercase tracking-wider">Instance Type</label>
          <select value={instanceType} onChange={(e) => setInstanceType(e.target.value)} className="input-field w-full">
            {INSTANCES.map((i) => (
              <option key={i.type} value={i.type}>{i.type} ({i.vcpu} vCPU, {i.memGb} GB)</option>
            ))}
          </select>
          {selectedInstance && (
            <p className="text-lightGrey/40 text-[9px] font-mono mt-1">
              ${selectedInstance.linuxOnDemand}/hr On-Demand
            </p>
          )}
        </div>

        {/* Usage hours */}
        <div>
          <label className="block text-[10px] font-mono text-lightGrey/60 mb-1 uppercase tracking-wider">Monthly Hours</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {HOURS_PRESETS.map((p) => (
              <button key={p.label} onClick={() => setHoursPreset(p.hours)}
                className={`text-[9px] font-mono px-2 py-1 rounded border transition-colors ${
                  hoursPreset === p.hours ? "bg-cyan/15 border-cyan/40 text-cyan" : "border-white/10 text-lightGrey hover:border-white/20"
                }`}>
                {p.label}
              </button>
            ))}
          </div>
          {hoursPreset === 0 && (
            <input type="number" value={customHours} min={1} max={744}
              onChange={(e) => setCustomHours(Number(e.target.value))} className="input-field w-full" />
          )}
          {hoursPreset > 0 && (
            <p className="text-lightGrey/40 text-[9px] font-mono">{hoursPreset} hrs/month</p>
          )}
        </div>

        {/* Count */}
        <div>
          <label className="block text-[10px] font-mono text-lightGrey/60 mb-1 uppercase tracking-wider">Instance Count</label>
          <input type="number" value={count} min={1} max={100}
            onChange={(e) => setCount(Math.max(1, Number(e.target.value)))} className="input-field w-full" />
        </div>

        <div className="flex items-end">
          <button onClick={calculate}
            className="w-full py-2.5 bg-cyan text-black font-mono font-bold text-sm rounded-xl hover:bg-lightCyan transition-colors">
            Calculate
          </button>
        </div>
      </div>

      {estimate && (
        <div className="grid sm:grid-cols-2 gap-4">
          {/* On-Demand */}
          <div className="glass rounded-xl border border-orange/20 p-5">
            <p className="text-[10px] font-mono text-orange/70 uppercase tracking-wider mb-3">On-Demand (pay-as-you-go)</p>
            <p className="text-orange font-mono font-bold text-3xl">{fmt(estimate.onDemandMonthly)}<span className="text-sm font-normal">/mo</span></p>
            <p className="text-lightGrey text-xs font-mono mt-1">{fmt(estimate.onDemandAnnual)} / year</p>
            <div className="mt-4 pt-3 border-t border-white/10 text-xs font-mono text-lightGrey/60 space-y-0.5">
              <p>${estimate.instance.linuxOnDemand.toFixed(4)}/hr × {estimate.hoursPerMonth} hrs × {estimate.count} instance{estimate.count > 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Reserved */}
          <div className="glass rounded-xl border border-green/20 p-5">
            <p className="text-[10px] font-mono text-green/70 uppercase tracking-wider mb-3">Reserved (1-Year, All-Upfront)</p>
            <p className="text-green font-mono font-bold text-3xl">{fmt(estimate.reservedMonthly)}<span className="text-sm font-normal">/mo</span></p>
            <p className="text-lightGrey text-xs font-mono mt-1">{fmt(estimate.reservedAnnual)} / year</p>
            <div className="mt-4 pt-3 border-t border-white/10 text-xs font-mono text-lightGrey/60 space-y-0.5">
              <p className="text-green font-bold">Save ~{estimate.savingsPercent}% vs On-Demand</p>
              <p>Save {fmt(estimate.onDemandAnnual - estimate.reservedAnnual)} per year</p>
            </div>
          </div>

          {/* Instance summary */}
          <div className="sm:col-span-2 glass rounded-xl border border-white/10 p-4">
            <div className="flex flex-wrap gap-6 text-center">
              {[
                { label: "Type", value: estimate.instance.type },
                { label: "vCPUs", value: estimate.instance.vcpu },
                { label: "Memory", value: `${estimate.instance.memGb} GB` },
                { label: "Count", value: estimate.count },
                { label: "Hours/Month", value: estimate.hoursPerMonth },
                { label: "Region", value: "us-east-1" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-white font-mono font-bold text-sm">{s.value}</p>
                  <p className="text-lightGrey/50 text-[9px] font-mono uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
