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
  Ship
} from 'lucide-react';

export default function CostAnalysisPage({ activeRoute, onOpenCharterModal }) {
  const { costAnalysis, candidateVessels, heroDecision } = activeRoute;
  const [activeCurrency, setActiveCurrency] = useState('INR'); // INR (₹ Cr) or USD ($)

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
            const nextBest = totalRow ? Math.min(
              ...[totalRow.supramax, totalRow.handysize].filter(v => v !== undefined)
            ) : null;
            const savings = totalRow && nextBest ? (nextBest - totalRow.panamax).toFixed(2) : null;
            return savings ? (
              <span className="text-xs font-mono-num text-[#4FA69A] bg-[#4FA69A]/10 border border-[#4FA69A]/30 px-2.5 py-1 rounded">
                {heroDecision.recommendedVesselName?.split(' /')[0]}: ₹{savings} Cr SAVINGS
              </span>
            ) : null;
          })()}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#30454D] text-[11px] font-hud uppercase tracking-wider text-[#82949A]">
                <th className="py-3 px-4">EXPENSE COMPONENT</th>
                <th className="py-3 px-4 bg-[#F47B3A]/10 text-[#F47B3A] border-x border-[#F47B3A]/30">
                  <Award className="w-3.5 h-3.5 inline mr-1" /> {heroDecision.recommendedVesselName?.split(' /')[0].toUpperCase()} (RECOMMENDED)
                </th>
                <th className="py-3 px-4">SUPRAMAX</th>
                <th className="py-3 px-4">HANDYSIZE (2X SPLIT)</th>
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
                    <td className={`py-3.5 px-4 bg-[#F47B3A]/10 border-x border-[#F47B3A]/30 ${
                      isTotal ? 'text-[#F47B3A] font-extrabold text-base' : 'text-white'
                    }`}>
                      {isMeta ? row.panamax : (typeof row.panamax === 'number' ? (activeCurrency === 'INR' ? `₹${row.panamax.toFixed(2)} Cr` : `$${(row.panamax * 0.12).toFixed(2)}M`) : row.panamax)}
                    </td>
                    <td className="py-3.5 px-4 text-[#82949A]">
                      {isMeta ? row.supramax : (typeof row.supramax === 'number' ? (activeCurrency === 'INR' ? `₹${row.supramax.toFixed(2)} Cr` : `$${(row.supramax * 0.12).toFixed(2)}M`) : row.supramax)}
                    </td>
                    <td className="py-3.5 px-4 text-[#82949A]">
                      {isMeta ? row.handysize : (typeof row.handysize === 'number' ? (activeCurrency === 'INR' ? `₹${row.handysize.toFixed(2)} Cr` : `$${(row.handysize * 0.12).toFixed(2)}M`) : row.handysize)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isTotal ? (
                        <span className="text-[#4FA69A] font-bold">
                          {typeof row.supramax === 'number' && typeof row.panamax === 'number'
                            ? `-₹${(row.supramax - row.panamax).toFixed(2)} Cr (-${((row.supramax - row.panamax) / row.supramax * 100).toFixed(1)}%)`
                            : '—'}
                        </span>
                      ) : isMeta ? (
                        <span className="text-[10px] text-[#82949A] font-hud uppercase">COST BASIS</span>
                      ) : (
                        <span className="text-[#82949A] text-[11px]">
                          {typeof row.panamax === 'number' && typeof row.supramax === 'number' && row.panamax < row.supramax ? 'Lowest' : 'Standard'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
            Waiting time is strictly included in the total cost calculation above (₹{recVessel.costBreakdownCr?.portWaitingCr?.toFixed(2) ?? '1.34'} Cr allocated for {recVessel.waitingDays?.total ?? '3.2'} days waiting). Demurrage exposure is priced directly into the fixture appraisal.
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
    </div>
  );
}
