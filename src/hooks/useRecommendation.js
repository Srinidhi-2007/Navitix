/**
 * Charter AI — Recommendation Hook
 * File: src/hooks/useRecommendation.js
 *
 * Provides reactive decision support state with debounced fetching,
 * automatic mock fallback on network disconnects, dynamic ports/routes loading,
 * and origin==destination validation guards.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getRecommendation, getPorts, getRoutes, ApiError } from '../api/charterApi';
import { adaptBackendResponse } from '../api/adapter';
import { ROUTE_PRESETS, getRouteData, DEFAULT_ROUTE_ID } from '../data/mockData';

// Fallback ports if API is offline
const FALLBACK_PORTS = [
  { id: 'hay-point', name: 'Hay Point Coal Terminal (DBCT)', country: 'Australia', role: 'load' },
  { id: 'port-hedland', name: 'Port Hedland', country: 'Australia', role: 'load' },
  { id: 'santos', name: 'Port of Santos (Outer Basin)', country: 'Brazil', role: 'load' },
  { id: 'paradip', name: 'Paradip Port', country: 'India', role: 'discharge' },
  { id: 'qingdao', name: 'Qingdao Qianwan Ore Terminal', country: 'China', role: 'discharge' },
  { id: 'alexandria', name: 'Port of Alexandria Grain Terminal', country: 'Egypt', role: 'discharge' },
];

export const PRESET_REQUEST_MAP = {
  'aus-paradip-coking-coal': {
    cargoType: 'Coking Coal',
    cargoQuantityMT: 50000,
    originPortId: 'hay-point',
    destinationPortId: 'paradip',
    laycanStart: '2026-09-12',
    laycanEnd: '2026-09-16',
    desiredArrivalDate: '2026-09-28',
    contractType: 'spot',
    contractDurationDays: 15,
    allowSplit: true,
    assumptions: { currency: 'INR', usdToInr: 83.2, demurrageUSDPerDay: 5000, bunkerFuelPricePerMT: 620 },
  },
  'aus-qingdao-iron-ore': {
    cargoType: 'Iron Ore Fines',
    cargoQuantityMT: 70000,
    originPortId: 'port-hedland',
    destinationPortId: 'qingdao',
    laycanStart: '2026-09-15',
    laycanEnd: '2026-09-19',
    desiredArrivalDate: '2026-09-29',
    contractType: 'spot',
    contractDurationDays: 15,
    allowSplit: true,
    assumptions: { currency: 'INR', usdToInr: 83.2, demurrageUSDPerDay: 5000, bunkerFuelPricePerMT: 620 },
  },
  'brazil-alexandria-soybeans': {
    cargoType: 'Soybeans in Bulk',
    cargoQuantityMT: 38000,
    originPortId: 'santos',
    destinationPortId: 'alexandria',
    laycanStart: '2026-09-20',
    laycanEnd: '2026-09-25',
    desiredArrivalDate: '2026-10-18',
    contractType: 'spot',
    contractDurationDays: 15,
    allowSplit: true,
    assumptions: { currency: 'INR', usdToInr: 83.2, demurrageUSDPerDay: 5000, bunkerFuelPricePerMT: 620 },
  },
};

export function useRecommendation(initialRouteId = DEFAULT_ROUTE_ID) {
  const [activeRouteId, setActiveRouteId] = useState(initialRouteId);
  const [requestPayload, setRequestPayload] = useState(
    PRESET_REQUEST_MAP[initialRouteId] || PRESET_REQUEST_MAP[DEFAULT_ROUTE_ID]
  );
  
  const [data, setData] = useState(() => getRouteData(initialRouteId));
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);
  const [validationWarning, setValidationWarning] = useState(null);

  // Dynamic ports and routes lists from API
  const [portsList, setPortsList] = useState(FALLBACK_PORTS);
  const [routesList, setRoutesList] = useState(ROUTE_PRESETS);

  const timerRef = useRef(null);

  // Load ports and routes from backend on mount
  useEffect(() => {
    let isMounted = true;

    async function loadMetadata() {
      try {
        const portsData = await getPorts();
        if (isMounted && portsData?.ports) {
          setPortsList(portsData.ports);
        }
      } catch (err) {
        console.warn('[useRecommendation] Using fallback ports:', err.message);
      }

      try {
        const routesData = await getRoutes();
        if (isMounted && routesData?.routes) {
          setRoutesList(routesData.routes);
        }
      } catch (err) {
        console.warn('[useRecommendation] Using fallback routes:', err.message);
      }
    }

    loadMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  // All ports from the database available for selection as loading or discharge ports
  const loadingPorts = useMemo(() => {
    return portsList && portsList.length > 0 ? portsList : FALLBACK_PORTS;
  }, [portsList]);

  const dischargePorts = useMemo(() => {
    return portsList && portsList.length > 0 ? portsList : FALLBACK_PORTS;
  }, [portsList]);

  // Dynamic route presets including any active custom query
  const routePresets = useMemo(() => {
    if (!data) return ROUTE_PRESETS;
    const isStandardPreset = ROUTE_PRESETS.some(p => p.id === data.id);
    if (isStandardPreset) return ROUTE_PRESETS;

    const originShort = (data.originPort || 'Origin').split(' ')[0].split('(')[0].trim();
    const destShort = (data.destinationPort || 'Discharge').split(' ')[0].split('(')[0].trim();
    const customEntry = {
      id: data.id || `custom-${requestPayload.originPortId}-${requestPayload.destinationPortId}`,
      label: `${(data.cargoQuantityMT || requestPayload.cargoQuantityMT || 50000).toLocaleString()} MT ${data.cargoType || requestPayload.cargoType || 'Cargo'} (${originShort} → ${destShort}) [CUSTOM]`,
      cargoType: data.cargoType || requestPayload.cargoType,
      cargoQuantityMT: data.cargoQuantityMT || requestPayload.cargoQuantityMT,
      originPort: data.originPort || requestPayload.originPortId,
      originFlag: data.originFlag || '',
      destinationPort: data.destinationPort || requestPayload.destinationPortId,
      destinationFlag: data.destinationFlag || '',
      isCustom: true,
    };
    return [customEntry, ...ROUTE_PRESETS];
  }, [data, requestPayload]);

  const fetchRecommendation = useCallback(async (payload, routeId) => {
    // Guard: origin cannot equal destination
    if (payload.originPortId && payload.destinationPortId && payload.originPortId === payload.destinationPortId) {
      setValidationWarning('Origin and destination ports cannot be the same. Please select different ports.');
      setStatus('error');
      setErrorMessage('Origin and destination ports cannot be identical.');
      return;
    }

    setValidationWarning(null);
    setStatus('loading');
    setErrorMessage(null);

    try {
      const response = await getRecommendation(payload);
      const adapted = adaptBackendResponse(response, payload);
      const isCustomQuery = !Object.keys(PRESET_REQUEST_MAP).includes(routeId) || 
        payload.cargoQuantityMT !== PRESET_REQUEST_MAP[routeId]?.cargoQuantityMT ||
        payload.cargoType !== PRESET_REQUEST_MAP[routeId]?.cargoType;
      
      if (isCustomQuery) {
        adapted.isCustom = true;
      }
      setData(adapted);
      setStatus('success');
      setErrorMessage(null);
    } catch (err) {
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        setStatus('error');
        setErrorMessage(err.message || `Client Error ${err.status}`);
      } else {
        console.warn('[useRecommendation] Backend unavailable, falling back to mockData with custom adjustments:', err);
        const baseFallback = getRouteData(routeId);
        // Apply custom requested parcel and ports to fallback structure
        const customFallback = {
          ...baseFallback,
          id: `custom-${payload.originPortId}-${payload.destinationPortId}`,
          isCustom: true,
          cargoType: payload.cargoType || baseFallback.cargoType,
          cargoQuantityMT: payload.cargoQuantityMT || baseFallback.cargoQuantityMT,
          laycanStart: payload.laycanStart || baseFallback.laycanStart,
          laycanEnd: payload.laycanEnd || baseFallback.laycanEnd,
          desiredArrivalDate: payload.desiredArrivalDate || baseFallback.desiredArrivalDate,
        };
        setData(customFallback);
        setStatus('fallback');
        setErrorMessage(err.message || 'Connected to demo fixture preset');
      }
    }
  }, []);

  // Initial load only
  useEffect(() => {
    fetchRecommendation(PRESET_REQUEST_MAP[DEFAULT_ROUTE_ID], DEFAULT_ROUTE_ID);
  }, [fetchRecommendation]);

  // Explicit evaluation trigger (runs immediately on button click, cancelling debounce)
  const evaluateCustomVoyage = useCallback((customPayload = null) => {
    const payloadToUse = customPayload || requestPayload;
    if (customPayload) {
      setRequestPayload(customPayload);
    }
    const customRouteId = `custom-${payloadToUse.originPortId}-${payloadToUse.destinationPortId}`;
    setActiveRouteId(customRouteId);
    fetchRecommendation(payloadToUse, customRouteId);
  }, [fetchRecommendation, requestPayload]);

  // Select preset route
  const selectRoute = useCallback((routeId) => {
    setActiveRouteId(routeId);
    const newPayload = PRESET_REQUEST_MAP[routeId] || {
      ...PRESET_REQUEST_MAP[DEFAULT_ROUTE_ID],
      originPortId: routeId.split('-')[0] || 'hay-point',
    };
    setRequestPayload(newPayload);
    fetchRecommendation(newPayload, routeId);
  }, [fetchRecommendation]);

  // Update specific fields in the request
  const updateRequest = useCallback((fieldOrUpdates, maybeValue) => {
    if (typeof fieldOrUpdates === 'string') {
      setRequestPayload(prev => ({
        ...prev,
        [fieldOrUpdates]: maybeValue,
      }));
    } else if (typeof fieldOrUpdates === 'object') {
      setRequestPayload(prev => ({
        ...prev,
        ...fieldOrUpdates,
      }));
    }
  }, []);

  // Apply a quick scenario from routes.json
  const applyScenario = useCallback((scenario) => {
    const sId = scenario.id || `${scenario.originPortId}-${scenario.destinationPortId}`;
    setActiveRouteId(sId);
    const updated = {
      ...requestPayload,
      cargoType: scenario.defaultCargoType || scenario.cargoType || requestPayload.cargoType,
      cargoQuantityMT: scenario.defaultCargoMT || scenario.cargoQuantityMT || requestPayload.cargoQuantityMT,
      originPortId: scenario.originPortId || requestPayload.originPortId,
      destinationPortId: scenario.destinationPortId || requestPayload.destinationPortId,
    };
    setRequestPayload(updated);
    if (timerRef.current) clearTimeout(timerRef.current);
    fetchRecommendation(updated, sId);
  }, [fetchRecommendation, requestPayload]);

  const refetch = useCallback(() => {
    fetchRecommendation(requestPayload, activeRouteId);
  }, [fetchRecommendation, requestPayload, activeRouteId]);

  return {
    activeRoute: data,
    activeRouteId,
    requestPayload,
    status,
    errorMessage,
    validationWarning,
    isLoading: status === 'loading',
    isFallback: status === 'fallback',
    isLive: status === 'success',
    isError: status === 'error',
    portsList,
    loadingPorts,
    dischargePorts,
    routesList,
    routePresets,
    selectRoute,
    updateRequest,
    evaluateCustomVoyage,
    applyScenario,
    refetch,
  };
}

export default useRecommendation;
