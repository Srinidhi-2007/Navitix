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

import { ROUTE_PRESETS, getRouteData, DEFAULT_ROUTE_ID } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeRouteId, setActiveRouteId] = useState(DEFAULT_ROUTE_ID);
  const [isCharterModalOpen, setIsCharterModalOpen] = useState(false);

  const activeRoute = getRouteData(activeRouteId);

  const handleSelectRoute = (routeId) => {
    setActiveRouteId(routeId);
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
            routePresets={ROUTE_PRESETS}
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
        {/* Sticky Header Topbar with Live UTC Clock */}
        <Header
          activeTab={activeTab}
          activeRoute={activeRoute}
          onSelectRoute={handleSelectRoute}
          routePresets={ROUTE_PRESETS}
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
