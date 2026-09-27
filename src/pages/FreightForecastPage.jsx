import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Layers, 
  Info, 
  Sparkles, 
  Clock, 
  Compass, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export default function FreightForecastPage({ activeRoute, onOpenCharterModal }) {
  const { freightForecast, heroDecision } = activeRoute;
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [timeHorizon, setTimeHorizon] = useState('14D');
  const [showBenchmark, setShowBenchmark] = useState(true);
  const [showIntervals, setShowIntervals] = useState(true);

  const points = freightForecast.timeSeries;

  // Chart coordinate math
  const chartWidth = 840;
  const chartHeight = 340;
  const paddingX = 45;
  const paddingY = 35;

  // Auto-scale chart Y axis from actual data (pad 1.5 on each side)
  const allRates = points.flatMap(p => [p.actualRate, p.forecastRate, p.lowerBand, p.upperBand].filter(v => v !== null));
  const minRate = allRates.length > 0 ? Math.floor(Math.min(...allRates) - 1.5) : 25;
  const maxRate = allRates.length > 0 ? Math.ceil(Math.max(...allRates) + 1.5) : 34;
  const rateRange = maxRate - minRate;

  const getX = (idx) => paddingX + (idx / (points.length - 1)) * (chartWidth - 2 * paddingX);
  const getY = (val) => chartHeight - paddingY - ((val - minRate) / rateRange) * (chartHeight - 2 * paddingY);

  // Split historical and forecast
  const histPoints = points.filter(p => p.actualRate !== null);
  const forecastPoints = points.filter(p => p.forecastRate !== null);

  const histPath = histPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(points.indexOf(p))},${getY(p.actualRate)}`)
    .join(' ');

  const forecastPath = forecastPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(points.indexOf(p))},${getY(p.forecastRate)}`)
    .join(' ');

  // BPI benchmark: normalize raw index values (≈1400) to $/MT scale using BPI_TO_USD_PER_MT≈0.019
  // The backend sends raw BPI index; divide by 52.65 to approximate $/MT for chart rendering.
  const BPI_DIVISOR = 52.65;
  const benchmarkPath = points
    .filter(p => p.benchmarkBPI !== undefined && p.benchmarkBPI !== null)
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(points.indexOf(p))},${getY(p.benchmarkBPI / BPI_DIVISOR)}`)
    .join(' ');

  // Prediction interval polygon
  const forecastOnly = points.filter(p => p.forecastRate !== null && p.lowerBand !== null && p.upperBand !== null);
  let intervalPolygon = '';
  if (forecastOnly.length > 0) {
    const topPoints = forecastOnly.map(p => `${getX(points.indexOf(p))},${getY(p.upperBand)}`);
    const bottomPoints = [...forecastOnly].reverse().map(p => `${getX(points.indexOf(p))},${getY(p.lowerBand)}`);
    intervalPolygon = `M ${topPoints.join(' L ')} L ${bottomPoints.join(' L ')} Z`;
  }

  // Optimal Window Coordinates
  const optStartIndex = points.findIndex(p => p.inOptimalWindow);
  const optEndIndex = points.findLastIndex(p => p.inOptimalWindow);
  const optStartX = getX(optStartIndex !== -1 ? optStartIndex : 9);
  const optEndX = getX(optEndIndex !== -1 ? optEndIndex : 12);

  // Current rate coordinates
  const currentPointIndex = points.findIndex(p => p.isCurrent);
  const currentPoint = points[currentPointIndex];
  const currentX = getX(currentPointIndex);
  const currentY = getY(currentPoint.actualRate);

  const isFavorable = freightForecast.expectedChangePct < 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Mission-Control Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#30454D]/60 pb-3">
        <div>
          <h2 className="text-xl font-hud font-bold text-white tracking-wide uppercase">
            FREIGHT RATE PREDICTIVE FORECAST
          </h2>
          <p className="text-xs text-[#82949A]">
            Ensemble 14-day rate trajectory with confidence interval envelopes and optimal charter negotiation window.
          </p>
        </div>

        {/* Chart View Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#16262D] border border-[#30454D] rounded-lg p-1 text-xs">
            {['7D', '14D', '30D'].map((horizon) => (
              <button
                key={horizon}
                onClick={() => setTimeHorizon(horizon)}
                className={`px-2.5 py-1 rounded font-mono-num transition-colors ${
                  timeHorizon === horizon
                    ? 'bg-[#F47B3A] text-white font-bold'
                    : 'text-[#82949A] hover:text-[#DCE5E7]'
                }`}
              >
                {horizon}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowIntervals(!showIntervals)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-hud transition-colors ${
              showIntervals
                ? 'bg-[#20343C] border-[#F47B3A]/40 text-[#F47B3A]'
                : 'bg-[#16262D] border-[#30454D] text-[#82949A]'
            }`}
          >
            CONFIDENCE BAND (95% CI)
          </button>

          <button
            onClick={() => setShowBenchmark(!showBenchmark)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-hud transition-colors ${
              showBenchmark
                ? 'bg-[#20343C] border-[#82949A]/40 text-[#DCE5E7]'
                : 'bg-[#16262D] border-[#30454D] text-[#82949A]'
            }`}
          >
            BPI BENCHMARK
          </button>
        </div>
      </div>

      {/* Main Feature: Single Large Centerpiece Chart */}
      <div className="card-shell p-6 space-y-4">
        {/* Chart Legend & Telemetry Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono-num border-b border-[#30454D] pb-3">
          <div className="flex items-center space-x-5">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-0.5 bg-[#4FA69A] inline-block" />
              <span className="text-[#DCE5E7]">Historical Spot Rate ($/MT)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-0.5 border-b-2 border-dashed border-[#F47B3A] inline-block" />
              <span className="text-[#F47B3A] font-bold">Predicted Trajectory ($/MT)</span>
            </div>
            {showIntervals && (
              <div className="flex items-center space-x-2">
                <span className="w-4 h-3 bg-[#F47B3A]/20 border border-[#F47B3A]/40 inline-block rounded-xs" />
                <span className="text-[#82949A]">Prediction Interval (±95% CI)</span>
              </div>
            )}
            {showBenchmark && (
              <div className="flex items-center space-x-2">
                <span className="w-5 h-0.5 bg-[#82949A]/60 inline-block" />
                <span className="text-[#82949A]">Baltic Panamax Index</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-[#82949A]">
            <Clock className="w-3.5 h-3.5 text-[#F47B3A]" />
            <span>MODEL HORIZON: <strong>T+14 DAYS</strong></span>
          </div>
        </div>

        {/* SVG Responsive Chart Viewport */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-80 overflow-visible select-none"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="predictionAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F47B3A" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#F47B3A" stopOpacity="0.04" />
              </linearGradient>

              <linearGradient id="charterWindowHighlight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F47B3A" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#F47B3A" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines — auto-scaled to match actual rate data */}
            {Array.from({ length: 5 }, (_, i) => Math.round(minRate + (i / 4) * (maxRate - minRate))).map((val) => {
              const y = getY(val);
              return (
                <g key={val}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="#30454D"
                    strokeDasharray="3 3"
                    strokeOpacity="0.6"
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="#82949A"
                    fontSize="10"
                    fontFamily="JetBrains Mono"
                  >
                    ${val}
                  </text>
                </g>
              );
            })}

            {/* Optimal Charter Window Shaded Band */}
            <rect
              x={optStartX}
              y={paddingY}
              width={Math.max(40, optEndX - optStartX)}
              height={chartHeight - 2 * paddingY}
              fill="url(#charterWindowHighlight)"
              stroke="#F47B3A"
              strokeDasharray="4 2"
              strokeOpacity="0.5"
              rx="4"
            />
            <text
              x={optStartX + (optEndX - optStartX) / 2}
              y={paddingY - 12}
              textAnchor="middle"
              fill="#F47B3A"
              fontSize="10"
              fontFamily="Space Grotesk"
              fontWeight="bold"
              letterSpacing="0.08em"
            >
              RECOMMENDED CHARTER WINDOW ({freightForecast.optimalWindowDateRange})
            </text>

            {/* Prediction Interval Shaded Band */}
            {showIntervals && intervalPolygon && (
              <path
                d={intervalPolygon}
                fill="url(#predictionAreaGrad)"
                stroke="#F47B3A"
                strokeOpacity="0.2"
              />
            )}

            {/* Benchmark line */}
            {showBenchmark && benchmarkPath && (
              <path
                d={benchmarkPath}
                fill="none"
                stroke="#82949A"
                strokeWidth="1.5"
                strokeOpacity="0.5"
              />
            )}

            {/* Historical Rate Path (Solid Teal) */}
            <path
              d={histPath}
              fill="none"
              stroke="#4FA69A"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Forecast Rate Path (Dashed Orange) */}
            <path
              d={forecastPath}
              fill="none"
              stroke="#F47B3A"
              strokeWidth="3"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />

            {/* Vertical Marker Line for TODAY */}
            <line
              x1={currentX}
              y1={paddingY}
              x2={currentX}
              y2={chartHeight - paddingY}
              stroke="#DCE5E7"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <text
              x={currentX}
              y={paddingY - 12}
              textAnchor="middle"
              fill="#DCE5E7"
              fontSize="10"
              fontFamily="JetBrains Mono"
              fontWeight="bold"
            >
              TODAY (CURRENT)
            </text>

            {/* Historical Point Nodes */}
            {histPoints.map((p) => {
              const cx = getX(points.indexOf(p));
              const cy = getY(p.actualRate);
              return (
                <circle
                  key={p.date}
                  cx={cx}
                  cy={cy}
                  r="3.5"
                  fill="#4FA69A"
                  stroke="#071014"
                  strokeWidth="1.5"
                  className="hover:r-5 cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint(p)}
                />
              );
            })}

            {/* Forecast Point Nodes */}
            {forecastPoints.map((p) => {
              const cx = getX(points.indexOf(p));
              const cy = getY(p.forecastRate);
              const isTrough = p.isTrough;
              return (
                <g key={p.date}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isTrough ? "6" : "4"}
                    fill={isTrough ? "#F47B3A" : "#20343C"}
                    stroke="#F47B3A"
                    strokeWidth="2"
                    className="hover:r-6 cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredPoint(p)}
                  />
                  {isTrough && (
                    <text
                      x={cx}
                      y={cy + 18}
                      textAnchor="middle"
                      fill="#F47B3A"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      LOWEST: ${p.forecastRate}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Current Market Rate Point Highlight */}
            <circle cx={currentX} cy={currentY} r="6" fill="#DCE5E7" stroke="#071014" strokeWidth="2.5" />
            <text
              x={currentX}
              y={currentY - 12}
              textAnchor="middle"
              fill="#DCE5E7"
              fontSize="11"
              fontFamily="JetBrains Mono"
              fontWeight="bold"
            >
              ${currentPoint.actualRate}
            </text>

            {/* X-axis date labels */}
            {points.map((p, idx) => {
              // Show alternate or key labels to avoid crowding
              if (idx % 2 !== 0 && !p.isCurrent && !p.isTrough) return null;
              const x = getX(idx);
              return (
                <text
                  key={idx}
                  x={x}
                  y={chartHeight - paddingY + 18}
                  textAnchor="middle"
                  fill={p.isCurrent ? "#DCE5E7" : p.inOptimalWindow ? "#F47B3A" : "#82949A"}
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  fontWeight={p.isCurrent || p.inOptimalWindow ? "bold" : "normal"}
                >
                  {p.date}
                </text>
              );
            })}
          </svg>

          {/* Interactive Hover Tooltip Overlay */}
          {hoveredPoint && (
            <div className="absolute top-4 right-4 bg-[#16262D]/95 border border-[#F47B3A] rounded-lg p-3 shadow-xl backdrop-blur-md text-xs font-mono-num space-y-1">
              <div className="font-hud font-bold text-[#DCE5E7] uppercase border-b border-[#30454D] pb-1">
                {hoveredPoint.date} · {hoveredPoint.isHistorical ? 'HISTORICAL SPOT' : 'PREDICTED FORECAST'}
              </div>
              <div className="flex items-center justify-between space-x-4">
                <span className="text-[#82949A]">Rate:</span>
                <span className="font-bold text-[#F47B3A]">
                  ${hoveredPoint.actualRate || hoveredPoint.forecastRate}/MT
                </span>
              </div>
              {hoveredPoint.lowerBand && (
                <div className="flex items-center justify-between space-x-4 text-[11px]">
                  <span className="text-[#82949A]">95% CI Range:</span>
                  <span className="text-[#DCE5E7]">
                    ${hoveredPoint.lowerBand} – ${hoveredPoint.upperBand}
                  </span>
                </div>
              )}
              {hoveredPoint.benchmarkBPI && (
                <div className="flex items-center justify-between space-x-4 text-[11px]">
                  <span className="text-[#82949A]">BPI Benchmark:</span>
                  <span className="text-[#82949A]">${hoveredPoint.benchmarkBPI}/MT</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3 Stat Callouts Below Chart */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#30454D]">
          {/* Current Rate */}
          <div className="p-4 bg-[#0D1A20] border border-[#30454D] rounded-lg">
            <span className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block">
              CURRENT MARKET RATE
            </span>
            <div className="text-2xl font-mono-num font-bold text-[#DCE5E7] mt-1">
              ${freightForecast.currentMarketRate.toFixed(2)}
              <span className="text-xs font-normal text-[#82949A]"> /MT</span>
            </div>
            <p className="text-[11px] text-[#82949A] mt-1">
              Recorded across prompt Pacific basin fixtures today
            </p>
          </div>

          {/* Forecast in N Days */}
          <div className="p-4 bg-[#0D1A20] border border-[#F47B3A]/40 rounded-lg bg-[#F47B3A]/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-hud uppercase tracking-wider text-[#F47B3A] font-bold">
                FORECAST TROUGH (DAY +{freightForecast.troughDayOffset})
              </span>
              <span className="text-[9px] font-mono-num bg-[#F47B3A]/20 text-[#F47B3A] px-1.5 py-0.5 rounded">
                KEY DECISION
              </span>
            </div>
            <div className="text-2xl font-mono-num font-bold text-[#F47B3A] mt-1">
              ${freightForecast.troughRate?.toFixed(2) ?? freightForecast.forecastRateIn7Days?.toFixed(2)}
              <span className="text-xs font-normal text-[#82949A]"> /MT</span>
            </div>
            <p className="text-[11px] text-[#82949A] mt-1">
              Projected trough · Charter in {freightForecast.optimalWindowDateRange}
            </p>
          </div>

          {/* Expected Change */}
          <div className="p-4 bg-[#0D1A20] border border-[#30454D] rounded-lg">
            <span className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block">
              EXPECTED CHANGE OVER WINDOW
            </span>
            <div className={`text-2xl font-mono-num font-bold mt-1 flex items-center space-x-1.5 ${
              isFavorable ? 'text-[#4FA69A]' : 'text-[#D9573F]'
            }`}>
              {isFavorable ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
              <span>{freightForecast.expectedChangePct}%</span>
            </div>
            <p className="text-[11px] font-mono-num mt-1">
              {isFavorable ? (
                <span className="text-[#4FA69A]">Favorable: Saves ~$75,000 USD on 50k MT</span>
              ) : (
                <span className="text-[#D9573F]">Unfavorable rate inflation</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Strategic Recommendation Callout */}
      <div className="card-shell p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-[#F47B3A]">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#F47B3A]" />
            <h4 className="text-xs font-hud font-bold uppercase tracking-wider text-[#DCE5E7]">
              RECOMMENDED CHARTER ACTION: {heroDecision.charterTimingAction.toUpperCase()}
            </h4>
          </div>
          <p className="text-xs text-[#82949A] mt-1 max-w-2xl">
            {heroDecision.timingRationale}. Initiating negotiations within {heroDecision.timingWindowDates} captures the predicted bottom of the cycle.
          </p>
        </div>

        <button
          onClick={onOpenCharterModal}
          className="px-6 py-2.5 bg-[#F47B3A] hover:bg-[#FF9A5A] text-white text-xs font-hud font-bold tracking-wider uppercase rounded-lg shadow-md transition-all shrink-0 cursor-pointer"
        >
          EXECUTE AT TROUGH RATE
        </button>
      </div>
    </div>
  );
}
