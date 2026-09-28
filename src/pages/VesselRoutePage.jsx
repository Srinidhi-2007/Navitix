import React from 'react';
import { 
  Ship, 
  Sliders, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  BarChart3, 
  Sparkles, 
  SplitSquareVertical, 
  Navigation 
} from 'lucide-react';
import RouteMap from '../components/RouteMap';

export default function VesselRoutePage({ 
  activeRoute, 
  onSelectRoute, 
  routePresets = [],
  requestPayload = {},
  updateRequest,
  evaluateCustomVoyage,
  isLoading = false,
  applyScenario,
  loadingPorts = [],
  dischargePorts = [],
  routesList = [],
  validationWarning = null
}) {
  const cargoType = requestPayload.cargoType ?? activeRoute.cargoType ?? 'Coking Coal';
  const cargoQty = requestPayload.cargoQuantityMT ?? activeRoute.cargoQuantityMT ?? 50000;
  const originPortId = requestPayload.originPortId ?? activeRoute.portConstraints?.loadingPort?.id ?? 'hay-point';
  const destPortId = requestPayload.destinationPortId ?? activeRoute.portConstraints?.dischargePort?.id ?? 'paradip';
  const laycanStart = requestPayload.laycanStart ?? activeRoute.laycanStart ?? '2026-09-12';
  const laycanEnd = requestPayload.laycanEnd ?? activeRoute.laycanEnd ?? '2026-09-16';
  const arrivalDate = requestPayload.desiredArrivalDate ?? activeRoute.desiredArrivalDate ?? '2026-09-28';
  const allowSplit = requestPayload.allowSplit ?? true;

  const { portConstraints, candidateVessels = [] } = activeRoute;
  const loadingPort = portConstraints?.loadingPort || {};
  const dischargePort = portConstraints?.dischargePort || {};
  const draftComparisonChart = portConstraints?.draftComparisonChart || [];

  const handleFieldChange = (field, value) => {
    if (updateRequest) {
      updateRequest(field, value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      evaluateCustomVoyage?.();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#30454D]/60 pb-3">
        <div>
          <h2 className="text-xl font-hud font-bold text-white tracking-wide uppercase">
            VESSEL & ROUTE + PORT CONSTRAINTS
          </h2>
          <p className="text-xs text-[#82949A]">
            Define voyage parameters, evaluate port bathymetric envelopes, and inspect candidate fleet physical feasibility.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono-num bg-[#16262D] border border-[#30454D] px-3 py-1.5 rounded-lg">
          <span className="text-[#82949A]">DISCHARGE CONSTRAINT:</span>
          <span className="text-[#D9A441] font-bold">{dischargePort.maxDraftMeters || 14.5}m MAX DRAFT</span>
        </div>
      </div>

      {/* Origin == Destination Validation Guard */}
      {validationWarning && (
        <div className="bg-[#D9573F]/15 border border-[#D9573F]/40 p-4 rounded-xl flex items-center gap-3 text-xs text-[#D9573F] font-mono">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{validationWarning}</span>
        </div>
      )}

      {/* 3 Quick Scenario Buttons from getRoutes() */}
      <div className="card-shell p-4 bg-[#0D1A20] border-[#30454D] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-hud uppercase tracking-wider text-[#82949A] flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#F47B3A]" />
            <span>QUICK SCENARIOS (ROUTES.JSON BENCHMARKS)</span>
          </span>
          <span className="text-[10px] font-mono text-[#82949A]">Click to auto-populate voyage query</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {routesList.slice(0, 3).map((route) => {
            const isSelected = originPortId === route.originPortId && destPortId === route.destinationPortId;
            return (
              <button
                key={route.id}
                type="button"
                onClick={() => applyScenario ? applyScenario(route) : onSelectRoute?.(route.id)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#F47B3A]/10 border-[#F47B3A] text-white'
                    : 'bg-[#16262D] border-[#30454D] hover:border-[#4FA69A] text-[#DCE5E7]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-hud font-bold text-white uppercase tracking-wider">
                    {route.originPortId} &rarr; {route.destinationPortId}
                  </span>
                  {isSelected && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#F47B3A] text-black">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-[#82949A]">
                  {(route.defaultCargoMT || 50000).toLocaleString()} MT &middot; {route.defaultCargoType || 'Bulk Cargo'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Input Section (Interactive Voyage Controls) */}
      <div className="card-shell p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#30454D] pb-3">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-4 h-4 text-[#F47B3A]" />
            <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
              VOYAGE & CARGO SPECIFICATIONS (INPUT LAYER)
            </h3>
          </div>

          {/* Quick Route Preset Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono-num text-[#82949A] hidden sm:inline">PRESET:</span>
            <select
              value={activeRoute.id}
              onChange={(e) => onSelectRoute?.(e.target.value)}
              className="bg-[#0D1A20] border border-[#30454D] text-[#DCE5E7] text-xs rounded-lg px-2.5 py-1 focus:border-[#F47B3A] focus:outline-none cursor-pointer"
            >
              {routePresets.map(p => (
                <option key={p.id} value={p.id}>
                  {p.label || `${p.originPort} → ${p.destinationPort}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cargo Commodity */}
          <div>
            <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
              CARGO COMMODITY
            </label>
            <input
              type="text"
              value={cargoType}
              onChange={(e) => handleFieldChange('cargoType', e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none"
              placeholder="e.g. Coking Coal, Bauxite, Iron Ore"
            />
          </div>

          {/* Cargo Quantity (MT) */}
          <div>
            <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
              CARGO QUANTITY (MT)
            </label>
            <input
              type="number"
              min="1000"
              step="5000"
              value={cargoQty}
              onChange={(e) => handleFieldChange('cargoQuantityMT', Math.max(1, Number(e.target.value)))}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none font-bold"
              placeholder="50000"
            />
          </div>

          {/* Origin / Loading Port Dropdown from getPorts() */}
          <div>
            <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
              ORIGIN / LOADING PORT
            </label>
            <select
              value={originPortId}
              onChange={(e) => handleFieldChange('originPortId', e.target.value)}
              className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none cursor-pointer"
            >
              {loadingPorts.map((port) => (
                <option key={port.id} value={port.id} className="bg-[#16262D] text-[#DCE5E7]">
                  {port.name} ({port.country})
                </option>
              ))}
            </select>
          </div>

          {/* Destination / Discharge Port Dropdown from getPorts() */}
          <div>
            <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
              DESTINATION / DISCHARGE PORT
            </label>
            <select
              value={destPortId}
              onChange={(e) => handleFieldChange('destinationPortId', e.target.value)}
              className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none cursor-pointer"
            >
              {dischargePorts.map((port) => (
                <option key={port.id} value={port.id} className="bg-[#16262D] text-[#DCE5E7]">
                  {port.name} ({port.country})
                </option>
              ))}
            </select>
          </div>

          {/* Laycan Window Start */}
          <div>
            <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
              LAYCAN START DATE
            </label>
            <input
              type="date"
              value={laycanStart}
              onChange={(e) => handleFieldChange('laycanStart', e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none"
            />
          </div>

          {/* Laycan Window End */}
          <div>
            <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
              LAYCAN END DATE
            </label>
            <input
              type="date"
              value={laycanEnd}
              onChange={(e) => handleFieldChange('laycanEnd', e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none"
            />
          </div>

          {/* Desired Arrival Date */}
          <div>
            <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
              DESIRED ARRIVAL DATE
            </label>
            <input
              type="date"
              value={arrivalDate}
              onChange={(e) => handleFieldChange('desiredArrivalDate', e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none"
            />
          </div>

          {/* Allow Split Parcel Toggle */}
          <div className="flex flex-col justify-end">
            <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
              PARCEL SPLIT LOGIC
            </label>
            <button
              type="button"
              onClick={() => handleFieldChange('allowSplit', !allowSplit)}
              className={`w-full rounded-lg px-3 py-2 text-xs font-mono-num border flex items-center justify-between transition-colors ${
                allowSplit 
                  ? 'bg-[#4FA69A]/15 border-[#4FA69A] text-[#4FA69A]' 
                  : 'bg-[#0D1A20] border-[#30454D] text-[#82949A]'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>ALLOW MULTI-VOYAGE</span>
              </span>
              <span className="font-bold">{allowSplit ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Action Button & Evaluation Feedback Bar */}
        <div className="pt-4 border-t border-[#30454D] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs font-mono text-[#82949A]">
            <span className={`w-2.5 h-2.5 rounded-full ${isLoading ? 'bg-[#F47B3A] animate-ping' : 'bg-[#4FA69A] animate-pulse'}`} />
            <div>
              <span className="text-[#DCE5E7] font-semibold">
                Target: {cargoQty.toLocaleString()} MT {cargoType}
              </span>
              <span className="text-[#82949A] ml-2">
                ({originPortId} &rarr; {destPortId})
              </span>
              <span className="text-[10px] text-[#82949A] block sm:inline sm:ml-2">
                &middot; Press Enter or click button to run AI evaluation
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => evaluateCustomVoyage ? evaluateCustomVoyage() : updateRequest?.({})}
            disabled={isLoading}
            className={`px-8 py-3 rounded-lg text-xs font-hud font-bold uppercase tracking-wider transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 cursor-pointer ${
              isLoading
                ? 'bg-[#20343C] text-[#82949A] border border-[#30454D] cursor-not-allowed'
                : 'bg-[#F47B3A] hover:bg-[#FF9A5A] text-white shadow-[#F47B3A]/30 hover:shadow-[#F47B3A]/50 hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>EVALUATING MODEL & PREDICTING...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>RUN MODEL EVALUATION & PREDICT</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Geodetic Voyage Track & Port Bathymetry Map (Leaflet) */}
      <RouteMap 
        activeRoute={activeRoute} 
        portsList={loadingPorts.concat(dischargePorts)} 
      />

      {/* 2. Feasible Vessel Types Grid (Live Model Evaluated) */}
      <div className="card-shell p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#30454D] pb-3">
          <div className="flex items-center space-x-2.5">
            <Ship className="w-4 h-4 text-[#4FA69A]" />
            <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
              FEASIBLE VESSEL CANDIDATES (LIVE EVALUATION FOR {cargoQty.toLocaleString()} MT)
            </h3>
          </div>
          <span className="text-[11px] font-mono-num text-[#82949A]">
            EVALUATING 4 BULK CARRIER SEGMENTS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {candidateVessels.map((vessel) => {
            const isFeas = vessel.isFeasible;
            const isRec = vessel.isRecommended;

            return (
              <div
                key={vessel.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isRec
                    ? 'card-recommended'
                    : isFeas
                    ? 'bg-[#16262D] border-[#30454D] hover:border-[#4FA69A]/50'
                    : 'bg-[#16262D]/60 border-[#D9573F]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🚢</span>
                    <div className="flex items-center space-x-1.5">
                      {isRec ? (
                        <span className="text-xs font-mono-num font-bold text-[#F47B3A] bg-[#F47B3A]/15 border border-[#F47B3A]/40 px-2 py-0.5 rounded">
                          RECOMMENDED
                        </span>
                      ) : isFeas ? (
                        <span className="flex items-center space-x-1 text-xs font-mono-num font-bold text-[#4FA69A] bg-[#4FA69A]/10 border border-[#4FA69A]/30 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>FEASIBLE</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-xs font-mono-num font-bold text-[#D9573F] bg-[#D9573F]/10 border border-[#D9573F]/30 px-2 py-0.5 rounded">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>RESTRICTED</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="font-hud font-bold text-base text-white tracking-wide uppercase">
                    {vessel.name}
                  </div>
                  <div className="text-[11px] font-mono-num text-[#82949A] mt-0.5">
                    Capacity: {vessel.capacityMT.toLocaleString()} MT &middot; {vessel.voyageCount ? `${vessel.voyageCount} Voyage(s)` : `DWT ${vessel.dwt?.toLocaleString() || 'N/A'}`}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#30454D] grid grid-cols-2 gap-2 text-[11px] font-mono-num">
                    <div>
                      <span className="text-[#82949A] block text-[9px] uppercase font-hud">DRAFT</span>
                      <span className={vessel.draftMeters > (dischargePort.maxDraftMeters || 14.5) ? 'text-[#D9573F] font-bold' : 'text-[#DCE5E7]'}>
                        {vessel.draftMeters} m
                      </span>
                    </div>
                    <div>
                      <span className="text-[#82949A] block text-[9px] uppercase font-hud">TOTAL COST</span>
                      <span className="text-white font-bold">
                        {vessel.costBreakdownCr ? `₹${vessel.costBreakdownCr.total.toFixed(2)} Cr` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#30454D]">
                  <p className={`text-xs leading-relaxed ${
                    isFeas ? 'text-[#82949A]' : 'text-[#D9573F] font-medium'
                  }`}>
                    {vessel.feasibilityReason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Port Constraints (Loading and Discharge Port Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loading Port Card */}
        <div className="card-shell p-6 space-y-4">
          <div className="flex items-start justify-between border-b border-[#30454D] pb-3">
            <div>
              <span className="text-[10px] font-hud uppercase tracking-wider text-[#4FA69A] font-bold">
                ORIGIN HARBOUR SPECIFICATIONS
              </span>
              <h3 className="font-hud font-bold text-base text-white tracking-wide uppercase flex items-center space-x-2 mt-0.5">
                <span>{loadingPort.flag || '🇦🇺'}</span>
                <span>{loadingPort.name || activeRoute.originPort}</span>
              </h3>
              <p className="text-[11px] font-mono-num text-[#82949A]">
                UN/LOCODE: {loadingPort.unlocode || 'N/A'} &middot; Coordinates: {loadingPort.coordinates || 'N/A'}
              </p>
            </div>
            <span className="text-xs font-mono-num bg-[#0D1A20] border border-[#30454D] px-2.5 py-1 rounded text-[#82949A]">
              LOADING BERTH
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-2.5 bg-[#0D1A20] border border-[#30454D] rounded-lg">
              <span className="text-[9px] font-hud uppercase tracking-wider text-[#82949A] block">MAX DRAFT</span>
              <span className="text-base font-mono-num font-bold text-[#4FA69A]">{loadingPort.maxDraftMeters || 19.5} m</span>
            </div>
            <div className="p-2.5 bg-[#0D1A20] border border-[#30454D] rounded-lg">
              <span className="text-[9px] font-hud uppercase tracking-wider text-[#82949A] block">BERTH LENGTH</span>
              <span className="text-base font-mono-num font-bold text-[#DCE5E7]">{loadingPort.berthLengthMeters || 350} m</span>
            </div>
            <div className="p-2.5 bg-[#0D1A20] border border-[#30454D] rounded-lg">
              <span className="text-[9px] font-hud uppercase tracking-wider text-[#82949A] block">MAX LOA</span>
              <span className="text-base font-mono-num font-bold text-[#DCE5E7]">{loadingPort.maxLoaMeters || 300} m</span>
            </div>
            <div className="p-2.5 bg-[#0D1A20] border border-[#30454D] rounded-lg">
              <span className="text-[9px] font-hud uppercase tracking-wider text-[#82949A] block">LOAD CAPACITY</span>
              <span className="text-base font-mono-num font-bold text-[#DCE5E7]">{loadingPort.handlingCapacityMTPD ? loadingPort.handlingCapacityMTPD.toLocaleString() : '65,000'} <span className="text-[9px] font-normal text-[#82949A]">MT/D</span></span>
            </div>
          </div>

          {/* Loading Port Suitability Table */}
          <div className="space-y-1.5 pt-2">
            <div className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] mb-1">
              VESSEL SUITABILITY AT LOADING BERTH
            </div>
            <div className="space-y-1.5">
              {['handysize', 'supramax', 'panamax', 'capesize'].map((typeKey) => {
                const suit = loadingPort.suitability?.[typeKey];
                const isPass = suit ? suit.feasible : true;
                return (
                  <div key={typeKey} className="flex items-center justify-between p-2 rounded bg-[#0D1A20] border border-[#30454D] text-xs">
                    <span className="font-hud uppercase tracking-wider text-[#DCE5E7] font-semibold">
                      {typeKey}
                    </span>
                    <span className="flex items-center space-x-1 text-[#4FA69A] font-mono-num">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{suit?.reason || 'Compliant with loading berth limits'}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Discharge Port Card */}
        <div className="card-shell p-6 space-y-4 border-l-4 border-l-[#D9A441]">
          <div className="flex items-start justify-between border-b border-[#30454D] pb-3">
            <div>
              <span className="text-[10px] font-hud uppercase tracking-wider text-[#D9A441] font-bold">
                DESTINATION HARBOUR SPECIFICATIONS (RESTRICTIVE)
              </span>
              <h3 className="font-hud font-bold text-base text-white tracking-wide uppercase flex items-center space-x-2 mt-0.5">
                <span>{dischargePort.flag || '🇮🇳'}</span>
                <span>{dischargePort.name || activeRoute.destinationPort}</span>
              </h3>
              <p className="text-[11px] font-mono-num text-[#82949A]">
                UN/LOCODE: {dischargePort.unlocode || 'N/A'} &middot; Coordinates: {dischargePort.coordinates || 'N/A'}
              </p>
            </div>
            <span className="text-xs font-mono-num bg-[#0D1A20] border border-[#D9A441]/40 text-[#D9A441] px-2.5 py-1 rounded">
              DRAFT LIMIT {dischargePort.maxDraftMeters || 14.5}M
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-2.5 bg-[#0D1A20] border border-[#D9A441]/40 rounded-lg">
              <span className="text-[9px] font-hud uppercase tracking-wider text-[#D9A441] block">MAX DRAFT</span>
              <span className="text-base font-mono-num font-bold text-[#D9A441]">{dischargePort.maxDraftMeters || 14.5} m</span>
            </div>
            <div className="p-2.5 bg-[#0D1A20] border border-[#30454D] rounded-lg">
              <span className="text-[9px] font-hud uppercase tracking-wider text-[#82949A] block">BERTH LENGTH</span>
              <span className="text-base font-mono-num font-bold text-[#DCE5E7]">{dischargePort.berthLengthMeters || 260} m</span>
            </div>
            <div className="p-2.5 bg-[#0D1A20] border border-[#30454D] rounded-lg">
              <span className="text-[9px] font-hud uppercase tracking-wider text-[#82949A] block">MAX LOA</span>
              <span className="text-base font-mono-num font-bold text-[#DCE5E7]">{dischargePort.maxLoaMeters || 230} m</span>
            </div>
            <div className="p-2.5 bg-[#0D1A20] border border-[#30454D] rounded-lg">
              <span className="text-[9px] font-hud uppercase tracking-wider text-[#82949A] block">DISCH CAPACITY</span>
              <span className="text-base font-mono-num font-bold text-[#DCE5E7]">{dischargePort.handlingCapacityMTPD ? dischargePort.handlingCapacityMTPD.toLocaleString() : '35,000'} <span className="text-[9px] font-normal text-[#82949A]">MT/D</span></span>
            </div>
          </div>

          {/* Discharge Port Suitability Table */}
          <div className="space-y-1.5 pt-2">
            <div className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] mb-1">
              VESSEL SUITABILITY AT DISCHARGE BERTH
            </div>
            <div className="space-y-1.5">
              {['handysize', 'supramax', 'panamax', 'capesize'].map((typeKey) => {
                const suit = dischargePort.suitability?.[typeKey];
                const isPass = suit ? suit.feasible : (typeKey !== 'capesize');
                const reason = suit?.reason || (isPass ? 'Compliant with channel draft' : 'Draft exceeds permissible limit');
                return (
                  <div key={typeKey} className="flex items-center justify-between p-2 rounded bg-[#0D1A20] border border-[#30454D] text-xs">
                    <span className="font-hud uppercase tracking-wider text-[#DCE5E7] font-semibold">
                      {typeKey}
                    </span>
                    <span className={`flex items-center space-x-1 font-mono-num ${isPass ? 'text-[#4FA69A]' : 'text-[#D9573F] font-bold'}`}>
                      {isPass ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Feasible ({reason.split(';')[0]})</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>RESTRICTED ({reason.split('.')[0]})</span>
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Port Feasibility Bar Chart per Vessel Type */}
      <div className="card-shell p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#30454D] pb-3">
          <div className="flex items-center space-x-2.5">
            <BarChart3 className="w-4 h-4 text-[#F47B3A]" />
            <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
              PORT DRAFT FEASIBILITY SPECTRUM (VESSEL DRAFT VS PORT PERMISSIBLE DEPTH)
            </h3>
          </div>
          <span className="text-xs font-mono-num text-[#82949A]">
            PORT LIMIT: <strong className="text-[#D9A441]">{dischargePort.maxDraftMeters || 14.5}m</strong>
          </span>
        </div>

        <p className="text-xs text-[#82949A]">
          Live comparison of vessel laden draft against discharge port draft limit ({dischargePort.name || activeRoute.destinationPort}).
          Full teal bar represents safety clearance; red-orange indicates channel depth violation.
        </p>

        <div className="space-y-4 pt-2">
          {draftComparisonChart.map((row) => {
            const isCompliant = row.status === 'compliant';
            const maxScale = 22;
            const requiredPct = Math.min(100, (row.requiredDraft / maxScale) * 100);
            const portLimitPct = (row.portLimit / maxScale) * 100;

            return (
              <div key={row.vessel} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono-num">
                  <span className="font-hud font-bold text-[#DCE5E7] uppercase tracking-wide">
                    {row.vessel}
                  </span>
                  <div className="flex items-center space-x-3 text-[11px]">
                    <span className="text-[#82949A]">Draft: <strong className="text-[#DCE5E7]">{row.requiredDraft}m</strong></span>
                    <span className="text-[#82949A]">Limit: <strong>{row.portLimit}m</strong></span>
                    <span className={`font-bold ${isCompliant ? 'text-[#4FA69A]' : 'text-[#D9573F]'}`}>
                      {isCompliant ? `+${row.clearance.toFixed(1)}m Clearance (PASS)` : `${row.clearance.toFixed(1)}m Exceeded (FAIL)`}
                    </span>
                  </div>
                </div>

                {/* Progress Bar Envelope */}
                <div className="relative h-6 bg-[#0D1A20] rounded-lg border border-[#30454D] overflow-hidden">
                  {/* Port Limit Marker Line */}
                  <div 
                    className="absolute top-0 bottom-0 w-[2px] bg-[#D9A441] z-10"
                    style={{ left: `${portLimitPct}%` }}
                    title={`Port Limit: ${row.portLimit}m`}
                  />

                  {/* Vessel Draft Bar */}
                  <div
                    className={`h-full rounded-r transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-mono-num font-bold text-white ${
                      isCompliant 
                        ? 'bg-[#4FA69A]' 
                        : 'bg-[#D9573F]'
                    }`}
                    style={{ width: `${requiredPct}%` }}
                  >
                    {row.requiredDraft}m
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
