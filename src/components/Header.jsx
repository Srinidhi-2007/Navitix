import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Clock, Compass, Anchor, ChevronRight } from 'lucide-react';

export default function Header({ activeTab, activeRoute, onSelectRoute, routePresets }) {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = (tab) => {
    switch (tab) {
      case 'overview': return { title: 'Overview / Decision Dashboard', section: 'MISSION CONTROL' };
      case 'vessel-route': return { title: 'Vessel & Route + Port Constraints', section: 'VOYAGE FEASIBILITY' };
      case 'freight-forecast': return { title: 'Freight Forecast', section: 'MARKET PREDICTIVE ENGINE' };
      case 'cost-analysis': return { title: 'Cost Analysis', section: 'FINANCIAL APPRAISAL' };
      case 'risk-confidence': return { title: 'Risk & Scenario Analysis + Forecast Confidence', section: 'RISK MANAGEMENT' };
      case 'compare-vessels': return { title: 'Compare Vessels', section: 'FLEET EVALUATION' };
      case 'settings': return { title: 'System & Model Settings', section: 'CONFIGURATION' };
      default: return { title: 'Charter AI Dashboard', section: 'OPERATIONS' };
    }
  };

  const pageMeta = getPageTitle(activeTab);

  return (
    <header className="sticky top-0 z-30 bg-[#071014]/90 backdrop-blur-md border-b border-[#30454D] px-6 py-3 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Brand Identity & Active Route Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F47B3A]/15 border border-[#F47B3A]/40 flex items-center justify-center text-[#F47B3A] shadow-sm shadow-[#F47B3A]/20">
              <Anchor className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-hud font-bold text-base tracking-wider text-[#DCE5E7]">CHARTER AI</span>
                <span className="text-[10px] font-mono-num font-medium px-1.5 py-0.5 rounded bg-[#20343C] text-[#82949A] border border-[#30454D]">
                  v2.4 HUD
                </span>
              </div>
              <p className="text-[11px] text-[#82949A] tracking-tight">MARITIME CHARTERING DECISION SYSTEM</p>
            </div>
          </div>

          <div className="hidden lg:block h-6 w-[1px] bg-[#30454D]" />

          {/* Active Route Quick Switcher */}
          <div className="hidden sm:flex items-center space-x-2 bg-[#16262D] border border-[#30454D] rounded-lg px-2.5 py-1.5 text-xs">
            <Compass className="w-3.5 h-3.5 text-[#F47B3A]" />
            <span className="text-[#82949A] text-[11px] font-medium uppercase font-hud">ACTIVE QUERY:</span>
            <select
              value={activeRoute.id}
              onChange={(e) => onSelectRoute(e.target.value)}
              className="bg-transparent text-[#DCE5E7] text-xs font-medium focus:outline-none cursor-pointer pr-2 hover:text-[#F47B3A] transition-colors"
            >
              {routePresets.map(preset => (
                <option key={preset.id} value={preset.id} className="bg-[#16262D] text-[#DCE5E7]">
                  {preset.originFlag} {preset.cargoQuantityMT.toLocaleString()} MT {preset.cargoType} ({preset.originPort.split(' ')[0]} → {preset.destinationPort.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Telemetry status & Live Mission-Control Clock */}
        <div className="flex items-center justify-between md:justify-end space-x-4">
          <div className="flex items-center space-x-2 bg-[#16262D]/70 border border-[#30454D] px-2.5 py-1 rounded-md text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4FA69A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4FA69A]"></span>
            </span>
            <span className="text-[11px] font-mono-num text-[#4FA69A] font-semibold tracking-wider">
              TELEMETRY ACTIVE
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-[#16262D] border border-[#30454D] px-3 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 text-[#F47B3A]" />
            <span className="font-mono-num font-semibold text-xs tracking-wider text-[#DCE5E7]">
              {utcTime || '00:00:00 UTC'}
            </span>
          </div>
        </div>
      </div>

      {/* Breadcrumb & Section Sub-bar */}
      <div className="mt-2.5 pt-2 border-t border-[#30454D]/60 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5 text-[#82949A]">
          <span className="text-[#82949A] uppercase tracking-wider font-hud text-[11px]">{pageMeta.section}</span>
          <ChevronRight className="w-3 h-3 text-[#82949A]" />
          <span className="text-[#DCE5E7] font-medium">{pageMeta.title}</span>
        </div>

        <div className="hidden md:flex items-center space-x-3 text-[11px] font-mono-num text-[#82949A]">
          <span>LAYCAN: <span className="text-[#DCE5E7]">{activeRoute.laycanStart}</span> to <span className="text-[#DCE5E7]">{activeRoute.laycanEnd}</span></span>
          <span className="text-[#30454D]">|</span>
          <span>DIST: <span className="text-[#DCE5E7]">{activeRoute.voyageDistanceNM.toLocaleString()} NM</span></span>
        </div>
      </div>
    </header>
  );
}
