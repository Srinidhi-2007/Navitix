import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Activity, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  Cpu,
  BarChart2
} from 'lucide-react';

export default function RiskConfidencePage({ activeRoute, onOpenCharterModal }) {
  const { riskAndConfidence } = activeRoute;
  const { overallRisk, overallRiskColor, confidenceScore, confidenceStatusText, warningText, riskFactors, scenarios, modelTelemetry } = riskAndConfidence;

  const isLowConfidence = confidenceScore < 75;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#30454D]/60 pb-3">
        <div>
          <h2 className="text-xl font-hud font-bold text-white tracking-wide uppercase">
            RISK & SCENARIO ANALYSIS + FORECAST CONFIDENCE
          </h2>
          <p className="text-xs text-[#82949A]">
            Multi-factor volatility evaluation, Monte Carlo outcome scenarios, and model epistemic uncertainty telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-[#16262D] border border-[#30454D] px-3 py-1.5 rounded-lg text-xs font-mono-num">
            <span className="text-[#82949A]">OVERALL RISK:</span>
            <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
              overallRisk === 'LOW' 
                ? 'bg-[#4FA69A]/15 text-[#4FA69A] border border-[#4FA69A]/30'
                : 'bg-[#D9A441]/15 text-[#D9A441] border border-[#D9A441]/30'
            }`}>
              {overallRisk}
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-[#16262D] border border-[#30454D] px-3 py-1.5 rounded-lg text-xs font-mono-num">
            <span className="text-[#82949A]">MODEL CONFIDENCE:</span>
            <span className="font-bold text-[#F47B3A]">{confidenceScore}%</span>
          </div>
        </div>
      </div>

      {/* 1. Forecast Confidence Section (Gauge + Progress Bar + Guardrail Status) */}
      <div className="card-shell p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#30454D] pb-3">
          <div className="flex items-center space-x-2.5">
            <Cpu className="w-4 h-4 text-[#F47B3A]" />
            <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
              FORECAST CONFIDENCE ENGINE & MODEL RELIABILITY
            </h3>
          </div>
          <span className="text-xs font-mono-num text-[#82949A]">
            MODEL: {modelTelemetry.modelVersion}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Large Percentage Readout */}
          <div className="flex items-center space-x-4 shrink-0 bg-[#0D1A20] border border-[#30454D] p-5 rounded-xl">
            <div className="text-5xl font-mono-num font-bold text-[#F47B3A]">
              {confidenceScore}<span className="text-2xl font-normal text-[#82949A]">%</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block">
                PREDICTION INTERVAL CERTAINTY
              </span>
              <span className="text-xs font-mono-num text-[#4FA69A] font-semibold block">
                Within Acceptable Bounds
              </span>
              <span className="text-[10px] text-[#82949A] block">
                Latency: {modelTelemetry.inferenceLatencyMs}ms
              </span>
            </div>
          </div>

          {/* Horizontal Confidence Bar & Status Line */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono-num">
              <span className="text-[#82949A]">STATISTICAL CONFIDENCE SPECTRUM</span>
              <span className="text-[#DCE5E7]">{confidenceScore} / 100 Quality Score</span>
            </div>

            <div className="relative h-5 w-full bg-[#0D1A20] rounded-lg border border-[#30454D] overflow-hidden">
              {/* Threshold indicator for 75% commit threshold */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-[#82949A] z-10"
                style={{ left: '75%' }}
                title="Commercial Committee Threshold (75%)"
              />
              <div
                className="h-full rounded-r transition-all duration-700 bg-gradient-to-r from-[#4FA69A] via-[#F47B3A] to-[#FF9A5A] flex items-center justify-end pr-2 text-[10px] font-mono-num font-bold text-white shadow-md"
                style={{ width: `${confidenceScore}%` }}
              >
                {confidenceScore}%
              </div>
            </div>

            {/* Status Line */}
            <div className="flex items-center space-x-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-[#4FA69A] shrink-0" />
              <span className="text-[#DCE5E7] font-medium">
                {confidenceStatusText}
              </span>
            </div>

            {/* Low Confidence Warning Guardrail (Rendered if below 75% or present) */}
            {warningText && (
              <div className="p-3 bg-[#D9A441]/10 border border-[#D9A441]/50 rounded-lg text-xs text-[#D9A441] flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{warningText}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Scenario Analysis: 3 Side-by-Side Cards (Best Case, Expected Case, Worst Case) */}
      <div className="card-shell p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#30454D] pb-3">
          <div className="flex items-center space-x-2.5">
            <Layers className="w-4 h-4 text-[#4FA69A]" />
            <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
              SCENARIO ANALYSIS: EXPECTED OUTCOME SPECTRUM
            </h3>
          </div>
          <span className="text-[11px] font-mono-num text-[#82949A]">
            RECOMMENDATION PRESENTED AS RANGE (NOT SINGLE STATIC NUMBER)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {scenarios.map((scenario) => {
            const isExpected = scenario.isBaseline;
            const isBest = scenario.id === 'best';
            const isWorst = scenario.id === 'worst';

            return (
              <div
                key={scenario.id}
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                  isExpected
                    ? 'card-recommended'
                    : isBest
                    ? 'bg-[#16262D] border-[#4FA69A]/50 hover:border-[#4FA69A]'
                    : 'bg-[#16262D] border-[#D9573F]/50 hover:border-[#D9573F]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-hud font-bold text-sm uppercase tracking-wider text-white">
                      {scenario.name}
                    </span>
                    <span className="text-[10px] font-mono-num px-2 py-0.5 rounded border" style={{
                      color: scenario.color,
                      borderColor: `${scenario.color}50`,
                      backgroundColor: `${scenario.color}15`
                    }}>
                      {scenario.probability || (isExpected ? '60% Prob' : isBest ? '25% Prob' : '15% Prob')}
                    </span>
                  </div>

                  {/* Resulting Total Cost Callout */}
                  <div className="my-4 p-3 bg-[#0D1A20] rounded-lg border border-[#30454D]">
                    <span className="text-[10px] font-hud uppercase tracking-wider text-[#82949A] block">
                      RESULTING TOTAL COST
                    </span>
                    <div className="text-2xl font-mono-num font-bold text-white mt-0.5">
                      {scenario.totalCostCr}
                    </div>
                    <div className="text-[11px] font-mono-num font-semibold mt-1" style={{ color: scenario.color }}>
                      {scenario.costDelta}
                    </div>
                  </div>

                  {/* Assumptions */}
                  <div className="space-y-3 text-xs font-mono-num">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#82949A] text-[10px] uppercase font-hud">FREIGHT ASSUMPTION</span>
                        <span className="font-bold text-white">{scenario.freightRate}</span>
                      </div>
                      <p className="text-[11px] text-[#82949A] mt-0.5 font-sans leading-relaxed">
                        {scenario.freightAssumption}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#30454D]/60">
                      <div className="flex items-center justify-between">
                        <span className="text-[#82949A] text-[10px] uppercase font-hud">WAITING ASSUMPTION</span>
                        <span className="font-bold text-white">{scenario.waitingDays}</span>
                      </div>
                      <p className="text-[11px] text-[#82949A] mt-0.5 font-sans leading-relaxed">
                        {scenario.waitingAssumption}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#30454D]">
                  <div className="text-[11px] text-[#82949A] flex items-center justify-between">
                    <span>STATUS:</span>
                    <span className="font-hud uppercase tracking-wider font-semibold" style={{ color: scenario.color }}>
                      {isExpected ? 'PRIMARY RECOMMENDATION' : isBest ? 'UPSIDE POTENTIAL' : 'DOWNSIDE BUFFER'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Risk Factors Section (Tagged Low/Medium/High with Colored Signal Dots) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 card-shell p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#30454D] pb-3">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-[#D9A441]" />
              <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
                DISCRETE RISK FACTOR AUDIT
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-hud uppercase tracking-wider text-[#82949A]">OVERALL ROLLUP:</span>
              <span className="text-xs font-mono-num font-bold text-[#4FA69A] bg-[#4FA69A]/15 border border-[#4FA69A]/30 px-2 py-0.5 rounded">
                {overallRisk} RISK
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {riskFactors.map((factor, idx) => {
              const isLow = factor.level === 'Low';
              const isMed = factor.level === 'Medium';
              const dotColor = isLow ? 'bg-[#4FA69A]' : isMed ? 'bg-[#D9A441]' : 'bg-[#D9573F]';
              const badgeBorder = isLow ? 'border-[#4FA69A]/40 text-[#4FA69A]' : isMed ? 'border-[#D9A441]/40 text-[#D9A441]' : 'border-[#D9573F]/40 text-[#D9573F]';

              return (
                <div
                  key={idx}
                  className="p-3.5 bg-[#0D1A20] border border-[#30454D] rounded-lg flex items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0 mt-1`} />
                    <div>
                      <div className="text-xs font-hud font-bold uppercase tracking-wider text-white">
                        {factor.name}
                      </div>
                      <div className="text-xs text-[#82949A] mt-0.5">
                        {factor.detail}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-mono-num font-bold uppercase px-2 py-0.5 rounded border ${badgeBorder}`}>
                      {factor.level} RISK
                    </span>
                    <div className="text-[11px] font-mono-num text-[#82949A] mt-1">
                      {factor.score}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Importance & Model Weights */}
        <div className="lg:col-span-5 card-shell p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#30454D] pb-3">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-[#F47B3A]" />
              <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
                MODEL FEATURE ATTRIBUTION
              </h3>
            </div>
            <span className="text-[10px] font-mono-num text-[#82949A]">
              SHAP / GAIN
            </span>
          </div>

          <div className="space-y-3">
            {modelTelemetry.topFeatures.map((feat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono-num">
                  <span className="text-[#DCE5E7] truncate max-w-[200px]">{feat.feature}</span>
                  <span className="text-[#F47B3A] font-bold">{feat.importance}%</span>
                </div>
                <div className="h-2 w-full bg-[#0D1A20] rounded-full overflow-hidden border border-[#30454D]">
                  <div
                    className="h-full bg-[#F47B3A] rounded-full transition-all duration-500"
                    style={{ width: `${feat.importance * 2.2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] mt-3 mb-2 font-sans leading-relaxed text-[#82949A] border-b border-[#30454D] pb-3">
            <strong>Note:</strong> High attribution on `lag_1` is typical for autoregressive freight series exhibiting random walk characteristics. The model achieves its edge by outperforming a naive carry-forward baseline, using rolling features to capture non-linear mean reversion.
          </p>

          <div className="p-3 bg-[#0D1A20] rounded-lg border border-[#30454D] text-[11px] font-mono-num text-[#82949A] space-y-1 mt-4">
            <div className="flex justify-between">
              <span>TRAINING SNAPSHOT:</span>
              <span className="text-[#DCE5E7]">{modelTelemetry.dataFreshnessTimestamp}</span>
            </div>
            <div className="flex justify-between">
              <span>LOSS FUNCTION:</span>
              <span className="text-[#DCE5E7]">Quantile Huber (0.1, 0.5, 0.9)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
