import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle,
  Zap,
  Info,
  Ship,
  Anchor
} from 'lucide-react';

export default function CompareVesselsPage({ activeRoute, onOpenCharterModal }) {
  const { candidateVessels = [], heroDecision = {} } = activeRoute;

  // Display top candidate vessels returned for the query (or up to top 4)
  const vesselsToCompare = candidateVessels.filter(v => v.isFeasible || v.isRecommended || v.id === heroDecision.recommendedVesselId).slice(0, 4);
  // Any infeasible vessels (e.g. Capesize due to draft restriction)
  const infeasibleVessels = candidateVessels.filter(v => !v.isFeasible && v.id !== heroDecision.recommendedVesselId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#30454D]/60 pb-3">
        <div>
          <h2 className="text-xl font-hud font-bold text-white tracking-wide uppercase">
            CANDIDATE VESSEL FLEET BENCHMARKING
          </h2>
          <p className="text-xs text-[#82949A]">
            Side-by-side standardized comparison for {activeRoute.cargoQuantityMT.toLocaleString()} MT {activeRoute.cargoType} fixture.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono-num bg-[#16262D] border border-[#30454D] px-3 py-1.5 rounded-lg">
          <span className="text-[#82949A]">RECOMMENDED PICK:</span>
          <span className="text-[#F47B3A] font-bold">{heroDecision.recommendedVesselName?.toUpperCase()} (₹{heroDecision.expectedTotalCostCr} Cr)</span>
        </div>
      </div>

      {/* Row of Candidate Subpanels / Cards */}
      <div className={`grid grid-cols-1 ${vesselsToCompare.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
        {vesselsToCompare.map((vessel) => {
          const isWinner = vessel.isRecommended || vessel.id === heroDecision.recommendedVesselId;
          const isLowRisk = vessel.riskLevel === 'Low';
          const isMedRisk = vessel.riskLevel === 'Medium';

          return (
            <div
              key={vessel.id}
              className={`relative rounded-xl transition-all duration-300 flex flex-col justify-between ${
                isWinner
                  ? 'card-recommended p-6 scale-[1.02] shadow-2xl'
                  : 'card-shell p-6 hover:border-[#82949A]'
              }`}
            >
              {/* Top Banner & Header */}
              <div>
                {/* Recommendation Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  {isWinner ? (
                    <span className="flex items-center space-x-1.5 px-3 py-1 rounded bg-[#F47B3A] text-white text-xs font-hud font-bold tracking-wider uppercase shadow-md shadow-[#F47B3A]/30">
                      <Award className="w-3.5 h-3.5" />
                      <span>SYSTEM'S PICK</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-[#20343C] text-[#82949A] text-xs font-mono-num border border-[#30454D]">
                      ALTERNATIVE CANDIDATE
                    </span>
                  )}

                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isWinner ? 'bg-[#F47B3A]/20 text-[#F47B3A]' : 'bg-[#20343C]'
                  }`}>
                    {isWinner ? <Ship className="w-4 h-4" /> : <Anchor className="w-4 h-4 text-[#82949A]" />}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className={`font-hud font-bold text-xl uppercase tracking-wide ${
                    isWinner ? 'text-[#F47B3A]' : 'text-white'
                  }`}>
                    {vessel.name}
                  </h3>
                  <p className="text-xs text-[#82949A]">
                    {vessel.classCategory || 'Dry Bulk Carrier'}
                  </p>
                </div>

                {/* Standardized Field List */}
                <div className="mt-6 space-y-3.5 divide-y divide-[#30454D]/60 text-xs font-mono-num">
                  {/* 1. Cargo Capacity */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[#82949A] font-hud uppercase tracking-wider text-[11px]">
                      CARGO CAPACITY
                    </span>
                    <span className="text-sm font-bold text-white">
                      {(vessel.capacityMT || vessel.dwt || 50000).toLocaleString()} MT
                    </span>
                  </div>

                  {/* 2. Freight */}
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-[#82949A] font-hud uppercase tracking-wider text-[11px]">
                      FREIGHT RATE
                    </span>
                    <div className="text-right">
                      <span className={`text-base font-bold ${isWinner ? 'text-[#F47B3A]' : 'text-[#DCE5E7]'}`}>
                        ${(vessel.freightRatePerMT || 28.5).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-[#82949A] ml-1">/MT</span>
                    </div>
                  </div>

                  {/* 3. Waiting */}
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-[#82949A] font-hud uppercase tracking-wider text-[11px]">
                      PORT WAITING
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">
                        {vessel.waitingDays?.total ?? vessel.waitingDays ?? 3.2} Days
                      </span>
                      {typeof vessel.waitingDays === 'object' && (
                        <span className="text-[10px] text-[#82949A] block">
                          ({vessel.waitingDays.loading}d load / {vessel.waitingDays.discharge}d disch)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4. Total Cost */}
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${
                    isWinner 
                      ? 'bg-[#F47B3A]/15 border-[#F47B3A]/40' 
                      : 'bg-[#0D1A20] border-[#30454D]'
                  }`}>
                    <span className="text-[#82949A] font-hud uppercase tracking-wider text-[11px]">
                      TOTAL COST
                    </span>
                    <div className="text-right">
                      <span className={`text-xl font-bold font-mono-num ${isWinner ? 'text-[#F47B3A]' : 'text-white'}`}>
                        ₹{vessel.costBreakdownCr?.total ?? (vessel.costBreakdownUSD ? (vessel.costBreakdownUSD.total * 83.2 / 1e7).toFixed(2) : '14.22')} Cr
                      </span>
                      {isWinner ? (
                        <span className="text-[10px] text-[#4FA69A] block font-bold">Lowest in Class</span>
                      ) : (
                        <span className="text-[10px] text-[#D9573F] block">Alternative Fixture</span>
                      )}
                    </div>
                  </div>

                  {/* 5. Confidence */}
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-[#82949A] font-hud uppercase tracking-wider text-[11px]">
                      CONFIDENCE
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="w-16 h-2 bg-[#0D1A20] rounded-full overflow-hidden border border-[#30454D] inline-block">
                        <span
                          className="h-full bg-[#4FA69A] block rounded-full"
                          style={{ width: `${vessel.confidencePct || 85}%` }}
                        />
                      </span>
                      <span className="text-sm font-bold text-[#4FA69A]">
                        {vessel.confidencePct || 85}%
                      </span>
                    </div>
                  </div>

                  {/* 6. Risk */}
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-[#82949A] font-hud uppercase tracking-wider text-[11px]">
                      RISK LEVEL
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                      isLowRisk 
                        ? 'text-[#4FA69A] bg-[#4FA69A]/10 border-[#4FA69A]/30' 
                        : isMedRisk 
                        ? 'text-[#D9A441] bg-[#D9A441]/10 border-[#D9A441]/30' 
                        : 'text-[#D9573F] bg-[#D9573F]/10 border-[#D9573F]/30'
                    }`}>
                      {(vessel.riskLevel || 'Low').toUpperCase()} RISK
                    </span>
                  </div>

                  {/* 7. Technical Specs & Constraints */}
                  <div className="pt-3 space-y-1 text-[11px] text-[#82949A]">
                    <div className="flex justify-between">
                      <span>Laden Draft:</span>
                      <span className="text-[#DCE5E7]">{vessel.draftMeters || vessel.designLadenDraftM}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>LOA / Beam:</span>
                      <span className="text-[#DCE5E7]">{vessel.loaMeters || vessel.loaM}m / {vessel.beamMeters || vessel.beamM}m</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Area */}
              <div className="mt-6 pt-4 border-t border-[#30454D]">
                {isWinner ? (
                  <button
                    onClick={onOpenCharterModal}
                    className="w-full py-3 bg-[#F47B3A] hover:bg-[#FF9A5A] text-white text-xs font-hud font-bold tracking-wider uppercase rounded-lg shadow-lg shadow-[#F47B3A]/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>CHARTER {vessel.name.toUpperCase()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="text-center py-2 text-xs text-[#82949A] font-hud uppercase tracking-wider">
                    {vessel.badgeText}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Excluded Vessel Callout (Infeasible Fleet Segment Context) */}
      {infeasibleVessels.map((exVessel) => (
        <div key={exVessel.id} className="card-shell p-5 bg-[#16262D]/60 border-l-4 border-l-[#D9573F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-hud font-bold text-[#D9573F] uppercase tracking-wider">
              <XCircle className="w-4 h-4" />
              <span>EXCLUDED FLEET SEGMENT: {exVessel.name.toUpperCase()}</span>
            </div>
            <p className="text-xs text-[#82949A] max-w-3xl">
              {exVessel.feasibilityReason}
            </p>
          </div>

          <div className="shrink-0 text-xs font-mono-num text-[#82949A] bg-[#0D1A20] px-3 py-2 rounded-lg border border-[#30454D]">
            Draft Required: <strong className="text-[#D9573F]">{exVessel.draftMeters || exVessel.designLadenDraftM}m</strong> vs Max <strong className="text-[#DCE5E7]">{activeRoute.portConstraints?.dischargePort?.maxDraftMeters || 14.5}m</strong>
          </div>
        </div>
      ))}
    </div>
  );
}
