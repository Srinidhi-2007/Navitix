/**
 * Charter AI — Backend Response Adapter
 * File: src/api/adapter.js
 *
 * Enriches backend recommendation payloads with UI presentation metadata
 * (country flags, vessel icons, unlocodes, laytime defaults) ensuring 100%
 * compatibility with all existing dashboard pages.
 */

export const PORT_METADATA = {
  "hay-point": { country: "Australia", flag: "AU", unlocode: "AU HPT", coordinates: "21°18'S, 149°18'E" },
  "paradip": { country: "India", flag: "IN", unlocode: "IN PRT", coordinates: "20°15'N, 86°40'E" },
  "port-hedland": { country: "Australia", flag: "AU", unlocode: "AU PHE", coordinates: "20°18'S, 118°34'E" },
  "qingdao": { country: "China", flag: "CN", unlocode: "CN TAO", coordinates: "36°04'N, 120°19'E" },
  "santos": { country: "Brazil", flag: "BR", unlocode: "BR SSZ", coordinates: "23°57'S, 46°18'W" },
  "alexandria": { country: "Egypt", flag: "EG", unlocode: "EG ALY", coordinates: "31°11'N, 29°52'E" },
};

export const VESSEL_ICONS = {
  "handysize": "",
  "supramax": "",
  "panamax": "",
  "capesize": "",
};

export function adaptBackendResponse(backendData, requestPayload = {}) {
  if (!backendData) return null;

  const originId = requestPayload.originPortId || backendData.portConstraints?.loadingPort?.id || "hay-point";
  const destId = requestPayload.destinationPortId || backendData.portConstraints?.dischargePort?.id || "paradip";

  const originMeta = PORT_METADATA[originId] || { country: "International", flag: "INTL" };
  const destMeta = PORT_METADATA[destId] || { country: "International", flag: "INTL" };

  const recVesselId = backendData.heroDecision?.recommendedVesselId || "panamax";
  const vesselIcon = VESSEL_ICONS[recVesselId] || "";

  return {
    ...backendData,
    originCountry: backendData.originCountry || originMeta.country,
    originFlag: backendData.originFlag || originMeta.flag,
    destinationCountry: backendData.destinationCountry || destMeta.country,
    destinationFlag: backendData.destinationFlag || destMeta.flag,
    laycanStart: requestPayload.laycanStart || backendData.laycanStart || "2026-09-12",
    laycanEnd: requestPayload.laycanEnd || backendData.laycanEnd || "2026-09-16",
    desiredArrivalDate: requestPayload.desiredArrivalDate || backendData.desiredArrivalDate || "2026-09-28",
    loadingWindow: backendData.loadingWindow || "3.5 Days Laytime",
    dischargeWindow: backendData.dischargeWindow || "4.0 Days Laytime",
    heroDecision: {
      ...backendData.heroDecision,
      recommendedVesselIcon: backendData.heroDecision?.recommendedVesselIcon || vesselIcon,
    },
  };
}

export default adaptBackendResponse;
