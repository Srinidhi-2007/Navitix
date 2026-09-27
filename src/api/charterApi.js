/**
 * Charter AI — Client API Service
 * File: src/api/charterApi.js
 *
 * Connects the React dashboard to the FastAPI decision backend.
 */

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    let details = null;
    try {
      const errData = await response.json();
      details = errData;
      if (errData.detail) {
        errorMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      } else if (errData.error) {
        errorMsg = errData.error;
      }
    } catch {
      // response was not JSON
    }
    throw new ApiError(response.status, errorMsg, details);
  }
  return response.json();
}

/**
 * Requests vessel recommendation for cargo and route parameters.
 * @param {Object} payload RecommendationRequest shape matching contract.json
 * @returns {Promise<Object>} RecommendationResponse matching contract.json
 */
export async function getRecommendation(payload) {
  const response = await fetch(`${API_BASE}/api/v1/charter/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

/**
 * Fetches the port database with bathymetric envelopes and berths.
 * @returns {Promise<Object>}
 */
export async function getPorts() {
  const response = await fetch(`${API_BASE}/api/v1/ports`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  return handleResponse(response);
}

/**
 * Fetches the supported routes database.
 * @returns {Promise<Object>}
 */
export async function getRoutes() {
  const response = await fetch(`${API_BASE}/api/v1/routes`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  return handleResponse(response);
}

/**
 * Fetches backend health status, data mode, and last rates date.
 * @returns {Promise<Object>}
 */
export async function getHealth() {
  const response = await fetch(`${API_BASE}/health`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  return handleResponse(response);
}

export default {
  getRecommendation,
  getPorts,
  getRoutes,
  getHealth,
  ApiError,
};
