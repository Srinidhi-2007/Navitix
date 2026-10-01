import React, { useState } from 'react';
import { 
  DollarSign, 
  Clock, 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  TrendingDown, 
  Info,
  ShieldCheck,
  Ship,
  Package,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function CostAnalysisPage({ activeRoute, onOpenCharterModal }) {
  const { costAnalysis, candidateVessels, heroDecision } = activeRoute;
  const [activeCurrency, setActiveCurrency] = useState('INR'); // INR (₹ Cr) or USD ($)
  const [showContractTypes, setShowContractTypes] = useState(true);

  const recVessel = candidateVessels.find(v => v.id === heroDecision.recommendedVesselId) || candidateVessels[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#30454D]/60 pb-3">
        <div>
          <h2 className="text-xl font-hud font-bold text-white tracking-wide uppercase">
            VOYAGE COST ANALYSIS & FINANCIAL APPRAISAL
          </h2>
          <p className="text-xs text-[#82949A]">
            Itemized cost synthesis for recommended vessel and cross-fleet financial comparison for {activeRoute.cargoQuantityMT.toLocaleString()} MT parcel.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center space-x-2 bg-[#16262D] border border-[#30454D] rounded-lg p-1 text-xs">
          <button
            onClick={() => setActiveCurrency('INR')}
            className={`px-3 py-1 rounded font-mono-num font-semibold transition-colors ${
              activeCurrency === 'INR' ? 'bg-[#F47B3A] text-white' : 'text-[#82949A] hover:text-[#DCE5E7]'
            }`}
          >
            ₹ CRORES (INR)
          </button>
          <button
            onClick={() => setActiveCurrency('USD')}
            className={`px-3 py-1 rounded font-mono-num font-semibold transition-colors ${
              activeCurrency === 'USD' ? 'bg-[#F47B3A] text-white' : 'text-[#82949A] hover:text-[#DCE5E7]'
            }`}
          >
            $ MILLIONS (USD)
          </button>
        </div>
      </div>

      {/* 1. Recommended Vessel Cost Breakdown (Stacked Bar + Itemized Readout) */}
      <div className="card-shell p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#30454D] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#F47B3A] text-white flex items-center justify-center font-bold text-base">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-hud font-bold text-base text-white uppercase tracking-wider">
                  RECOMMENDED VESSEL COST BREAKDOWN — {recVessel.name.toUpperCase()}
                </h3>
                <span className="text-[10px] font-hud uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-[#F47B3A]/20 text-[#F47B3A] border border-[#F47B3A]/40">
                  WINNER
                </span>
              </div>
              <p className="text-xs text-[#82949A]">
                Voyage: {activeRoute.originPort.split('(')[0].trim()} → {activeRoute.destinationPort.split('(')[0].trim()} ({recVessel.voyageDays ?? activeRoute.voyageDaysEst ?? '—'} days sea transit + {recVessel.waitingDays?.total ?? '—'} days port waiting)
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block">EXPECTED TOTAL EXPENDITURE</span>
            <div className="text-3xl font-mono-num font-bold text-white">
              {activeCurrency === 'INR' ? `₹${costAnalysis.totalCostRecommended} Cr` : `$${(costAnalysis.totalCostRecommended * 0.12).toFixed(2)}M`}
            </div>
          </div>
        </div>

        {/* Stacked Cost Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-num">
            <span className="text-[#82949A]">VOYAGE COST COMPOSITION</span>
            <span className="text-[#DCE5E7]">100% Total Budget Allocated</span>
          </div>

          <div className="h-6 w-full rounded-lg overflow-hidden flex shadow-inner bg-[#0D1A20] border border-[#30454D]">
            {costAnalysis.recommendedItemized.map((item, idx) => (
              <div
                key={idx}
                className="h-full flex items-center justify-center text-[10px] font-mono-num font-bold text-white transition-all hover:opacity-90 cursor-default"
                style={{
                  width: `${item.pct}%`,
                  backgroundColor: item.color
                }}
                title={`${item.label}: ₹${item.amountCr} Cr (${item.pct}%)`}
              >
                {item.pct > 7 ? `${item.pct}%` : ''}
              </div>
            ))}
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono-num pt-1">
            {costAnalysis.recommendedItemized.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs inline-block" style={{ backgroundColor: item.color }} />
                <span className="text-[#DCE5E7]">{item.label}</span>
                <span className="text-[#82949A]">({item.pct}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Itemized Readout Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {costAnalysis.recommendedItemized.map((item, idx) => (
            <div key={idx} className="p-4 bg-[#0D1A20] border border-[#30454D] rounded-lg space-y-1">
              <span className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block">
                {item.label}
              </span>
              <div className="text-xl font-mono-num font-bold text-white flex items-baseline space-x-1">
                <span>
                  {activeCurrency === 'INR' ? `₹${item.amountCr}` : `$${(item.amountCr * 0.12).toFixed(2)}M`}
                </span>
                {activeCurrency === 'INR' && <span className="text-xs font-normal text-[#82949A]">Cr</span>}
              </div>
              <div className="text-[11px] text-[#82949A] pt-1 border-t border-[#30454D]/60 mt-2">
                {item.note}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Cross-Vessel Cost Comparison Matrix */}
      <div className="card-shell p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#30454D] pb-3">
          <div>
            <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
              CROSS-FLEET COST COMPARISON MATRIX
            </h3>
            <p className="text-[11px] text-[#82949A]">
              Standardized comparison across candidate bulk vessel categories ({activeCurrency === 'INR' ? '₹ Cr' : '$ USD'})
            </p>
          </div>
          {(() => {
            const totalRow = costAnalysis.comparisonMatrix?.find(r => r.isTotal);
            if (!totalRow) return null;
            const recKey = heroDecision.recommendedVesselId;
            const recCost = totalRow[recKey];
            if (typeof recCost !== 'number') return null;
            const others = ['panamax','supramax','handysize']
              .filter(k => k !== recKey && typeof totalRow[k] === 'number')
              .map(k => totalRow[k]);
            if (!others.length) return null;
            const nextBest = Math.min(...others);
            const diff = recCost - nextBest; // positive = rec is more expensive
            const absDiff = Math.abs(diff).toFixed(2);
            const pct = ((Math.abs(diff) / recCost) * 100).toFixed(1);
            if (diff > 0) {
              // Recommended is more expensive — show premium, not savings
              return (
                <span className="text-xs font-mono-num text-[#D9A441] bg-[#D9A441]/10 border border-[#D9A441]/30 px-2.5 py-1 rounded">
                  {heroDecision.recommendedVesselName?.split(' /')[0]}: +₹{absDiff} Cr (+{pct}%) vs next-best
                </span>
              );
            }
            return (
              <span className="text-xs font-mono-num text-[#4FA69A] bg-[#4FA69A]/10 border border-[#4FA69A]/30 px-2.5 py-1 rounded">
                {heroDecision.recommendedVesselName?.split(' /')[0]}: −₹{absDiff} Cr (−{pct}%) SAVINGS
              </span>
            );
          })()}
        </div>

        <div className="overflow-x-auto">
          {(() => {
            // Derive column order: recommended vessel first, then others
            const recKey = heroDecision.recommendedVesselId;
            const allKeys = ['panamax', 'supramax', 'handysize'];
            const otherKeys = allKeys.filter(k => k !== recKey);
            const vesselLabel = (key) => {
              const v = candidateVessels.find(c => c.id === key);
              const name = v ? v.name.split(' /')[0].toUpperCase() : key.toUpperCase();
              return v && v.voyageCount > 1 ? `${name} (${v.voyageCount}× SPLIT)` : name;
            };
            const fmtVal = (val) => {
              if (typeof val !== 'number') return val ?? '—';
              return activeCurrency === 'INR' ? `₹${val.toFixed(2)} Cr` : `$${(val * 0.12).toFixed(2)}M`;
            };

            return (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#30454D] text-[11px] font-hud uppercase tracking-wider text-[#82949A]">
                    <th className="py-3 px-4">EXPENSE COMPONENT</th>
                    <th className="py-3 px-4 bg-[#F47B3A]/10 text-[#F47B3A] border-x border-[#F47B3A]/30">
                      <Award className="w-3.5 h-3.5 inline mr-1" /> {vesselLabel(recKey)} (RECOMMENDED)
                    </th>
                    {otherKeys.map(k => (
                      <th key={k} className="py-3 px-4">{vesselLabel(k)}</th>
                    ))}
                    <th className="py-3 px-4 text-right">OPTIMAL ADVANTAGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30454D]/60 text-xs font-mono-num">
                  {costAnalysis.comparisonMatrix.map((row, idx) => {
                    const isTotal = row.isTotal;
                    const isMeta = row.isMetadata;
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isTotal
                            ? 'bg-[#20343C]/80 font-bold text-white text-sm border-t-2 border-[#F47B3A]'
                            : isMeta
                            ? 'bg-[#16262D]/40 text-[#4FA69A]'
                            : 'hover:bg-[#16262D]/60 text-[#DCE5E7]'
                        }`}
                      >
                        <td className={`py-3.5 px-4 ${isTotal ? 'font-hud uppercase tracking-wider text-[#F47B3A]' : isMeta ? 'font-hud uppercase tracking-wider text-[11px]' : ''}`}>
                          {row.item}
                        </td>
                        {/* Recommended vessel column (highlighted) */}
                        <td className={`py-3.5 px-4 bg-[#F47B3A]/10 border-x border-[#F47B3A]/30 ${
                          isTotal ? 'text-[#F47B3A] font-extrabold text-base' : 'text-white'
                        }`}>
                          {isMeta ? row[recKey] : fmtVal(row[recKey])}
                        </td>
                        {/* Other vessel columns */}
                        {otherKeys.map(k => (
                          <td key={k} className="py-3.5 px-4 text-[#82949A]">
                            {isMeta ? row[k] : fmtVal(row[k])}
                          </td>
                        ))}
                        {/* Optimal advantage column */}
                        <td className="py-3.5 px-4 text-right">
                          {isTotal ? (
                            (() => {
                              const recVal = typeof row[recKey] === 'number' ? row[recKey] : null;
                              if (recVal == null) return <span>—</span>;
                              const others = otherKeys
                                .filter(k => typeof row[k] === 'number')
                                .map(k => row[k]);
                              if (!others.length) return <span>—</span>;
                              const nextBest = Math.min(...others);
                              const diff = recVal - nextBest;
                              const absDiff = Math.abs(diff).toFixed(2);
                              const pct = ((Math.abs(diff) / recVal) * 100).toFixed(1);
                              if (diff > 0) {
                                return <span className="text-[#D9A441] font-bold">+₹{absDiff} Cr (+{pct}%) premium</span>;
                              }
                              return <span className="text-[#4FA69A] font-bold">−₹{absDiff} Cr (−{pct}%) savings</span>;
                            })()
                          ) : isMeta ? (
                            <span className="text-[10px] text-[#82949A] font-hud uppercase">COST BASIS</span>
                          ) : (
                            <span className="text-[#82949A] text-[11px]">
                              {(() => {
                                const recVal = typeof row[recKey] === 'number' ? row[recKey] : null;
                                const others = otherKeys
                                  .filter(k => typeof row[k] === 'number')
                                  .map(k => row[k]);
                                return recVal != null && others.length && recVal <= Math.min(...others) ? 'Lowest' : 'Standard';
                              })()}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            );
          })()}
        </div>

      </div>

      {/* 3. Port Waiting / Idle Time Detail Section */}
      <div className="card-shell p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#30454D] pb-3">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-4 h-4 text-[#D9A441]" />
            <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
              PORT WAITING & DEMURRAGE IMPACT ANALYSIS
            </h3>
          </div>
          <div className="text-[11px] font-mono-num text-[#82949A]">
            DEMURRAGE RATE: <strong className="text-[#DCE5E7]">$5,000 / DAY</strong>
          </div>
        </div>

        {/* Explicit callout that waiting time is included in total cost */}
        <div className="p-3.5 bg-[#20343C]/80 border border-[#D9A441]/50 rounded-lg flex items-start space-x-3">
          <Info className="w-4 h-4 text-[#D9A441] shrink-0 mt-0.5" />
          <p className="text-xs text-[#DCE5E7] leading-relaxed">
            <strong className="text-[#D9A441] font-hud uppercase tracking-wide mr-1.5">
              Financial Note:
            </strong>
            Waiting time is strictly included in the total cost calculation above (₹{recVessel.costBreakdownCr?.waitingDemurrage?.toFixed(2) ?? '0.17'} Cr allocated for {recVessel.waitingDays?.total ?? '3.2'} days waiting at $5,000/day). Demurrage exposure is priced directly into the fixture appraisal.
          </p>
        </div>

        {/* Waiting Days Breakdown: Table & Horizontal Segmented Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Waiting Days Table */}
          <div className="space-y-2">
            <div className="text-[10px] font-hud uppercase tracking-wider text-[#82949A]">
              DETAILED WAITING DAYS BY PORT
            </div>
            <div className="border border-[#30454D] rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs font-mono-num">
                <thead className="bg-[#0D1A20] text-[#82949A] border-b border-[#30454D] text-[10px] uppercase font-hud">
                  <tr>
                    <th className="p-2.5">VESSEL</th>
                    <th className="p-2.5">LOAD WAIT</th>
                    <th className="p-2.5">DISCH WAIT</th>
                    <th className="p-2.5">TOTAL WAIT</th>
                    <th className="p-2.5 text-right">DEMURRAGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30454D]/60">
                  {costAnalysis.waitingTimeBreakdown.map((row, idx) => {
                    const isRec = row.vessel.toLowerCase().includes(recVessel.name.toLowerCase().split(' ')[0]) || (recVessel.name.toLowerCase().includes('panamax') && row.vessel === 'Panamax');
                    return (
                      <tr key={idx} className={isRec ? 'bg-[#F47B3A]/10 text-white font-bold' : 'text-[#82949A]'}>
                        <td className="p-2.5 flex items-center space-x-1.5">
                          {isRec && <span><Award className="w-3.5 h-3.5 inline" /></span>}
                          <span>{row.vessel}</span>
                        </td>
                        <td className="p-2.5">{row.loadingDays}d</td>
                        <td className="p-2.5">{row.dischargeDays}d</td>
                        <td className="p-2.5 font-bold text-[#DCE5E7]">{row.totalDays} days</td>
                        <td className="p-2.5 text-right text-[#D9A441]">₹{row.costCr} Cr</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Horizontal Bar Breakdown */}
          <div className="space-y-3">
            <div className="text-[10px] font-hud uppercase tracking-wider text-[#82949A]">
              PORT WAITING COMPOSITION (LOAD VS DISCHARGE DELAY)
            </div>

            <div className="space-y-3 pt-1">
              {costAnalysis.waitingTimeBreakdown.map((item) => {
                const maxDays = 5.0;
                const loadPct = (item.loadingDays / maxDays) * 100;
                const dischPct = (item.dischargeDays / maxDays) * 100;
                const isRec = item.vessel.toLowerCase().includes(recVessel.name.toLowerCase().split(' ')[0]) || (recVessel.name.toLowerCase().includes('panamax') && item.vessel === 'Panamax');

                return (
                  <div key={item.vessel} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono-num">
                      <span className={`font-hud font-semibold uppercase ${isRec ? 'text-[#F47B3A]' : 'text-[#DCE5E7]'}`}>
                        {item.vessel}
                      </span>
                      <span className="text-[11px] text-[#82949A]">
                        {item.loadingDays}d Load + {item.dischargeDays}d Disch = <strong className="text-white">{item.totalDays}d Total</strong>
                      </span>
                    </div>

                    <div className="h-5 w-full bg-[#0D1A20] rounded-lg border border-[#30454D] overflow-hidden flex">
                      <div
                        className="h-full bg-[#4FA69A] flex items-center justify-center text-[9px] font-mono-num text-white"
                        style={{ width: `${loadPct}%` }}
                        title={`Loading Wait: ${item.loadingDays}d`}
                      >
                        {item.loadingDays}d
                      </div>
                      <div
                        className="h-full bg-[#D9A441] flex items-center justify-center text-[9px] font-mono-num text-black font-bold"
                        style={{ width: `${dischPct}%` }}
                        title={`Discharge Wait: ${item.dischargeDays}d`}
                      >
                        {item.dischargeDays}d
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center space-x-5 text-[11px] font-mono-num text-[#82949A] pt-2">
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#4FA69A] inline-block" />
                <span>{activeRoute.portConstraints?.loadingPort?.name?.split('(')[0].trim() || 'Loading Port'} Anchorage Wait</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#D9A441] inline-block" />
                <span>{activeRoute.portConstraints?.dischargePort?.name?.split('(')[0].trim() || 'Discharge Port'} Berth Line-up Wait</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Type Recommendation (New Section) */}
      {heroDecision.contractTypeComparison && (
        <div className="card-shell p-6 mt-6">
          <div 
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setShowContractTypes(!showContractTypes)}
          >
            <div className="flex items-center space-x-3">
              <Package className="w-5 h-5 text-[#F47B3A]" />
              <h3 className="font-hud font-bold text-sm tracking-wider text-white uppercase group-hover:text-[#F47B3A] transition-colors">
                CHARTER CONTRACT TYPE ANALYSIS
              </h3>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs font-mono-num text-[#82949A] hidden sm:inline-block">
                RECOMMENDED: <strong className="text-[#4FA69A]">{heroDecision.recommendedContractType?.toUpperCase() || 'SPOT'}</strong>
              </span>
              {showContractTypes ? (
                <ChevronUp className="w-5 h-5 text-[#82949A] group-hover:text-white" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#82949A] group-hover:text-white" />
              )}
            </div>
          </div>

          {showContractTypes && (
            <div className="mt-6 pt-6 border-t border-[#30454D] grid grid-cols-1 lg:grid-cols-3 gap-6">
              {(() => {
                const spotItem = heroDecision.contractTypeComparison.find(c => c.type === 'spot');
                const spotCost = spotItem?.estimatedCostCr || heroDecision.expectedTotalCostCr;

                return heroDecision.contractTypeComparison.map((contract, idx) => (
                  <div 
                    key={contract.type} 
                    className={`relative rounded-xl p-5 border transition-all ${
                      contract.isRecommended 
                        ? 'bg-[#16262D] border-[#4FA69A] shadow-md shadow-[#4FA69A]/10' 
                        : 'bg-[#0D1A20] border-[#30454D]'
                    }`}
                  >
                    {contract.isRecommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#4FA69A] text-[#071014] text-[10px] font-hud font-bold uppercase rounded-full shadow-sm whitespace-nowrap">
                        Best Commercial Fit
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <h4 className={`text-sm font-hud font-bold uppercase ${contract.isRecommended ? 'text-[#4FA69A]' : 'text-[#DCE5E7]'}`}>
                        {contract.label}
                      </h4>
                      
                      <div className="mt-3">
                        {contract.estimatedCostCr ? (
                          <>
                            <div className="text-2xl font-mono-num font-bold text-white">
                              {activeCurrency === 'INR' ? `₹${contract.estimatedCostCr} Cr` : `$${contract.estimatedCostUSD?.toLocaleString()}`}
                            </div>
                            {contract.type !== 'spot' && spotCost && (
                              <div className="text-[10px] font-mono-num text-[#82949A] mt-1">
                                {contract.estimatedCostCr > spotCost ? '+' : ''}
                                {(((contract.estimatedCostCr / spotCost) - 1) * 100).toFixed(1)}% vs Spot
                              </div>
                            )}
                            {contract.note && (
                              <div className="text-[10px] text-[#4FA69A] font-mono-num mt-1">
                                {contract.note}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-sm font-mono-num font-medium text-[#82949A] py-2">
                            {contract.note || "Volume Dependent"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] font-hud uppercase tracking-wider text-[#4FA69A] mb-2 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Advantages</span>
                        </div>
                        <ul className="space-y-1.5">
                          {contract.pros.map((pro, i) => (
                            <li key={i} className="text-xs text-[#DCE5E7] flex items-start space-x-2">
                              <span className="text-[#4FA69A] mt-0.5">•</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-[10px] font-hud uppercase tracking-wider text-[#D9573F] mb-2 flex items-center space-x-1.5">
                          <XCircle className="w-3 h-3" />
                          <span>Drawbacks</span>
                        </div>
                        <ul className="space-y-1.5">
                          {contract.cons.map((con, i) => (
                            <li key={i} className="text-xs text-[#82949A] flex items-start space-x-2">
                              <span className="text-[#D9573F] mt-0.5">•</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
