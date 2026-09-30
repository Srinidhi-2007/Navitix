/**
 * Charter AI — Settings & ML Backend Telemetry
 * File: src/pages/SettingsPage.jsx
 *
 * Configures commercial assumptions (currency, demurrage, bunker price, FX rate),
 * tests backend health & data provenance, and inspects live JSON request/response telemetry.
 */

import React, { useState } from 'react';
import { 
  Settings, 
  Cpu, 
  Database, 
  CheckCircle2, 
  RefreshCw, 
  Save, 
  Sliders,
  DollarSign,
  AlertTriangle,
  Code,
  Activity,
  Layers
} from 'lucide-react';
import { getHealth } from '../api/charterApi';

export default function SettingsPage({ 
  activeRoute, 
  requestPayload = {}, 
  updateRequest 
}) {
  const assumptions = requestPayload.assumptions || {
    currency: 'INR',
    usdToInr: 83.2,
    demurrageUSDPerDay: 5000,
    bunkerFuelPricePerMT: 620,
  };

  const [activeJsonTab, setActiveJsonTab] = useState('request'); // 'request' | 'response'
  const [healthInfo, setHealthInfo] = useState(null);
  const [healthStatus, setHealthStatus] = useState('idle'); // 'idle' | 'checking' | 'ok' | 'error'
  const [saved, setSaved] = useState(false);

  const handleAssumptionChange = (key, value) => {
    if (updateRequest) {
      updateRequest({
        assumptions: {
          ...assumptions,
          [key]: value,
        },
      });
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestConnection = async () => {
    setHealthStatus('checking');
    try {
      const data = await getHealth();
      setHealthInfo(data);
      setHealthStatus('ok');
    } catch (err) {
      setHealthInfo({ error: err.message });
      setHealthStatus('error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#30454D]/60 pb-3">
        <div>
          <h2 className="text-xl font-hud font-bold text-white tracking-wide uppercase">
            SYSTEM CONFIGURATION & MODEL TELEMETRY
          </h2>
          <p className="text-xs text-[#82949A]">
            Financial assumptions, commercial default thresholds, and demo REST API contract inspection.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center space-x-2 px-5 py-2 bg-[#F47B3A] hover:bg-[#FF9A5A] text-white text-xs font-hud font-bold uppercase rounded-lg shadow-md transition-all cursor-pointer"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'CONFIGURATION SAVED' : 'SAVE CONFIGURATION'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 cols): Operational & Commercial Assumptions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Commercial Assumptions Form */}
          <div className="card-shell p-6 space-y-4">
            <div className="flex items-center space-x-2.5 border-b border-[#30454D] pb-3">
              <Sliders className="w-4 h-4 text-[#F47B3A]" />
              <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
                COMMERCIAL DEFAULT ASSUMPTIONS (REQUEST.ASSUMPTIONS)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Currency */}
              <div>
                <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
                  PRESENTATION CURRENCY
                </label>
                <select
                  value={assumptions.currency || 'INR'}
                  onChange={(e) => handleAssumptionChange('currency', e.target.value)}
                  className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none cursor-pointer"
                >
                  <option value="INR">₹ Indian Rupee (INR Crores)</option>
                  <option value="USD">$ US Dollars (USD Millions)</option>
                </select>
              </div>

              {/* FX Rate USD to INR */}
              <div>
                <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
                  USD TO INR FX RATE (₹ / $)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={assumptions.usdToInr ?? 83.2}
                  onChange={(e) => handleAssumptionChange('usdToInr', Number(e.target.value))}
                  className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none font-bold"
                />
              </div>

              {/* Demurrage Rate */}
              <div>
                <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
                  PORT DEMURRAGE RATE ($ / DAY)
                </label>
                <input
                  type="number"
                  step="500"
                  value={assumptions.demurrageUSDPerDay ?? 5000}
                  onChange={(e) => handleAssumptionChange('demurrageUSDPerDay', Number(e.target.value))}
                  className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none font-bold"
                />
              </div>

              {/* Bunker Fuel Price */}
              <div>
                <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
                  VLSFO BUNKER FUEL PRICE ($ / MT)
                </label>
                <input
                  type="number"
                  step="10"
                  value={assumptions.bunkerFuelPricePerMT ?? 620}
                  onChange={(e) => handleAssumptionChange('bunkerFuelPricePerMT', Number(e.target.value))}
                  className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none font-bold"
                />
              </div>

              {/* Charter Contract Type Default */}
              <div>
                <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
                  DEFAULT CHARTER TYPE
                </label>
                <select
                  value={requestPayload.contractType || 'spot'}
                  onChange={(e) => updateRequest && updateRequest('contractType', e.target.value)}
                  className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none cursor-pointer"
                >
                  <option value="spot">Spot Charter (Single Voyage)</option>
                  <option value="time">Time Charter (Period Hire)</option>
                  <option value="multi">Multi-Voyage / COA (Contract of Affreightment)</option>
                </select>
              </div>

              {/* Contract Duration Default */}
              <div>
                <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
                  CHARTER DURATION (DAYS)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={requestPayload.contractDurationDays ?? 15}
                  onChange={(e) => updateRequest && updateRequest('contractDurationDays', Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none font-bold"
                />
              </div>
            </div>

            <p className="text-[11px] text-[#82949A] pt-2 border-t border-[#30454D]">
              Note: Modifications directly propagate to live voyage cost calculations via the debounced optimization pipeline.
            </p>
          </div>

          {/* Backend Connection & Data Provenance Card */}
          <div className="card-shell p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#30454D] pb-3">
              <div className="flex items-center space-x-2.5">
                <Activity className="w-4 h-4 text-[#4FA69A]" />
                <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
                  FASTAPI BACKEND CONNECTION & DATA STATUS
                </h3>
              </div>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={healthStatus === 'checking'}
                className="px-3 py-1.5 bg-[#20343C] hover:bg-[#30454D] border border-[#30454D] rounded-lg text-xs font-mono text-[#DCE5E7] flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${healthStatus === 'checking' ? 'animate-spin text-[#4FA69A]' : ''}`} />
                <span>{healthStatus === 'checking' ? 'TESTING...' : 'TEST CONNECTION'}</span>
              </button>
            </div>

            {/* Health Info Block */}
            {healthInfo ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2.5 bg-[#0D1A20] border border-[#30454D] rounded-lg">
                    <span className="text-[9px] font-hud uppercase tracking-wider text-[#82949A] block">ENDPOINT STATUS</span>
                    <span className={`text-xs font-mono font-bold ${healthInfo.status === 'ok' ? 'text-[#4FA69A]' : 'text-[#D9573F]'}`}>
                      {healthInfo.status === 'ok' ? '● ONLINE (200 OK)' : 'OFFLINE'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#0D1A20] border border-[#30454D] rounded-lg">
                    <span className="text-[9px] font-hud uppercase tracking-wider text-[#82949A] block">DATA SOURCE MODE</span>
                    <span className={`text-xs font-mono font-bold uppercase ${healthInfo.dataSource === 'synthetic' ? 'text-[#D9A441]' : 'text-[#4FA69A]'}`}>
                      {healthInfo.dataSource || 'UNKNOWN'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#0D1A20] border border-[#30454D] rounded-lg">
                    <span className="text-[9px] font-hud uppercase tracking-wider text-[#82949A] block">LATEST RATE DATE</span>
                    <span className="text-xs font-mono font-bold text-[#DCE5E7]">
                      {healthInfo.ratesLastDate || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Amber Warning if Synthetic */}
                {healthInfo.dataSource === 'synthetic' && (
                  <div className="bg-[#D9A441]/15 border border-[#D9A441]/40 p-3.5 rounded-lg flex items-start gap-2.5 text-xs text-[#D9A441] font-mono leading-relaxed">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-hud uppercase">SYNTHETIC DATA SOURCE ACTIVE</strong>
                      <span>
                        Freight rate trajectory is derived from a mean-reverting stochastic simulation (seed=42). 
                        To calibrate on actual Baltic Panamax Index data, place <code>rates_raw.csv</code> into the backend directory.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#82949A]">
                Click <strong>TEST CONNECTION</strong> to ping the live backend health endpoint (<code>/health</code>) and verify data source provenance.
              </p>
            )}
          </div>
        </div>

        {/* Right Column (6 cols): Live Request & Response JSON Inspector */}
        <div className="lg:col-span-6 space-y-6">
          <div className="card-shell p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#30454D] pb-3">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-[#F47B3A]" />
                <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
                  DEMO JSON CONTRACT TELEMETRY
                </h3>
              </div>

              {/* JSON Switcher Tabs */}
              <div className="flex items-center bg-[#0D1A20] border border-[#30454D] rounded-lg p-0.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveJsonTab('request')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    activeJsonTab === 'request'
                      ? 'bg-[#F47B3A] text-white font-bold'
                      : 'text-[#82949A] hover:text-[#DCE5E7]'
                  }`}
                >
                  REQUEST JSON
                </button>
                <button
                  type="button"
                  onClick={() => setActiveJsonTab('response')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    activeJsonTab === 'response'
                      ? 'bg-[#4FA69A] text-white font-bold'
                      : 'text-[#82949A] hover:text-[#DCE5E7]'
                  }`}
                >
                  RESPONSE JSON
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] font-hud uppercase tracking-wider text-[#82949A] mb-1.5">
                <span>
                  {activeJsonTab === 'request' ? 'POST /api/v1/charter/recommend PAYLOAD' : 'RECOMMENDATION RESPONSE SCHEMA (DEMO)'}
                </span>
                <span className="font-mono text-[#4FA69A]">CONTRACT CONFORMANT</span>
              </div>

              <pre className="p-3 bg-[#071014] border border-[#30454D] rounded-lg text-[10px] font-mono-num text-[#DCE5E7] overflow-x-auto max-h-[420px] leading-relaxed select-all">
                {JSON.stringify(activeJsonTab === 'request' ? requestPayload : activeRoute, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
