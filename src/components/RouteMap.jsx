/**
 * Charter AI — Interactive Maritime Route Map
 * File: src/components/RouteMap.jsx
 *
 * Displays origin and destination port markers with bathymetric constraints,
 * dashed voyage route line, dark-mode OSM styling, and automated viewport fitting.
 */

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass, Anchor, Navigation, ShieldCheck, AlertCircle } from 'lucide-react';

// Fallback coordinate index for standard demo ports
export const PORT_COORDINATES = {
  'hay-point': { lat: -21.3, lon: 149.3, name: 'Hay Point Coal Terminal (DBCT)', country: 'Australia', verified: false },
  'paradip': { lat: 20.2654, lon: 86.6763, name: 'Paradip Port', country: 'India', verified: true },
  'port-hedland': { lat: -20.31, lon: 118.58, name: 'Port Hedland', country: 'Australia', verified: false },
  'qingdao': { lat: 36.0, lon: 120.2, name: 'Qingdao Qianwan Ore Terminal', country: 'China', verified: false },
  'santos': { lat: -23.96, lon: -46.3, name: 'Port of Santos (Outer Basin)', country: 'Brazil', verified: false },
  'alexandria': { lat: 31.2, lon: 29.9, name: 'Port of Alexandria Grain Terminal', country: 'Egypt', verified: false },
};

// Custom SVG Pulsing Markers for Maritime HUD
function createCustomPin(color, label, flag) {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="background: rgba(7, 16, 20, 0.9); border: 1.5px solid ${color}; color: #DCE5E7; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; white-space: nowrap; box-shadow: 0 0 10px ${color}66; margin-bottom: 3px; display: flex; align-items: center; gap: 4px;">
          <span>${flag || '⚓'}</span>
          <span>${label}</span>
        </div>
        <div style="width: 14px; height: 14px; border-radius: 50%; background: ${color}; border: 2px solid #FFFFFF; box-shadow: 0 0 12px ${color};"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

// Controller to smoothly fit map bounds on route selection change
function FitBoundsController({ originCoords, destCoords }) {
  const map = useMap();

  useEffect(() => {
    if (originCoords && destCoords) {
      const bounds = L.latLngBounds([
        [originCoords.lat, originCoords.lon],
        [destCoords.lat, destCoords.lon],
      ]);
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 6,
        animate: true,
        duration: 0.8,
      });
    }
  }, [originCoords, destCoords, map]);

  return null;
}

