"use client";
import { useState } from "react";
import { generateNginxConfig, type NginxConfig } from "../utils/nginxGenerator";

export default function NginxGenerator() {
  const [config, setConfig] = useState<NginxConfig>({
    domain: "",
    backend: "localhost:3000",
    enableSSL: true,
    mode: "reverse-proxy",
    enableCache: false,
    upstreams: ["", ""],
    webroot: "/var/www/html",
  });
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function generate() {
    setOutput(generateNginxConfig(config));
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono text-lightGrey/60 mb-1 uppercase tracking-wider">Domain</label>
            <input value={config.domain} onChange={(e) => setConfig({ ...config, domain: e.target.value })}
              placeholder="example.com" className="input-field w-full" />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-lightGrey/60 mb-1 uppercase tracking-wider">Mode</label>
            <select value={config.mode} onChange={(e) => setConfig({ ...config, mode: e.target.value as NginxConfig["mode"] })}
              className="input-field w-full">
              <option value="reverse-proxy">Reverse Proxy</option>
              <option value="static">Static Files</option>
              <option value="load-balance">Load Balance</option>
            </select>
          </div>
        </div>

        {config.mode === "reverse-proxy" && (
          <div>
            <label className="block text-[10px] font-mono text-lightGrey/60 mb-1 uppercase tracking-wider">Backend</label>
            <input value={config.backend} onChange={(e) => setConfig({ ...config, backend: e.target.value })}
              placeholder="localhost:3000" className="input-field w-full" />
          </div>
        )}

        {config.mode === "static" && (
          <div>
            <label className="block text-[10px] font-mono text-lightGrey/60 mb-1 uppercase tracking-wider">Web Root</label>
            <input value={config.webroot} onChange={(e) => setConfig({ ...config, webroot: e.target.value })}
              placeholder="/var/www/html" className="input-field w-full" />
          </div>
        )}

        {config.mode === "load-balance" && (
          <div>
            <label className="block text-[10px] font-mono text-lightGrey/60 mb-1 uppercase tracking-wider">Upstream Servers (one per line)</label>
            <textarea rows={3} value={config.upstreams.join("\n")}
              onChange={(e) => setConfig({ ...config, upstreams: e.target.value.split("\n") })}
              placeholder={"backend1.example.com:3000\nbackend2.example.com:3000"} className="input-field w-full resize-none" />
          </div>
        )}

        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={config.enableSSL} onChange={(e) => setConfig({ ...config, enableSSL: e.target.checked })}
              className="rounded" />
            <span className="text-xs font-mono text-white">Enable SSL (Let's Encrypt)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={config.enableCache} onChange={(e) => setConfig({ ...config, enableCache: e.target.checked })}
              className="rounded" />
            <span className="text-xs font-mono text-white">Enable Caching</span>
          </label>
        </div>

        <button onClick={generate}
          className="w-full py-2.5 bg-cyan text-black font-mono font-bold text-sm rounded-xl hover:bg-lightCyan transition-colors">
          Generate Config
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-lightGrey/60 uppercase tracking-wider">nginx.conf</span>
          {output && (
            <button onClick={copy} className="text-[10px] font-mono text-cyan hover:text-white transition-colors">
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
        <pre className="bg-black/60 border border-white/10 rounded-xl p-4 text-[10px] font-mono text-green overflow-auto h-[380px] whitespace-pre-wrap">
          {output || <span className="text-lightGrey/30">Config will appear here…</span>}
        </pre>
      </div>
    </div>
  );
}
