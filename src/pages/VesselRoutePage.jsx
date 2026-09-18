import React, { useState } from 'react';
import { 
  Ship, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  Anchor, 
  Info,
  AlertTriangle,
  ArrowRight,
  BarChart3
} from 'lucide-react';

export default function VesselRoutePage({ activeRoute, onSelectRoute, routePresets }) {
  const [cargoQty, setCargoQty] = useState(activeRoute.cargoQuantityMT);
  const [cargoType, setCargoType] = useState(activeRoute.cargoType);
  const [laycanDate, setLaycanDate] = useState(activeRoute.laycanStart);
  const [arrivalDate, setArrivalDate] = useState(activeRoute.desiredArrivalDate);
  const [loadWindow, setLoadWindow] = useState(activeRoute.loadingWindow);
  const [dischWindow, setDischWindow] = useState(activeRoute.dischargeWindow);

  const { portConstraints, candidateVessels } = activeRoute;
  const { loadingPort, dischargePort, draftComparisonChart } = portConstraints;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#30454D]/60 pb-3">
        <div>
          <h2 className="text-xl font-hud font-bold text-white tracking-wide uppercase">
            VESSEL & ROUTE + PORT CONSTRAINTS
          </h2>
          <p className="text-xs text-[#82949A]">
            Define voyage parameters, evaluate port draft envelopes, and inspect candidate fleet physical feasibility.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono-num bg-[#16262D] border border-[#30454D] px-3 py-1.5 rounded-lg">
          <span className="text-[#82949A]">DISCHARGE CONSTRAINT:</span>
          <span className="text-[#D9A441] font-bold">14.5m MAX DRAFT</span>
        </div>
      </div>

      {/* 1. Input Section (Top Interactive Voyage Controls) */}
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
            <span className="text-[11px] font-mono-num text-[#82949A] hidden sm:inline">PRESET ROUTE:</span>
            <select
              value={activeRoute.id}
              onChange={(e) => onSelectRoute(e.target.value)}
              className="bg-[#0D1A20] border border-[#30454D] text-[#DCE5E7] text-xs rounded-lg px-2.5 py-1 focus:border-[#F47B3A] focus:outline-none"
            >
              {routePresets.map(p => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cargo Type */}
          <div>
            <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
              CARGO COMMODITY
            </label>
            <input
              type="text"
              value={cargoType}
              onChange={(e) => setCargoType(e.target.value)}
              className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none"
            />
          </div>

          {/* Cargo Quantity */}
          <div>
            <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
              CARGO QUANTITY (MT)
            </label>
            <input
              type="number"
              value={cargoQty}
              onChange={(e) => setCargoQty(Number(e.target.value))}
              className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none"
            />
          </div>

          {/* Origin Port */}
          <div>
            <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
              ORIGIN / LOADING PORT
            </label>
            <div className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] flex items-center justify-between">
              <span>{activeRoute.originPort}</span>
              <span className="text-base">{activeRoute.originFlag}</span>
            </div>
          </div>

          {/* Destination Port */}
          <div>
            <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
              DESTINATION / DISCHARGE PORT
            </label>
            <div className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] flex items-center justify-between">
              <span>{activeRoute.destinationPort}</span>
              <span className="text-base">{activeRoute.destinationFlag}</span>
            </div>
          </div>

          {/* Laycan Window Start */}
          <div>
            <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
              DESIRED LAYCAN COMMENCE
            </label>
            <div className="relative">
              <input
                type="date"
                value={laycanDate}
                onChange={(e) => setLaycanDate(e.target.value)}
                className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none"
              />
            </div>
          </div>

          {/* Desired Arrival Date */}
          <div>
            <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
              DESIRED ARRIVAL DATE
            </label>
            <div className="relative">
              <input
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none"
              />
            </div>
          </div>

          {/* Loading Window */}
          <div>
            <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
              LOADING LAYTIME ALLOWANCE
            </label>
            <input
              type="text"
              value={loadWindow}
              onChange={(e) => setLoadWindow(e.target.value)}
              className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none"
            />
          </div>

          {/* Discharge Window */}
          <div>
            <label className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block mb-1">
              DISCHARGE LAYTIME ALLOWANCE
            </label>
            <input
              type="text"
              value={dischWindow}
              onChange={(e) => setDischWindow(e.target.value)}
              className="w-full bg-[#0D1A20] border border-[#30454D] rounded-lg px-3 py-2 text-xs font-mono-num text-[#DCE5E7] focus:border-[#F47B3A] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Feasible Vessel Types Grid (✓ or ✗ with one-line reason) */}
      <div className="card-shell p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#30454D] pb-3">
          <div className="flex items-center space-x-2.5">
            <Ship className="w-4 h-4 text-[#4FA69A]" />
            <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
              FEASIBLE VESSEL CANDIDATES (PORT & LOT MATCHING)
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
                      {isFeas ? (
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
                    Capacity: {vessel.capacityMT.toLocaleString()} MT · DWT {vessel.dwt ? vessel.dwt.toLocaleString() : 'N/A'}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#30454D] grid grid-cols-2 gap-2 text-[11px] font-mono-num">
                    <div>
                      <span className="text-[#82949A] block text-[9px] uppercase font-hud">DRAFT</span>
                      <span className={vessel.draftMeters > 14.5 ? 'text-[#D9573F] font-bold' : 'text-[#DCE5E7]'}>
                        {vessel.draftMeters} m
                      </span>
                    </div>
                    <div>
                      <span className="text-[#82949A] block text-[9px] uppercase font-hud">LOA / BEAM</span>
                      <span className="text-[#DCE5E7]">{vessel.loaMeters}m / {vessel.beamMeters}m</span>
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

      {/* 3. Port Constraints (Side by Side Loading and Discharge Port Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loading Port Card */}
        <div className="card-shell p-6 space-y-4">
          <div className="flex items-start justify-between border-b border-[#30454D] pb-3">
            <div>
              <span className="text-[10px] font-hud uppercase tracking-wider text-[#4FA69A] font-bold">
                ORIGIN HARBOUR SPECIFICATIONS
              </span>
              <h3 className="font-hud font-bold text-base text-white tracking-wide uppercase flex items-center space-x-2 mt-0.5">
                <span>{loadingPort.flag}</span>
                <span>{loadingPort.name}</span>
              </h3>
              <p className="text-[11px] font-mono-num text-[#82949A]">
                UN/LOCODE: {loadingPort.unlocode || 'N/A'} · Coordinates: {loadingPort.coordinates || 'N/A'}
              </p>
            </div>
            <span className="text-xs font-mono-num bg-[#0D1A20] border border-[#30454D] px-2.5 py-1 rounded text-[#82949A]">
              LOADING BERTH
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-2.5 bg-[#0D1A20] border border-[#30454D] rounded-lg">
              <span className="text-[9px] font-hud uppercase tracking-wider text-[#82949A] block">MAX DRAFT</span>
              <span className="text-base font-mono-num font-bold text-[#4FA69A]">{loadingPort.maxDraftMeters} m</span>
            </div>
            <div className="p-2.5 bg-[#0D1A20] border border-[#30454D] rounded-lg">
              <span className="text-[9px] font-hud uppercase tracking-wider text-[#82949A] block">BERTH LENGTH</span>
              <span className="text-base font-mono-num font-bold text-[#DCE5E7]">{loadingPort.berthLengthMeters} m</span>
            </div>
            <div className="p-2.5 bg-[#0D1A20] border border-[#30454D] rounded-lg">
              <span className="text-[9px] font-hud uppercase tracking-wider text-[#82949A] block">MAX LOA</span>
              <span className="text-base font-mono-num font-bold text-[#DCE5E7]">{loadingPort.maxLoaMeters} m</span>
            </div>
            <div className="p-2.5 bg-[#0D1A20] border border-[#30454D] rounded-lg">
              <span className="text-[9px] font-hud uppercase tracking-wider text-[#82949A] block">LOAD CAPACITY</span>
              <span className="text-base font-mono-num font-bold text-[#DCE5E7]">{loadingPort.handlingCapacityMTPD.toLocaleString()} <span className="text-[9px] font-normal text-[#82949A]">MT/D</span></span>
            </div>
          </div>

          {/* Loading Port Suitability Table */}
          <div className="space-y-1.5 pt-2">
            <div className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] mb-1">
              VESSEL SUITABILITY AT LOADING BERTH
            </div>
            <div className="space-y-1.5">
              {['handysize', 'supramax', 'panamax', 'capesize'].map((typeKey) => {
                const suit = loadingPort.suitability[typeKey];
                if (!suit) return null;
                return (
                  <div key={typeKey} className="flex items-center justify-between p-2 rounded bg-[#0D1A20] border border-[#30454D] text-xs">
                    <span className="font-hud uppercase tracking-wider text-[#DCE5E7] font-semibold">
                      {typeKey}
                    </span>
                    <span className="flex items-center space-x-1 text-[#4FA69A] font-mono-num">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Compliant</span>
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
                <span>{dischargePort.flag}</span>
                <span>{dischargePort.name}</span>
              </h3>
              <p className="text-[11px] font-mono-num text-[#82949A]">
                UN/LOCODE: {dischargePort.unlocode || 'N/A'} · Coordinates: {dischargePort.coordinates || 'N/A'}
              </p>
            </div>
            <span className="text-xs font-mono-num bg-[#0D1A20] border border-[#D9A441]/40 text-[#D9A441] px-2.5 py-1 rounded">
              DRAFT LIMIT 14.5M
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-2.5 bg-[#0D1A20] border border-[#D9A441]/40 rounded-lg">
              <span className="text-[9px] font-hud uppercase tracking-wider text-[#D9A441] block">MAX DRAFT</span>
              <span className="text-base font-mono-num font-bold text-[#D9A441]">{dischargePort.maxDraftMeters} m</span>
            </div>
            <div className="p-2.5 bg-[#0D1A20] border border-[#30454D] rounded-lg">
              <span className="text-[9px] font-hud uppercase tracking-wider text-[#82949A] block">BERTH LENGTH</span>
              <span className="text-base font-mono-num font-bold text-[#DCE5E7]">{dischargePort.berthLengthMeters} m</span>
            </div>
            <div className="p-2.5 bg-[#0D1A20] border border-[#30454D] rounded-lg">
              <span className="text-[9px] font-hud uppercase tracking-wider text-[#82949A] block">MAX LOA</span>
              <span className="text-base font-mono-num font-bold text-[#DCE5E7]">{dischargePort.maxLoaMeters} m</span>
            </div>
            <div className="p-2.5 bg-[#0D1A20] border border-[#30454D] rounded-lg">
              <span className="text-[9px] font-hud uppercase tracking-wider text-[#82949A] block">DISCH CAPACITY</span>
              <span className="text-base font-mono-num font-bold text-[#DCE5E7]">{dischargePort.handlingCapacityMTPD.toLocaleString()} <span className="text-[9px] font-normal text-[#82949A]">MT/D</span></span>
            </div>
          </div>

          {/* Discharge Port Suitability Table */}
          <div className="space-y-1.5 pt-2">
            <div className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] mb-1">
              VESSEL SUITABILITY AT DISCHARGE BERTH
            </div>
            <div className="space-y-1.5">
              {['handysize', 'supramax', 'panamax', 'capesize'].map((typeKey) => {
                const suit = dischargePort.suitability[typeKey];
                if (!suit) return null;
                const isPass = suit.feasible;
                return (
                  <div key={typeKey} className="flex items-center justify-between p-2 rounded bg-[#0D1A20] border border-[#30454D] text-xs">
                    <span className="font-hud uppercase tracking-wider text-[#DCE5E7] font-semibold">
                      {typeKey}
                    </span>
                    <span className={`flex items-center space-x-1 font-mono-num ${isPass ? 'text-[#4FA69A]' : 'text-[#D9573F] font-bold'}`}>
                      {isPass ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Feasible ({suit.reason.split(';')[0]})</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>RESTRICTED ({suit.reason.split('.')[0]})</span>
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

      {/* 4. Port Feasibility Bar Chart per Vessel Type */}
      <div className="card-shell p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#30454D] pb-3">
          <div className="flex items-center space-x-2.5">
            <BarChart3 className="w-4 h-4 text-[#F47B3A]" />
            <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
              PORT DRAFT FEASIBILITY SPECTRUM (VESSEL DRAFT VS PORT PERMISSIBLE DEPTH)
            </h3>
          </div>
          <span className="text-xs font-mono-num text-[#82949A]">
            PORT LIMIT: <strong className="text-[#D9A441]">{dischargePort.maxDraftMeters}m</strong>
          </span>
        </div>

        <p className="text-xs text-[#82949A]">
          Visual comparison of vessel laden draft against discharge port draft limit ({dischargePort.name}). Full teal bar represents safety clearance; red-orange indicates channel depth violation.
        </p>

        <div className="space-y-4 pt-2">
          {draftComparisonChart.map((row) => {
            const isCompliant = row.status === 'compliant';
            // Scale bar max width against 22m
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

        <div className="pt-3 border-t border-[#30454D] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-num text-[#82949A]">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-[#4FA69A] inline-block" />
              <span>Compliant Underkeel Draft</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-[#D9573F] inline-block" />
              <span>Channel Depth Violation (Draft Exceeded)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-3 bg-[#D9A441] inline-block" />
              <span>Port Max Draft Threshold</span>
            </span>
          </div>

          <span className="text-[#DCE5E7]">
            Verdict: <strong>Capesize strictly excluded by bathymetry; Panamax clears with 0.3m buffer.</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
