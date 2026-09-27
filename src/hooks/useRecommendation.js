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

  // Filter ports by role (with graceful fallbacks)
  const loadingPorts = useMemo(() => {
    return portsList.filter(p => p.role === 'load' || p.role === 'both' || !p.role);
  }, [portsList]);

  const dischargePorts = useMemo(() => {
    return portsList.filter(p => p.role === 'discharge' || p.role === 'both' || !p.role);
  }, [portsList]);

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
      setData(adapted);
      setStatus('success');
      setErrorMessage(null);
    } catch (err) {
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        setStatus('error');
        setErrorMessage(err.message || `Client Error ${err.status}`);
      } else {
        console.warn('[useRecommendation] Backend unavailable, falling back to mockData:', err);
        const fallbackData = getRouteData(routeId);
        setData(fallbackData);
        setStatus('fallback');
        setErrorMessage(err.message || 'Connected to demo fixture preset');
      }
    }
  }, []);

  // Debounced fetch trigger (400ms)
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      fetchRecommendation(requestPayload, activeRouteId);
    }, 400);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [requestPayload, activeRouteId, fetchRecommendation]);

  // Select preset route
  const selectRoute = useCallback((routeId) => {
    setActiveRouteId(routeId);
    const newPayload = PRESET_REQUEST_MAP[routeId] || {
      ...PRESET_REQUEST_MAP[DEFAULT_ROUTE_ID],
      originPortId: routeId.split('-')[0] || 'hay-point',
    };
    setRequestPayload(newPayload);
  }, []);

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
    setRequestPayload(prev => ({
      ...prev,
      cargoType: scenario.defaultCargoType || scenario.cargoType || prev.cargoType,
      cargoQuantityMT: scenario.defaultCargoMT || scenario.cargoQuantityMT || prev.cargoQuantityMT,
      originPortId: scenario.originPortId || prev.originPortId,
      destinationPortId: scenario.destinationPortId || prev.destinationPortId,
    }));
  }, []);

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
    routePresets: ROUTE_PRESETS,
    selectRoute,
    updateRequest,
    applyScenario,
    refetch,
  };
}

export default useRecommendation;
