import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CharterModal from './components/CharterModal';

import OverviewPage from './pages/OverviewPage';
import VesselRoutePage from './pages/VesselRoutePage';
import FreightForecastPage from './pages/FreightForecastPage';
import CostAnalysisPage from './pages/CostAnalysisPage';
import RiskConfidencePage from './pages/RiskConfidencePage';
import CompareVesselsPage from './pages/CompareVesselsPage';
import SettingsPage from './pages/SettingsPage';

import { useRecommendation } from './hooks/useRecommendation';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCharterModalOpen, setIsCharterModalOpen] = useState(false);

  const {
    activeRoute,
    activeRouteId,
    requestPayload,
    status,
    errorMessage,
    validationWarning,
    isLoading,
    isLive,
    isFallback,
    isError,
    loadingPorts,
    dischargePorts,
    routesList,
    routePresets,
    selectRoute,
    updateRequest,
    applyScenario,
    refetch,
  } = useRecommendation();

  const handleSelectRoute = (routeId) => {
    selectRoute(routeId);
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewPage
            activeRoute={activeRoute}
            onOpenCharterModal={() => setIsCharterModalOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'vessel-route':
        return (
          <VesselRoutePage
            activeRoute={activeRoute}
            onSelectRoute={handleSelectRoute}
            routePresets={routePresets}
            requestPayload={requestPayload}
            updateRequest={updateRequest}
            applyScenario={applyScenario}
            loadingPorts={loadingPorts}
            dischargePorts={dischargePorts}
            routesList={routesList}
            validationWarning={validationWarning}
          />
        );
      case 'freight-forecast':
        return (
          <FreightForecastPage
            activeRoute={activeRoute}
            onOpenCharterModal={() => setIsCharterModalOpen(true)}
          />
        );
      case 'cost-analysis':
        return (
          <CostAnalysisPage
            activeRoute={activeRoute}
            onOpenCharterModal={() => setIsCharterModalOpen(true)}
          />
        );
      case 'risk-confidence':
        return (
          <RiskConfidencePage
            activeRoute={activeRoute}
            onOpenCharterModal={() => setIsCharterModalOpen(true)}
          />
        );
      case 'compare-vessels':
        return (
          <CompareVesselsPage
            activeRoute={activeRoute}
            onOpenCharterModal={() => setIsCharterModalOpen(true)}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            activeRoute={activeRoute}
            requestPayload={requestPayload}
            updateRequest={updateRequest}
          />
        );
      default:
        return (
          <OverviewPage
            activeRoute={activeRoute}
            onOpenCharterModal={() => setIsCharterModalOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#071014] text-[#DCE5E7] font-sans antialiased">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        activeRoute={activeRoute}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto hud-grid-bg">
        {/* Backend Model Connection Status Strip */}
        <div className="w-full shrink-0">
          {isLoading && (
            <div className="bg-[#F47B3A]/10 border-b border-[#F47B3A]/30 px-6 py-1.5 text-xs text-[#F47B3A] flex items-center justify-between font-mono">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F47B3A] animate-ping"></span>
                <span>COMPUTING VOYAGE DECISION MODEL...</span>
              </span>
              <span className="opacity-75">400ms debounce active</span>
            </div>
          )}

          {!isLoading && isLive && (
            <div className="bg-[#4FA69A]/10 border-b border-[#4FA69A]/30 px-6 py-1 text-xs text-[#4FA69A] flex items-center justify-between font-mono">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4FA69A] animate-pulse"></span>
                <span>LIVE MODEL ACTIVE &middot; {activeRoute?.riskAndConfidence?.modelTelemetry?.modelVersion || 'FastAPI Pipeline'}</span>
              </span>
              <span className="opacity-80 text-[11px]">Latency: {activeRoute?.riskAndConfidence?.modelTelemetry?.inferenceLatencyMs || 0}ms</span>
            </div>
          )}

          {!isLoading && isFallback && (
            <div className="bg-[#D9A441]/10 border-b border-[#D9A441]/30 px-6 py-1 text-xs text-[#D9A441] flex items-center justify-between font-mono">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D9A441]"></span>
                <span>DEMO DATA MODE &middot; Backend offline (displaying mock fixture preset)</span>
              </span>
              <button
                onClick={refetch}
                className="underline hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                Retry Live Connection
              </button>
            </div>
          )}

          {!isLoading && isError && (
            <div className="bg-[#D9573F]/10 border-b border-[#D9573F]/30 px-6 py-1 text-xs text-[#D9573F] flex items-center justify-between font-mono">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D9573F]"></span>
                <span>API ERROR: {errorMessage} (retained previous evaluation)</span>
              </span>
              <button
                onClick={refetch}
                className="underline hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Sticky Header Topbar with Live UTC Clock */}
        <Header
          activeTab={activeTab}
          activeRoute={activeRoute}
          onSelectRoute={handleSelectRoute}
          routePresets={routePresets}
        />

        {/* Page Content Container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* 3. Global Charter Execution Modal */}
      <CharterModal
        isOpen={isCharterModalOpen}
        onClose={() => setIsCharterModalOpen(false)}
        activeRoute={activeRoute}
      />
    </div>
  );
}
