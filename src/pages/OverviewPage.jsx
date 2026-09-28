import { 
  ArrowRight, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  Award, 
  Zap, 
  Anchor, 
  CheckCircle2, 
  ChevronRight,
  ExternalLink,
  Sliders,
  Package,
  Ship
} from 'lucide-react';

export default function OverviewPage({ activeRoute, onOpenCharterModal, onNavigate }) {
  const { heroDecision, kpis, whyThisVessel, alerts, candidateVessels, freightForecast } = activeRoute;

  // Render SVG mini-forecast chart
  const renderMiniChart = () => {
    const points = freightForecast.timeSeries;
    const width = 380;
    const height = 110;
    const padding = 15;

    // Auto-scale Y axis from actual data (pad 1.5 on each side)
    const allRates = points.flatMap(p => [p.actualRate, p.forecastRate].filter(v => v !== null));
    const minVal = Math.floor(Math.min(...allRates) - 1.5);
    const maxVal = Math.ceil(Math.max(...allRates) + 1.5);
    const range = maxVal - minVal;

    const getX = (index) => padding + (index / (points.length - 1)) * (width - 2 * padding);
    const getY = (val) => height - padding - ((val - minVal) / range) * (height - 2 * padding);

    // Build historical line and forecast line
    const histPoints = points.filter(p => p.actualRate !== null);
    const forecastPoints = points.filter(p => p.forecastRate !== null);

    const histPath = histPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(points.indexOf(p))},${getY(p.actualRate)}`)
      .join(' ');

    const forecastPath = forecastPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(points.indexOf(p))},${getY(p.forecastRate)}`)
      .join(' ');

    // Current point index (fallback: last historical point)
    const currentPointIndex = points.findIndex(p => p.isCurrent) !== -1
      ? points.findIndex(p => p.isCurrent)
      : histPoints.length > 0 ? points.indexOf(histPoints[histPoints.length - 1]) : 0;
    const currentX = getX(currentPointIndex);
    const currentY = getY(points[currentPointIndex]?.actualRate ?? points[currentPointIndex]?.forecastRate ?? 28);

    // Optimal window highlight rect
    const optStart = points.findIndex(p => p.inOptimalWindow);
    const optEnd = points.findLastIndex(p => p.inOptimalWindow);
    const optStartX = getX(optStart !== -1 ? optStart : 8);
    const optEndX = getX(optEnd !== -1 ? optEnd : 10);

    // Trough point index & value
    const troughIdx = points.findIndex(p => p.isTrough) !== -1 
      ? points.findIndex(p => p.isTrough) 
      : (freightForecast.troughDayOffset ? points.findIndex(p => p.dayOffset === freightForecast.troughDayOffset) : -1);
    const safeTroughIdx = troughIdx !== -1 ? troughIdx : (optStart !== -1 ? optStart : 9);
    const troughRate = freightForecast.troughRate ?? (points[safeTroughIdx]?.forecastRate ?? 27.9);
    const troughY = getY(troughRate);
    const troughX = getX(safeTroughIdx);

    return (
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
          <defs>
            <linearGradient id="optWindowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F47B3A" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F47B3A" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="histGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#82949A" />
              <stop offset="100%" stopColor="#4FA69A" />
            </linearGradient>
          </defs>

          {/* Optimal Window Shading */}
          <rect
            x={optStartX}
            y={padding}
            width={Math.max(20, optEndX - optStartX)}
            height={height - 2 * padding}
            fill="url(#optWindowGrad)"
            rx="4"
          />
          <text 
            x={optStartX + (optEndX - optStartX) / 2} 
            y={padding - 3} 
            textAnchor="middle" 
            fill="#F47B3A" 
            fontSize="8" 
            fontFamily="Space Grotesk"
            fontWeight="bold"
            letterSpacing="0.05em"
          >
            OPTIMAL CHARTER WINDOW
          </text>

          {/* Historical Line (Solid Teal/Steel) */}
          <path
            d={histPath}
            fill="none"
            stroke="#4FA69A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Forecast Line (Dashed Orange) */}
          <path
            d={forecastPath}
            fill="none"
            stroke="#F47B3A"
            strokeWidth="2.5"
            strokeDasharray="4 3"
            strokeLinecap="round"
          />

          {/* Current Rate Point */}
          <circle cx={currentX} cy={currentY} r="4" fill="#DCE5E7" stroke="#071014" strokeWidth="2" />
          <text x={currentX} y={currentY - 7} textAnchor="middle" fill="#DCE5E7" fontSize="8" fontFamily="JetBrains Mono">
            ${points[currentPointIndex]?.actualRate ?? freightForecast.currentMarketRate}
          </text>

          {/* Optimal Trough Point */}
          <circle cx={troughX} cy={troughY} r="4" fill="#F47B3A" stroke="#071014" strokeWidth="2" />
          <text x={troughX} y={troughY + 13} textAnchor="middle" fill="#F47B3A" fontSize="8" fontFamily="JetBrains Mono" fontWeight="bold">
            ${troughRate.toFixed(2)} (+{freightForecast.troughDayOffset ?? 4}D)
          </text>
        </svg>

        <div className="flex items-center justify-between text-[10px] font-mono-num text-[#82949A] mt-1 px-1">
          <span>{points[0]?.date || 'Past'}</span>
          <span className="text-[#DCE5E7] font-semibold">Today ({points[currentPointIndex]?.date || 'Current'})</span>
          <span className="text-[#F47B3A] font-semibold">Trough ({freightForecast.optimalWindowDateRange || 'Window'})</span>
          <span>{points[points.length - 1]?.date || '+14D'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Cargo & Route Summary Line */}
      <div className="bg-[#0D1A20] border border-[#30454D] rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-[#20343C] border border-[#30454D] flex items-center justify-center text-lg">
            <Package className="w-5 h-5 text-[#F47B3A]" />
          </div>
          <div>
            <div className="text-[10px] font-hud font-bold uppercase tracking-wider text-[#82949A]">
              CURRENT CARGO REQUIREMENT & VOYAGE ROUTE
            </div>
            <div className="text-base sm:text-lg font-hud font-bold text-[#DCE5E7] flex flex-wrap items-center gap-2">
              <span className="text-[#F47B3A]">{activeRoute.cargoQuantityMT.toLocaleString()} MT</span>
              <span className="text-[#82949A]">·</span>
              <span>{activeRoute.cargoType}</span>
              <span className="text-[#82949A]">·</span>
              <span className="flex items-center space-x-1.5 text-white">
                <span>{activeRoute.originFlag} {activeRoute.originPort.split('(')[0]}</span>
                <ArrowRight className="w-4 h-4 text-[#F47B3A]" />
                <span>{activeRoute.destinationFlag} {activeRoute.destinationPort.split('(')[0]}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => onNavigate('vessel-route')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#16262D] border border-[#30454D] hover:border-[#F47B3A] text-xs text-[#DCE5E7] hover:text-[#F47B3A] transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Modify Route / Cargo</span>
          </button>
          <div className="text-right pl-3 border-l border-[#30454D]">
            <div className="text-[10px] font-hud uppercase tracking-wider text-[#82949A]">TARGET ARRIVAL</div>
            <div className="text-xs font-mono-num font-semibold text-[#DCE5E7]">{activeRoute.desiredArrivalDate}</div>
          </div>
        </div>
      </div>

      {/* 2. Hero Recommendation Block (Focal Point with Orange Accent) */}
      <div className="relative card-recommended p-6 overflow-hidden">
        {/* Glow corner accent */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#F47B3A]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-1 rounded bg-[#F47B3A] text-white text-xs font-hud font-bold tracking-wider uppercase shadow-md shadow-[#F47B3A]/30">
                SYSTEM RECOMMENDATION
              </span>
              <span className="text-xs font-mono-num text-[#4FA69A] bg-[#4FA69A]/10 border border-[#4FA69A]/30 px-2 py-0.5 rounded">
                {heroDecision.forecastConfidencePct}% CONFIDENCE
              </span>
              <span className="text-xs font-mono-num text-[#DCE5E7] bg-[#20343C] border border-[#30454D] px-2 py-0.5 rounded hidden sm:inline-block">
                FEASIBILITY: 100% COMPLIANT
              </span>
            </div>

            <div className="flex items-baseline space-x-4">
              <span className="text-4xl sm:text-5xl">{heroDecision.recommendedVesselIcon}</span>
              <div>
                <h2 className="text-2xl sm:text-3xl font-hud font-bold text-white tracking-wide uppercase">
                  {heroDecision.recommendedVesselName}
                </h2>
                <p className="text-xs sm:text-sm text-[#82949A] mt-0.5">
                  Route: {activeRoute.originPort} → {activeRoute.destinationPort} ({activeRoute.voyageDistanceNM.toLocaleString()} NM)
                </p>
              </div>
            </div>

            {/* Charter Timing Action Banner */}
            <div className="inline-flex items-center space-x-2.5 bg-[#20343C]/90 border border-[#F47B3A]/50 rounded-lg px-3.5 py-2">
              <Clock className="w-4 h-4 text-[#F47B3A] shrink-0" />
              <div className="text-xs sm:text-sm text-[#DCE5E7]">
                <strong className="text-[#F47B3A] font-bold font-hud uppercase tracking-wide">
                  {heroDecision.charterTimingAction}
                </strong>
                <span className="text-[#82949A] ml-2 font-mono-num">({heroDecision.timingWindowDates})</span>
              </div>
            </div>

            <p className="text-xs text-[#82949A] max-w-2xl leading-relaxed">
              {heroDecision.timingRationale}
            </p>
          </div>

          {/* Primary CTA & Decision Summary */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 lg:border-l lg:border-[#30454D]/80 lg:pl-8">
            <div className="text-left lg:text-right">
              <div className="text-[11px] font-hud uppercase tracking-wider text-[#82949A]">EXPECTED TOTAL COST</div>
              <div className="text-3xl sm:text-4xl font-mono-num font-bold text-white tracking-tight">
                ₹{heroDecision.expectedTotalCostCr} <span className="text-lg font-normal text-[#82949A]">Cr</span>
              </div>
              <div className="text-xs font-mono-num text-[#4FA69A] mt-0.5">
                ~${heroDecision.expectedTotalCostUSD.toLocaleString()} USD · Lowest Total in Class
              </div>
            </div>

            <button
              onClick={onOpenCharterModal}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#F47B3A] hover:bg-[#FF9A5A] text-white text-sm font-hud font-bold tracking-wider uppercase rounded-lg shadow-xl shadow-[#F47B3A]/30 hover:shadow-[#F47B3A]/50 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 group cursor-pointer"
            >
              <span>CHARTER NOW</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Row of 5 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="card-shell p-4 hover:border-[#F47B3A]/40 transition-colors">
            <div className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] truncate">
              {kpi.label}
            </div>
            <div className="text-xl sm:text-2xl font-mono-num font-bold text-[#DCE5E7] mt-1 flex items-baseline space-x-1">
              <span>{kpi.value}</span>
              {kpi.unit && <span className="text-xs font-normal text-[#82949A]">{kpi.unit}</span>}
            </div>
            <div className="text-[11px] text-[#82949A] truncate mt-1">
              {kpi.subtext}
            </div>
            {kpi.trend && (
              <div className={`text-[10px] font-mono-num font-semibold mt-1 flex items-center space-x-1 ${
                kpi.trendFavorable ? 'text-[#4FA69A]' : 'text-[#D9573F]'
              }`}>
                {kpi.trendFavorable ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                <span>{kpi.trend}</span>
              </div>
            )}
            {kpi.status && (
              <div className="text-[10px] font-mono-num font-semibold mt-1 flex items-center space-x-1 text-[#4FA69A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4FA69A]" />
                <span className="uppercase">Compliant</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 4. Main Two-Column Analytical Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Mini Forecast Chart & Vessel Comparison Strip */}
        <div className="lg:col-span-7 space-y-6">
          {/* Embedded Freight Forecast Mini-Chart */}
          <div className="card-shell p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
                  FREIGHT RATE TRAJECTORY & TIMING WINDOW
                </h3>
                <p className="text-[11px] text-[#82949A]">
                  Historical spot fixtures vs 14-day predicted rate path ($/MT)
                </p>
              </div>
              <button
                onClick={() => onNavigate('freight-forecast')}
                className="text-xs text-[#F47B3A] hover:text-[#FF9A5A] font-medium flex items-center space-x-1 transition-colors"
              >
                <span>Full Forecast</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {renderMiniChart()}

            <div className="mt-4 pt-3 border-t border-[#30454D] grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-[#0D1A20] rounded border border-[#30454D]">
                <span className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block">CURRENT SPOT</span>
                <span className="font-mono-num font-bold text-[#DCE5E7] text-sm">${freightForecast.currentMarketRate}</span>
                <span className="text-[10px] text-[#82949A] block">/MT</span>
              </div>
              <div className="p-2 bg-[#0D1A20] rounded border border-[#F47B3A]/40 bg-[#F47B3A]/5">
                <span className="text-[10px] font-hud uppercase tracking-wider text-[#F47B3A] block">TROUGH RATE</span>
                <span className="font-mono-num font-bold text-[#F47B3A] text-sm">${freightForecast.troughRate}</span>
                <span className="text-[10px] text-[#4FA69A] block">{freightForecast.expectedChangePct}% · Day +{freightForecast.troughDayOffset}</span>
              </div>
              <div className="p-2 bg-[#0D1A20] rounded border border-[#30454D]">
                <span className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block">OPTIMAL WINDOW</span>
                <span className="font-mono-num font-bold text-[#DCE5E7] text-sm">{freightForecast.optimalWindowDateRange}</span>
                <span className="text-[10px] text-[#4FA69A] block">Charter timing target</span>
              </div>
            </div>
          </div>

          {/* Compact Vessel Comparison Strip */}
          <div className="card-shell p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
                  CANDIDATE FLEET COMPARISON
                </h3>
                <p className="text-[11px] text-[#82949A]">
                  Total voyage cost & suitability comparison for {activeRoute.cargoQuantityMT.toLocaleString()} MT lot
                </p>
              </div>
              <button
                onClick={() => onNavigate('compare-vessels')}
                className="text-xs text-[#F47B3A] hover:text-[#FF9A5A] font-medium flex items-center space-x-1 transition-colors"
              >
                <span>Full Comparison</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {candidateVessels.slice(0, 3).map((v) => {
                const isWinner = v.isRecommended;
                return (
                  <div
                    key={v.id}
                    className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                      isWinner
                        ? 'bg-[#F47B3A]/10 border-[#F47B3A] shadow-md shadow-[#F47B3A]/10'
                        : 'bg-[#0D1A20] border-[#30454D] hover:border-[#82949A]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isWinner ? 'bg-[#F47B3A] text-white' : 'bg-[#20343C] text-[#82949A]'
                      }`}>
                        {isWinner ? <Award className="w-4 h-4" /> : <Ship className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-hud font-bold text-sm text-[#DCE5E7] uppercase">
                            {v.name}
                          </span>
                          {isWinner && (
                            <span className="text-[9px] font-hud uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-[#F47B3A] text-white">
                              RECOMMENDED
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono-num text-[#82949A]">
                          Capacity: {v.capacityMT.toLocaleString()} MT · Draft: {v.draftMeters}m · Wait: {v.waitingDays.total}d
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-4 pl-11 sm:pl-0">
                      <div className="text-right">
                        <div className="text-[10px] font-hud uppercase tracking-wider text-[#82949A]">FREIGHT</div>
                        <div className="text-xs font-mono-num font-semibold text-[#DCE5E7]">
                          ${v.freightRatePerMT.toFixed(2)}/MT
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-hud uppercase tracking-wider text-[#82949A]">TOTAL COST</div>
                        <div className={`text-sm font-mono-num font-bold ${isWinner ? 'text-[#F47B3A]' : 'text-white'}`}>
                          ₹{v.costBreakdownCr.total} Cr
                        </div>
                      </div>

                      <div className="text-right hidden sm:block">
                        <div className="text-[10px] font-hud uppercase tracking-wider text-[#82949A]">CONFIDENCE</div>
                        <div className="text-xs font-mono-num text-[#4FA69A] font-semibold">
                          {v.confidencePct}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): "Why this vessel?" & Alerts & Insights */}
        <div className="lg:col-span-5 space-y-6">
          {/* "Why this vessel?" Card */}
          <div className="card-shell p-5 border-l-4 border-l-[#F47B3A]">
            <div className="flex items-center space-x-2 mb-3">
              <Award className="w-4 h-4 text-[#F47B3A]" />
              <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
                WHY THIS VESSEL? (EXECUTIVE RATIONALE)
              </h3>
            </div>

            <div className="p-3 bg-[#0D1A20] rounded-lg border border-[#30454D] mb-3.5">
              <p className="text-xs font-semibold text-[#F47B3A] font-hud uppercase tracking-wide">
                {whyThisVessel.headline}
              </p>
              <p className="text-xs text-[#DCE5E7] mt-1 leading-relaxed">
                {heroDecision.executiveSummary}
              </p>
            </div>

            <ul className="space-y-2.5">
              {whyThisVessel.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-xs text-[#82949A] leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4FA69A] shrink-0 mt-0.5" />
                  <span className="text-[#DCE5E7]">{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-3 border-t border-[#30454D] flex items-center justify-between text-[11px] font-mono-num text-[#82949A]">
              {(() => {
                const recV = candidateVessels.find(v => v.isRecommended) || candidateVessels[0];
                const discPort = activeRoute.portConstraints?.dischargePort;
                const portLimit = discPort?.maxDraftMeters || 14.5;
                const draft = recV?.draftMeters || '—';
                const pass = recV && discPort ? recV.draftMeters <= portLimit : true;
                return (
                  <>
                    <span>DRAFT SURVEY: <strong className={pass ? 'text-[#4FA69A]' : 'text-[#D9573F]'}>{draft}m / {portLimit}m ({pass ? 'PASS' : 'FAIL'})</strong></span>
                    <span>PARCEL MATCH: <strong className="text-[#4FA69A]">100%</strong></span>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Alerts & Insights Widget */}
          <div className="card-shell p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-[#D9A441]" />
                <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
                  OPERATIONAL ALERTS & INSIGHTS
                </h3>
              </div>
              <span className="text-[10px] font-mono-num text-[#82949A] px-1.5 py-0.5 rounded bg-[#0D1A20] border border-[#30454D]">
                LIVE FEED
              </span>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => {
                const isOpp = alert.type === 'opportunity';
                const isPort = alert.type === 'port';
                return (
                  <div
                    key={alert.id}
                    className="p-3 bg-[#0D1A20] border border-[#30454D] rounded-lg space-y-1 hover:border-[#82949A] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#DCE5E7] flex items-center space-x-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isOpp ? 'bg-[#F47B3A]' : isPort ? 'bg-[#D9A441]' : 'bg-[#4FA69A]'}`} />
                        <span>{alert.title}</span>
                      </span>
                      <span className={`text-[9px] font-mono-num font-bold px-1.5 py-0.5 rounded border ${
                        isOpp ? 'text-[#F47B3A] bg-[#F47B3A]/10 border-[#F47B3A]/30' : 'text-[#82949A] bg-[#20343C] border-[#30454D]'
                      }`}>
                        {alert.tag}
                      </span>
                    </div>
                    <p className="text-xs text-[#82949A] leading-relaxed">
                      {alert.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
