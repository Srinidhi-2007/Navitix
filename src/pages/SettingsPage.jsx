import React, { useState } from 'react';
import { 
  Settings, 
  Cpu, 
  Database, 
  Terminal, 
  CheckCircle2, 
  RefreshCw, 
  Save, 
  Sliders,
  DollarSign,
  Layers,
  Code
} from 'lucide-react';

export default function SettingsPage({ activeRoute }) {
  const [currency, setCurrency] = useState('INR');
  const [demurrageRate, setDemurrageRate] = useState(5000);
  const [bunkerFuelPrice, setBunkerFuelPrice] = useState(620);
  const [modelEndpoint, setModelEndpoint] = useState('http://localhost:8000/api/v1/charter/recommend');
  const [saved, setSaved] = useState(false);
  const [tested, setTested] = useState(false);

  const samplePayload = {
    route_query: {
      cargo_type: activeRoute.cargoType,
      cargo_quantity_mt: activeRoute.cargoQuantityMT,
      origin_port_code: activeRoute.portConstraints.loadingPort.unlocode,
      destination_port_code: activeRoute.portConstraints.dischargePort.unlocode,
      laycan_start: activeRoute.laycanStart,
      laycan_end: activeRoute.laycanEnd,
      target_arrival_date: activeRoute.desiredArrivalDate
    },
    market_context: {
      bunker_vlsfo_usd_mt: bunkerFuelPrice,
      demurrage_usd_day: demurrageRate,
      fx_rate_usd_inr: 83.4
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestInference = () => {
    setTested(true);
    setTimeout(() => setTested(false), 1800);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#30454D]/60 pb-3">
        <div>
          <h2 className="text-xl font-hud font-bold text-white tracking-wide uppercase">
            SYSTEM CONFIGURATION & ML MODEL INTEGRATION
          </h2>
          <p className="text-xs text-[#82949A]">
            Financial assumptions, default commercial thresholds, and future Python/FastAPI model ingestion endpoints.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-5 py-2 bg-[#F47B3A] hover:bg-[#FF9A5A] text-white text-xs font-hud font-bold uppercase rounded-lg shadow-md transition-all cursor-pointer"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'SETTINGS SAVED' : 'SAVE CONFIGURATION'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Operational & Commercial Parameters */}
        <div className="lg:col-span-7 space-y-6">
          {/* Commercial Assumptions */}
          <div className="card-shell p-6 space-y-4">
            <div className="flex items-center space-x-2.5 border-b border-[#30454D] pb-3">
              <Sliders className="w-4 h-4 text-[#F47B3A]" />
              <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
                COMMERCIAL DEFAULT PARAMETERS
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
                  DEFAULT PRESENTATION CURRENCY
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none"
                >
                  <option value="INR">₹ Indian Rupee (Crores)</option>
                  <option value="USD">$ US Dollars (Millions)</option>
                  <option value="EUR">€ Euros</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
                  DEFAULT DEMURRAGE RATE ($ / DAY)
                </label>
                <input
                  type="number"
                  value={demurrageRate}
                  onChange={(e) => setDemurrageRate(Number(e.target.value))}
                  className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
                  VLSFO BUNKER FUEL INDEX ($ / MT)
                </label>
                <input
                  type="number"
                  value={bunkerFuelPrice}
                  onChange={(e) => setBunkerFuelPrice(Number(e.target.value))}
                  className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
                  MINIMUM CONFIDENCE THRESHOLD
                </label>
                <div className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#4FA69A] flex items-center justify-between">
                  <span>75% (Charter Committee Limit)</span>
                  <span className="text-[10px] text-[#82949A]">ENFORCED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Rationale for Model Replacement */}
          <div className="card-shell p-6 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-hud font-bold text-[#4FA69A] uppercase tracking-wider">
              <Database className="w-4 h-4" />
              <span>FRONTEND-BACKEND INTEGRATION READINESS</span>
            </div>
            <p className="text-xs text-[#82949A] leading-relaxed">
              Every card, chart, and KPI in Charter AI reads from a single structured mock object (<code className="text-[#DCE5E7]">mockData.js</code>). When the production ML pipeline (e.g., CatBoost/Prophet ensemble trained on Baltic fixtures and AIS satellite telemetry) is deployed, replacing <code className="text-[#DCE5E7]">mockData.js</code> with an API fetch call will populate the entire UI with zero layout modifications.
            </p>
            <div className="p-3 bg-[#0D1A20] rounded-lg border border-[#30454D] text-xs font-mono-num text-[#DCE5E7] flex items-center justify-between">
              <span>ACTIVE DATA SCHEMA VERSION:</span>
              <span className="text-[#F47B3A]">charter-ai-v2.4-schema.json</span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): ML Model Endpoint Simulation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-shell p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#30454D] pb-3">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-[#F47B3A]" />
                <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
                  MODEL API ENDPOINT (SIMULATION)
                </h3>
              </div>
              <span className="text-[10px] font-mono-num text-[#4FA69A] bg-[#4FA69A]/10 border border-[#4FA69A]/30 px-1.5 py-0.5 rounded">
                REST / FASTAPI
              </span>
            </div>

            <div>
              <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
                INFERENCE SERVICE URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={modelEndpoint}
                  onChange={(e) => setModelEndpoint(e.target.value)}
                  className="flex-1 bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none"
                />
                <button
                  onClick={handleTestInference}
                  className="px-3 py-2 bg-[#20343C] hover:bg-[#30454D] border border-[#30454D] rounded-lg text-xs font-mono-num text-[#DCE5E7] flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${tested ? 'animate-spin text-[#4FA69A]' : ''}`} />
                  <span>{tested ? 'TESTING...' : 'PING'}</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] font-hud uppercase tracking-wider text-[#82949A] mb-1">
                <span>INFERENCE QUERY PAYLOAD PREVIEW</span>
                <span className="font-mono-num text-[#4FA69A]">JSON READY</span>
              </div>
              <pre className="p-3 bg-[#071014] border border-[#30454D] rounded-lg text-[10px] font-mono-num text-[#DCE5E7] overflow-x-auto max-h-56 leading-relaxed select-all">
                {JSON.stringify(samplePayload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
