import React from 'react';
import { 
  LayoutDashboard, 
  Ship, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Award, 
  Settings,
  Anchor,
  Radio,
  ExternalLink
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab, activeRoute }) {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview / Decision Dashboard',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
      badge: 'DECISION HUB',
      badgeColor: 'text-[#F47B3A] bg-[#F47B3A]/10 border-[#F47B3A]/30'
    },
    {
      id: 'vessel-route',
      label: 'Vessel & Route + Port Constraints',
      shortLabel: 'Vessel & Ports',
      icon: Ship,
      badge: 'FEASIBILITY',
      badgeColor: 'text-[#4FA69A] bg-[#4FA69A]/10 border-[#4FA69A]/30'
    },
    {
      id: 'freight-forecast',
      label: 'Freight Forecast',
      shortLabel: 'Forecast',
      icon: TrendingUp,
      badge: '14D MODEL',
      badgeColor: 'text-[#DCE5E7] bg-[#20343C] border-[#30454D]'
    },
    {
      id: 'cost-analysis',
      label: 'Cost Analysis',
      shortLabel: 'Cost Breakdown',
      icon: DollarSign,
      badge: '₹ CR BUDGET',
      badgeColor: 'text-[#DCE5E7] bg-[#20343C] border-[#30454D]'
    },
    {
      id: 'risk-confidence',
      label: 'Risk & Scenario Analysis + Forecast Confidence',
      shortLabel: 'Risk & Confidence',
      icon: AlertTriangle,
      badge: `${activeRoute.riskAndConfidence.confidenceScore}% CONF`,
      badgeColor: 'text-[#4FA69A] bg-[#4FA69A]/10 border-[#4FA69A]/30'
    },
    {
      id: 'compare-vessels',
      label: 'Compare Vessels',
      shortLabel: 'Compare Fleet',
      icon: Award,
      badge: '3 CANDIDATES',
      badgeColor: 'text-[#DCE5E7] bg-[#20343C] border-[#30454D]'
    },
    {
      id: 'settings',
      label: 'Settings',
      shortLabel: 'Settings & API',
      icon: Settings,
      badge: 'ML HOOKS',
      badgeColor: 'text-[#82949A] bg-[#20343C] border-[#30454D]'
    }
  ];

  return (
    <aside className="w-72 bg-[#0D1A20] border-r border-[#30454D] flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      {/* Top Branding */}
      <div>
        <div className="p-5 border-b border-[#30454D] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#F47B3A] flex items-center justify-center text-white shadow-md shadow-[#F47B3A]/30 font-bold">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-hud font-bold text-lg tracking-wider text-[#DCE5E7]">CHARTER AI</h1>
              <span className="text-[10px] font-mono-num text-[#82949A] tracking-wider uppercase">
                VESSEL DECISION SYSTEM
              </span>
            </div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#4FA69A] animate-pulse" title="System Operational" />
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3 py-1.5 text-[10px] font-hud font-bold uppercase tracking-wider text-[#82949A]">
            COMMAND MODULES
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-start space-x-3 px-3.5 py-3 rounded-lg text-left transition-all duration-150 group border ${
                  isActive
                    ? 'bg-[#F47B3A]/15 border-[#F47B3A] text-[#DCE5E7] shadow-lg shadow-[#F47B3A]/15'
                    : 'bg-transparent border-transparent text-[#82949A] hover:bg-[#16262D] hover:text-[#DCE5E7] hover:border-[#30454D]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 mt-0.5 shrink-0 transition-colors ${
                    isActive ? 'text-[#F47B3A]' : 'text-[#82949A] group-hover:text-[#DCE5E7]'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium tracking-wide ${isActive ? 'text-[#DCE5E7] font-semibold' : ''}`}>
                      {item.shortLabel}
                    </span>
                    {item.badge && (
                      <span className={`text-[9px] font-mono-num uppercase px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#82949A] truncate mt-0.5">
                    {item.label}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Mission-Control Telemetry Box */}
      <div className="p-4 border-t border-[#30454D] bg-[#071014]/60 space-y-3">
        <div className="bg-[#16262D] border border-[#30454D] rounded-lg p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-hud uppercase tracking-wider text-[#82949A]">TARGET FIXTURE</span>
            <span className="text-[10px] font-mono-num text-[#4FA69A] font-semibold">RECOMMENDED</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-base">{activeRoute.heroDecision.recommendedVesselIcon}</span>
            <div>
              <div className="text-xs font-bold text-[#F47B3A] tracking-wider uppercase font-hud">
                {activeRoute.heroDecision.recommendedVesselName}
              </div>
              <div className="text-[11px] font-mono-num text-[#DCE5E7]">
                Est. {activeRoute.heroDecision.charterTimingAction}
              </div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-[#30454D]/60 flex items-center justify-between text-[10px] font-mono-num text-[#82949A]">
            <span>TOTAL: <strong className="text-[#DCE5E7]">₹{activeRoute.heroDecision.expectedTotalCostCr} Cr</strong></span>
            <span>CONF: <strong className="text-[#4FA69A]">{activeRoute.heroDecision.forecastConfidencePct}%</strong></span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#82949A] px-1 font-mono-num">
          <span className="flex items-center space-x-1">
            <Radio className="w-3 h-3 text-[#4FA69A] animate-pulse" />
            <span>MODEL: XGB+PROPHET</span>
          </span>
          <span>v2.4</span>
        </div>
      </div>
    </aside>
  );
}