export default function RouteMap({ activeRoute, portsList = [] }) {
  const portMap = useMemo(() => {
    const map = { ...PORT_COORDINATES };
    portsList.forEach(p => {
      if (p.id) {
        map[p.id] = {
          lat: p.lat ?? map[p.id]?.lat ?? 0,
          lon: p.lon ?? map[p.id]?.lon ?? 0,
          name: p.name || map[p.id]?.name,
          country: p.country || map[p.id]?.country,
          verified: p.verified ?? map[p.id]?.verified ?? false,
          maxDraftM: p.portEnvelope?.maxDraftM ?? p.maxDraftM ?? 15.0,
          maxLoaM: p.portEnvelope?.maxLoaM ?? p.maxLoaM ?? 250,
          maxBeamM: p.portEnvelope?.maxBeamM ?? p.maxBeamM ?? 35,
          defaultCongestionDays: p.defaultCongestionDays ?? 1.5,
        };
      }
    });
    return map;
  }, [portsList]);

  const originId = activeRoute?.portConstraints?.loadingPort?.id || 'hay-point';
  const destId = activeRoute?.portConstraints?.dischargePort?.id || 'paradip';

  const origin = portMap[originId] || PORT_COORDINATES['hay-point'];
  const dest = portMap[destId] || PORT_COORDINATES['paradip'];

  const loadingPort = activeRoute?.portConstraints?.loadingPort || {};
  const dischargePort = activeRoute?.portConstraints?.dischargePort || {};

  const originIcon = useMemo(() => createCustomPin('#4FA69A', 'LOAD PORT', activeRoute?.originFlag || '🇦🇺'), [activeRoute?.originFlag]);
  const destIcon = useMemo(() => createCustomPin('#F47B3A', 'DISCHARGE', activeRoute?.destinationFlag || '🇮🇳'), [activeRoute?.destinationFlag]);

  const polylinePositions = [
    [origin.lat, origin.lon],
    [dest.lat, dest.lon],
  ];

  return (
    <div className="card-shell overflow-hidden border-[#30454D] space-y-0">
      {/* Map Header Controls */}
      <div className="p-4 bg-[#16262D] border-b border-[#30454D] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <Navigation className="w-4 h-4 text-[#F47B3A]" />
          <h3 className="font-hud font-bold text-xs uppercase tracking-wider text-[#DCE5E7]">
            VOYAGE GEODETIC TRACK & BATHYMETRIC PORTS
          </h3>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono text-[#82949A]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4FA69A]"></span>
            <span>Origin: <strong className="text-[#DCE5E7]">{origin.name}</strong></span>
          </span>
          <span className="text-[#30454D]">&rarr;</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F47B3A]"></span>
            <span>Dest: <strong className="text-[#DCE5E7]">{dest.name}</strong></span>
          </span>
          <span className="hidden sm:inline bg-[#0D1A20] px-2 py-0.5 rounded border border-[#30454D] text-[#DCE5E7]">
            {activeRoute?.voyageDistanceNM ? `${activeRoute.voyageDistanceNM.toLocaleString()} NM` : '4,620 NM'}
          </span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative h-[360px] w-full bg-[#071014]">
        <MapContainer
          center={[(origin.lat + dest.lat) / 2, (origin.lon + dest.lon) / 2]}
          zoom={3}
          scrollWheelZoom={false}
          className="h-full w-full z-10"
          style={{ background: '#071014' }}
        >
          {/* Dark-mode filter applied to standard OSM tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="dark-map-tiles"
          />

          <FitBoundsController originCoords={origin} destCoords={dest} />

          {/* Dashed Voyage Route Polyline */}
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#F47B3A',
              weight: 3,
              dashArray: '8, 8',
              opacity: 0.85,
            }}
          />

          {/* Origin Loading Port Marker */}
          <Marker position={[origin.lat, origin.lon]} icon={originIcon}>
            <Popup className="custom-hud-popup">
              <div className="p-1 space-y-1.5 font-sans text-[#DCE5E7] text-xs">
                <div className="font-hud font-bold text-sm text-white uppercase flex items-center gap-1.5 border-b border-[#30454D] pb-1">
                  <span>⚓</span>
                  <span>{origin.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono">
                  <div>Country: <strong>{origin.country}</strong></div>
                  <div>Max Draft: <strong className="text-[#4FA69A]">{loadingPort.maxDraftMeters || origin.maxDraftM || 19.5}m</strong></div>
                  <div>Max LOA: <strong>{loadingPort.maxLoaMeters || origin.maxLoaM || 300}m</strong></div>
                  <div>Max Beam: <strong>{loadingPort.maxBeamMeters || origin.maxBeamM || 50}m</strong></div>
                  <div>Berth: <strong>{loadingPort.berthLengthMeters || 350}m</strong></div>
                  <div>Congestion: <strong>{loadingPort.currentCongestionDays || 1.4}d</strong></div>
                </div>
                <div className="pt-1 border-t border-[#30454D] flex items-center gap-1 text-[10px] font-mono text-[#82949A]">
                  {origin.verified ? (
                    <span className="text-[#4FA69A] flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Official Port Envelope</span>
                  ) : (
                    <span className="text-[#D9A441] flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Indicative Bathymetry</span>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Destination Discharge Port Marker */}
          <Marker position={[dest.lat, dest.lon]} icon={destIcon}>
            <Popup className="custom-hud-popup">
              <div className="p-1 space-y-1.5 font-sans text-[#DCE5E7] text-xs">
                <div className="font-hud font-bold text-sm text-white uppercase flex items-center gap-1.5 border-b border-[#30454D] pb-1">
                  <span>📍</span>
                  <span>{dest.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono">
                  <div>Country: <strong>{dest.country}</strong></div>
                  <div>Max Draft: <strong className="text-[#D9A441]">{dischargePort.maxDraftMeters || dest.maxDraftM || 14.5}m</strong></div>
                  <div>Max LOA: <strong>{dischargePort.maxLoaMeters || dest.maxLoaM || 230}m</strong></div>
                  <div>Max Beam: <strong>{dischargePort.maxBeamMeters || dest.maxBeamM || 33}m</strong></div>
                  <div>Berth: <strong>{dischargePort.berthLengthMeters || 260}m</strong></div>
                  <div>Congestion: <strong>{dischargePort.currentCongestionDays || 1.8}d</strong></div>
                </div>
                <div className="pt-1 border-t border-[#30454D] flex items-center gap-1 text-[10px] font-mono text-[#82949A]">
                  {dest.verified ? (
                    <span className="text-[#4FA69A] flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Official Port Envelope</span>
                  ) : (
                    <span className="text-[#D9A441] flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Indicative Bathymetry</span>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Map Footer Information Strip */}
      <div className="p-3 bg-[#0D1A20] border-t border-[#30454D] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#82949A]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#F47B3A] border-b border-dashed border-[#F47B3A]"></span>
            <span>Great Circle / Transit Track</span>
          </span>
          <span>&middot;</span>
          <span>Click on markers for bathymetric specifications</span>
        </div>
        <div className="text-white font-semibold">
          DISCHARGE LIMIT: {dischargePort.maxDraftMeters || 14.5}M DRAFT
        </div>
      </div>
    </div>
  );
}
