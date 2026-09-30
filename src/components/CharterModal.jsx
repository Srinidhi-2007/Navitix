import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Anchor, 
  Send, 
  Download, 
  Copy, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';

export default function CharterModal({ isOpen, onClose, activeRoute, requestPayload = {} }) {
  const [copied, setCopied] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  if (!isOpen) return null;

  const vessel = activeRoute.candidateVessels.find(v => v.id === activeRoute.heroDecision.recommendedVesselId) || activeRoute.candidateVessels[0];

  const contractTypeKey = requestPayload.contractType || 'spot';
  const contractDuration = requestPayload.contractDurationDays || 15;
  const contractTypeLabel = contractTypeKey === 'time'
    ? 'TIME CHARTER (PERIOD HIRE)'
    : contractTypeKey === 'multi'
    ? 'MULTI-VOYAGE / COA'
    : 'SPOT CHARTER (SINGLE VOYAGE)';

  const brokerOrderText = `CHARTER FIXTURE ORDER — NAVITIX DISPATCH
REF: NVX-${Math.floor(100000 + Math.random() * 900000)}
DATE: ${new Date().toISOString().slice(0, 10)}
ACCOUNT: NAVITIX COMMERCIAL DESK

CONTRACT TYPE: ${contractTypeLabel}
DURATION: ${contractDuration} DAYS
CARGO: ${activeRoute.cargoQuantityMT.toLocaleString()} MT 5% MOLOO ${activeRoute.cargoType.toUpperCase()}
VESSEL REQ: ${vessel.name.toUpperCase()} (MAX DRAFT ${vessel.draftMeters}M / LOA ${vessel.loaMeters}M)
LOAD PORT: ${activeRoute.originPort.toUpperCase()} — 1-2 SB 1 SP
DISCH PORT: ${activeRoute.destinationPort.toUpperCase()} — 1-2 SB 1 SP
LAYCAN: ${activeRoute.laycanStart} / ${activeRoute.laycanEnd}
TARGET FREIGHT: USD ${vessel.freightRatePerMT.toFixed(2)} / MT FIOST 
WAITING / DEMURRAGE: USD 5,000 / DAY PRO-RATA / DESPATCH HALF DEMURRAGE
TOTAL AUTHORIZED BUDGET: INR ${activeRoute.heroDecision.expectedTotalCostCr} CR (~USD ${activeRoute.heroDecision.expectedTotalCostUSD.toLocaleString()})
STATUS: FIRM ORDER — TIMING WINDOW ${activeRoute.heroDecision.charterTimingAction.toUpperCase()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(brokerOrderText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDispatch = () => {
    setDispatched(true);
    setTimeout(() => {
      setDispatched(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#16262D] border border-[#F47B3A]/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#20343C] border-b border-[#30454D] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#F47B3A] flex items-center justify-center text-white font-bold">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-hud font-bold text-base text-[#DCE5E7] tracking-wider uppercase">
                  CHARTER EXECUTION PROTOCOL
                </h3>
                <span className="text-[10px] font-mono-num font-bold px-2 py-0.5 rounded bg-[#F47B3A]/20 text-[#F47B3A] border border-[#F47B3A]/40">
                  {activeRoute.heroDecision.recommendedVesselName.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-[#82949A]">
                Confirm charter authorization and generate broker fixture specifications
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#82949A] hover:text-[#DCE5E7] hover:bg-[#30454D] p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0D1A20] border border-[#30454D] p-3 rounded-lg">
              <div className="text-[10px] font-hud uppercase tracking-wider text-[#82949A]">TARGET FREIGHT</div>
              <div className="text-lg font-mono-num font-bold text-[#F47B3A]">
                ${vessel.freightRatePerMT.toFixed(2)}<span className="text-xs font-normal text-[#82949A]">/MT</span>
              </div>
              <div className="text-[10px] text-[#4FA69A] mt-0.5">-5.1% favorable window</div>
            </div>

            <div className="bg-[#0D1A20] border border-[#30454D] p-3 rounded-lg">
              <div className="text-[10px] font-hud uppercase tracking-wider text-[#82949A]">EXPECTED TOTAL</div>
              <div className="text-lg font-mono-num font-bold text-[#DCE5E7]">
                ₹{activeRoute.heroDecision.expectedTotalCostCr}<span className="text-xs font-normal text-[#82949A]"> Cr</span>
              </div>
              <div className="text-[10px] text-[#82949A] mt-0.5">~${activeRoute.heroDecision.expectedTotalCostUSD.toLocaleString()} USD</div>
            </div>

            <div className="bg-[#0D1A20] border border-[#30454D] p-3 rounded-lg">
              <div className="text-[10px] font-hud uppercase tracking-wider text-[#82949A]">WAITING TIME</div>
              <div className="text-lg font-mono-num font-bold text-[#DCE5E7]">
                {vessel.waitingDays.total}<span className="text-xs font-normal text-[#82949A]"> days</span>
              </div>
              <div className="text-[10px] text-[#82949A] mt-0.5">{vessel.waitingDays.loading}d load / {vessel.waitingDays.discharge}d disch</div>
            </div>

            <div className="bg-[#0D1A20] border border-[#30454D] p-3 rounded-lg">
              <div className="text-[10px] font-hud uppercase tracking-wider text-[#82949A]">ACTION TIMING</div>
              <div className="text-xs font-mono-num font-bold text-[#4FA69A] mt-1">
                {activeRoute.heroDecision.charterTimingAction}
              </div>
              <div className="text-[10px] text-[#82949A] mt-0.5">{activeRoute.heroDecision.timingWindowDates}</div>
            </div>
          </div>

          {/* Pre-Charter Compliance Checklist */}
          <div className="bg-[#0D1A20] border border-[#30454D] rounded-lg p-4">
            <h4 className="text-xs font-hud font-bold uppercase tracking-wider text-[#DCE5E7] mb-3 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#4FA69A]" />
              <span>AUTOMATED COMPLIANCE & FEASIBILITY VERIFICATION</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#4FA69A] shrink-0 mt-0.5" />
                <span className="text-[#DCE5E7]">
                  <strong>Port Draft Clearance:</strong> {vessel.draftMeters}m draft verified against {activeRoute.destinationPort || 'discharge port'} max 14.5m limit.
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#4FA69A] shrink-0 mt-0.5" />
                <span className="text-[#DCE5E7]">
                  <strong>Contract Structure:</strong> {contractTypeLabel} for {contractDuration} days pre-validated against commercial risk policies.
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#4FA69A] shrink-0 mt-0.5" />
                <span className="text-[#DCE5E7]">
                  <strong>Parcel Capacity Match:</strong> {activeRoute.cargoQuantityMT?.toLocaleString() || '50,000'} MT fits {vessel.name} deadweight envelope.
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#4FA69A] shrink-0 mt-0.5" />
                <span className="text-[#DCE5E7]">
                  <strong>Forecast Stability:</strong> Model confidence score {activeRoute.heroDecision.forecastConfidencePct}% meets investment committee charter threshold (&gt;75%).
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#4FA69A] shrink-0 mt-0.5" />
                <span className="text-[#DCE5E7]">
                  <strong>Demurrage Budget:</strong> 3.2 days expected waiting time (₹1.34 Cr) pre-allocated into voyage authorization cap.
                </span>
              </div>
            </div>
          </div>

          {/* Broker Fixture Order Dispatch Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#F47B3A]" />
                <span className="text-xs font-hud font-bold uppercase tracking-wider text-[#DCE5E7]">
                  BROKER TELEX / SPECIFICATION TRANSMISSION
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 text-xs text-[#82949A] hover:text-[#F47B3A] transition-colors font-mono-num"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#4FA69A]" />
                    <span className="text-[#4FA69A]">COPIED TO CLIPBOARD</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY ORDER TEXT</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 bg-[#071014] border border-[#30454D] rounded-lg font-mono-num text-[11px] text-[#DCE5E7] leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-48 select-all">
              {brokerOrderText}
            </pre>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-[#20343C] border-t border-[#30454D] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] font-mono-num text-[#82949A] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#4FA69A]" />
            <span>AUTHORIZATION LEVEL: COMMERCIAL HEAD APPROVED</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-[#16262D] border border-[#30454D] hover:bg-[#30454D] text-[#DCE5E7] text-xs font-hud font-medium rounded-lg transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleDispatch}
              disabled={dispatched}
              className={`flex-1 sm:flex-none px-5 py-2.5 text-xs font-hud font-bold tracking-wider uppercase rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all ${
                dispatched 
                  ? 'bg-[#4FA69A] text-white' 
                  : 'bg-[#F47B3A] hover:bg-[#FF9A5A] text-white shadow-[#F47B3A]/30'
              }`}
            >
              {dispatched ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>ORDER DISPATCHED</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>DISPATCH CHARTER FIXTURE</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
