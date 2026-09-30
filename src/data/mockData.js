/**
 * Charter AI — Unified Decision Support Mock Data Store
 * 
 * Architecture:
 * - Structured as one comprehensive recommendation object per route query.
 * - Every panel (Overview, Vessel & Route, Freight Forecast, Cost Analysis,
 *   Risk & Confidence, Compare Vessels) reads directly from this active object.
 * - Designed for seamless replacement with a real Python/FastAPI/ONNX ML endpoint.
 */

export const ROUTE_PRESETS = [
  {
    id: "aus-paradip-coking-coal",
    label: "50,000 MT Coking Coal · Hay Point → Paradip (Primary)",
    cargoType: "Coking Coal",
    cargoQuantityMT: 50000,
    originPort: "Hay Point (DBCT), Australia",
    originCountry: "Australia",
    originFlag: "AU",
    destinationPort: "Paradip Port, India",
    destinationCountry: "India",
    destinationFlag: "IN",
    laycanStart: "2026-09-12",
    laycanEnd: "2026-09-16",
    desiredArrivalDate: "2026-09-28",
    loadingWindow: "3.5 Days Laytime",
    dischargeWindow: "4.0 Days Laytime",
    voyageDistanceNM: 4620,
    voyageDaysEst: 14.5,
    bunkerFuelPricePerMT: 620, // VLSFO $/MT

    heroDecision: {
      recommendedVesselId: "panamax",
      recommendedVesselName: "Panamax",
      recommendedVesselIcon: "",
      charterTimingAction: "Charter within 3–5 days",
      timingWindowDates: "Sep 9 – Sep 11, 2026",
      timingRationale: "Freight rate trajectory hits projected trough of $27.90/MT before post-monsoon demand surge",
      expectedTotalCostCr: 14.21,
      expectedTotalCostUSD: 1709000,
      riskLevel: "Low",
      riskColor: "teal",
      forecastConfidencePct: 87,
      executiveSummary: "Panamax provides the lowest expected total cost while satisfying port draft constraints and maintaining 87% forecast confidence."
    },

    kpis: [
      { id: "freight", label: "EXPECTED FREIGHT", value: "$28.50", subtext: "per Metric Ton", trend: "-5.1%", trendFavorable: true },
      { id: "waiting", label: "EXPECTED WAITING", value: "3.2", unit: "days", subtext: "1.4d Load / 1.8d Disch", trend: "-0.6d", trendFavorable: true },
      { id: "totalCost", label: "TOTAL COST", value: "₹14.21", unit: "Cr", subtext: "$1.71M USD equiv", trend: "Lowest in class", trendFavorable: true },
      { id: "confidence", label: "FORECAST CONFIDENCE", value: "87%", subtext: "Ensemble high certainty", trend: "+5% vs 3d ago", trendFavorable: true },
      { id: "risk", label: "RISK LEVEL", value: "LOW", subtext: "All 4 factors compliant", status: "low" }
    ],

    whyThisVessel: {
      headline: "Optimal Cost-to-Constraint Equilibrium",
      bullets: [
        "Panamax offers ₹1.35 Cr ($162k) cost advantage over Supramax due to economy of scale on 50,000 MT parcel.",
        "Discharge draft at Paradip is 14.2m, comfortably clearing the 14.5m port maximum depth (Capesize exceeds by 3.7m).",
        "Estimated port waiting of 3.2 days is within acceptable tolerance and pre-budgeted into the ₹14.22 Cr total expenditure.",
        "Model prediction intervals show a tight ±$1.15/MT standard deviation with 87% statistical confidence."
      ]
    },

    alerts: [
      { id: 1, type: "opportunity", title: "Freight Window Alert", text: "Panamax rate is projected to bottom out at $27.90/MT in 4 days (Sep 9–11 window). Lock in fixture before post-monsoon rate rebound.", tag: "TIMING OPTIMAL" },
      { id: 2, type: "port", title: "Paradip Berth Congestion Easing", text: "Discharge anchorage delays reduced from 2.4 days to 1.8 days following berth 2 mechanized unloader maintenance.", tag: "PORT TELEMETRY" },
      { id: 3, type: "market", title: "Baltic Panamax Index (BPI) Movement", text: "BPI 4TC average down 1.8% today, opening favorable spot fixture negotiation window in Pacific basin.", tag: "MARKET BENCHMARK" }
    ],

    candidateVessels: [
      {
        id: "panamax",
        name: "Panamax",
        classCategory: "Dry Bulk · Gearless / Geared",
        capacityMT: 75000,
        cargoCarriedMT: 50000,
        voyageCount: 1,
        billableMT: 50000, // cargo > 60% capacity (45,000), so billable = cargo
        costBasis: "1 voyage × 50,000 MT @ $28.50/MT",
        draftMeters: 14.2,
        beamMeters: 32.2,
        loaMeters: 225,
        dwt: 76000,
        freightRatePerMT: 28.50,
        waitingDays: { loading: 1.4, discharge: 1.8, total: 3.2 },
        costBreakdownCr: {
          freight: 11.86,   // 28.50 × 50,000 = $1,425,000 × 83.2 / 1e7
          waitingDemurrage: 1.34,
          bunkerFuel: 0.72,
          portCanalMisc: 0.29,
          total: 14.21
        },
        riskLevel: "Low",
        confidencePct: 87,
        isFeasible: true,
        isRecommended: true,
        badgeText: "RECOMMENDED PICK",
        feasibilityReason: "Fully compliant with loading & discharge draft, berth length, and parcel size requirements."
      },
      {
        id: "supramax",
        name: "Supramax",
        classCategory: "Dry Bulk · Geared & Grab",
        capacityMT: 58000,
        cargoCarriedMT: 50000,
        voyageCount: 1,
        billableMT: 50000, // cargo > 60% capacity (34,800), so billable = cargo
        costBasis: "1 voyage × 50,000 MT @ $32.10/MT",
        draftMeters: 12.8,
        beamMeters: 32.2,
        loaMeters: 190,
        dwt: 58000,
        freightRatePerMT: 32.10,
        waitingDays: { loading: 1.2, discharge: 1.5, total: 2.7 },
        costBreakdownCr: {
          freight: 13.35,   // 32.10 × 50,000 = $1,605,000 × 83.2 / 1e7
          waitingDemurrage: 1.13,
          bunkerFuel: 0.81,
          portCanalMisc: 0.25,
          total: 15.54
        },
        riskLevel: "Low",
        confidencePct: 84,
        isFeasible: true,
        isRecommended: false,
        badgeText: "HIGHER FREIGHT $/MT",
        feasibilityReason: "Feasible and self-discharging, but higher $/MT rate leads to +₹1.33 Cr voyage premium."
      },
      {
        id: "handysize",
        name: "Handysize",
        classCategory: "Dry Bulk · Geared",
        capacityMT: 35000,
        cargoCarriedMT: 25000, // 50,000 MT split into 2 voyages of 25,000 MT each
        voyageCount: 2,
        billableMT: 25000, // per voyage: cargo/2 = 25,000 > 60% × 35,000 (21,000), so billable = 25,000
        costBasis: "2 voyages × 25,000 MT @ $37.80/MT (split parcel — capacity 35,000 MT per voyage)",
        draftMeters: 10.5,
        beamMeters: 28.4,
        loaMeters: 180,
        dwt: 38000,
        freightRatePerMT: 37.80,
        waitingDays: { loading: 0.9, discharge: 1.2, total: 2.1 },
        costBreakdownCr: {
          freight: 15.72,   // 37.80 × 25,000 × 2 = $1,890,000 × 83.2 / 1e7
          waitingDemurrage: 1.76,  // 2 voyages × 2.1 days × $5,000/day × 83.2 / 1e7
          bunkerFuel: 1.90,  // 2 voyages doubles fuel cost
          portCanalMisc: 0.42,  // 2 × $25,000
          total: 19.80
        },
        riskLevel: "Medium",
        confidencePct: 79,
        isFeasible: true,
        isRecommended: false,
        badgeText: "UNECONOMICAL (2× SPLIT PARCEL)",
        feasibilityReason: "Single vessel capacity (35,000 MT) is insufficient for 50,000 MT order — requires 2 voyages, doubling demurrage, bunker, and port costs."
      },
      {
        id: "capesize",
        name: "Capesize",
        classCategory: "Dry Bulk · Gearless Deep-Draft",
        capacityMT: 180000,
        cargoCarriedMT: 50000,
        voyageCount: 1,
        billableMT: 108000, // dead freight: max(50,000, 60% × 180,000) = 108,000 MT
        costBasis: "1 voyage × 108,000 MT billed @ $22.40/MT (dead freight penalty: only 50k MT loaded on 180k MT vessel, charterer pays for 60% min utilization)",
        draftMeters: 18.2,
        beamMeters: 45.0,
        loaMeters: 292,
        dwt: 181000,
        freightRatePerMT: 22.40,
        waitingDays: { loading: 2.1, discharge: 3.8, total: 5.9 },
        costBreakdownCr: {
          freight: 20.13,   // 22.40 × 108,000 (billable) = $2,419,200 × 83.2 / 1e7 — dead freight penalty
          waitingDemurrage: 2.45,
          bunkerFuel: 1.20,
          portCanalMisc: 0.42,
          total: 24.20
        },
        riskLevel: "High",
        confidencePct: 62,
        isFeasible: false,
        isRecommended: false,
        badgeText: "INFEASIBLE (DRAFT + DEAD FREIGHT)",
        feasibilityReason: "Capesize draft (18.2m) exceeds Paradip limit (14.5m). Additionally, dead freight penalty: only 50k MT on a 180k MT vessel means charterer pays for minimum 108,000 MT."
      }
    ],

    portConstraints: {
      loadingPort: {
        id: "hay-point",
        name: "Hay Point Coal Terminal (DBCT)",
        country: "Australia",
        flag: "AU",
        unlocode: "AU HPT",
        coordinates: "21°18'S, 149°18'E",
        maxDraftMeters: 19.5,
        maxLoaMeters: 300,
        maxBeamMeters: 50,
        berthLengthMeters: 350,
        handlingCapacityMTPD: 65000,
        tidalRestrictions: "Tidal range up to 6.8m; high-water departure for Capesize only",
        currentCongestionDays: 1.4,
        suitability: {
          handysize: { feasible: true, reason: "Berth depth and outreach fully compliant" },
          supramax: { feasible: true, reason: "Berth depth and outreach fully compliant" },
          panamax: { feasible: true, reason: "Berth depth and outreach fully compliant" },
          capesize: { feasible: true, reason: "Berth depth and loader outreach fully compliant" }
        }
      },
      dischargePort: {
        id: "paradip",
        name: "Paradip Port Trust (Berth 1 & 2)",
        country: "India",
        flag: "IN",
        unlocode: "IN PRT",
        coordinates: "20°15'N, 86°40'E",
        maxDraftMeters: 14.5,
        maxLoaMeters: 230,
        maxBeamMeters: 33,
        berthLengthMeters: 260,
        handlingCapacityMTPD: 35000,
        tidalRestrictions: "Constant 14.5m permissible depth; draft survey required on arrival",
        currentCongestionDays: 1.8,
        suitability: {
          handysize: { feasible: true, reason: "Draft 10.5m < 14.5m limit; LOA 180m < 230m limit" },
          supramax: { feasible: true, reason: "Draft 12.8m < 14.5m limit; LOA 190m < 230m limit" },
          panamax: { feasible: true, reason: "Draft 14.2m < 14.5m limit (0.3m clearance); LOA 225m < 230m limit" },
          capesize: { feasible: false, reason: "Draft 18.2m exceeds 14.5m channel limit by 3.7m. LOA 292m exceeds 230m limit." }
        }
      },
      draftComparisonChart: [
        { vessel: "Handysize", requiredDraft: 10.5, portLimit: 14.5, clearance: 4.0, status: "compliant" },
        { vessel: "Supramax", requiredDraft: 12.8, portLimit: 14.5, clearance: 1.7, status: "compliant" },
        { vessel: "Panamax", requiredDraft: 14.2, portLimit: 14.5, clearance: 0.3, status: "compliant" },
        { vessel: "Capesize", requiredDraft: 18.2, portLimit: 14.5, clearance: -3.7, status: "restricted" }
      ]
    },

    freightForecast: {
      currency: "$/MT",
      currentMarketRate: 29.40,
      forecastRateIn7Days: 27.90,
      forecastHorizonDays: 14,
      expectedChangePct: -5.1,
      expectedChangeDirection: "favorable", // saves money
      optimalWindowStartDay: 3,
      optimalWindowEndDay: 5,
      optimalWindowDateRange: "Sep 9 – Sep 11, 2026",
      benchmarkName: "Baltic Panamax Index (BPI)",
      timeSeries: [
        // 14 days historical
        { dayOffset: -14, date: "Aug 23", actualRate: 31.40, forecastRate: null, lowerBand: null, upperBand: null, benchmarkBPI: 31.80, isHistorical: true },
        { dayOffset: -12, date: "Aug 25", actualRate: 31.00, forecastRate: null, lowerBand: null, upperBand: null, benchmarkBPI: 31.50, isHistorical: true },
        { dayOffset: -10, date: "Aug 27", actualRate: 30.60, forecastRate: null, lowerBand: null, upperBand: null, benchmarkBPI: 30.90, isHistorical: true },
        { dayOffset: -8, date: "Aug 29", actualRate: 30.20, forecastRate: null, lowerBand: null, upperBand: null, benchmarkBPI: 30.40, isHistorical: true },
        { dayOffset: -6, date: "Aug 31", actualRate: 29.90, forecastRate: null, lowerBand: null, upperBand: null, benchmarkBPI: 30.10, isHistorical: true },
        { dayOffset: -4, date: "Sep 02", actualRate: 29.70, forecastRate: null, lowerBand: null, upperBand: null, benchmarkBPI: 29.80, isHistorical: true },
        { dayOffset: -2, date: "Sep 04", actualRate: 29.50, forecastRate: null, lowerBand: null, upperBand: null, benchmarkBPI: 29.60, isHistorical: true },
        { dayOffset: 0, date: "Today (Sep 06)", actualRate: 29.40, forecastRate: 29.40, lowerBand: 28.90, upperBand: 29.90, benchmarkBPI: 29.40, isHistorical: true, isCurrent: true },
        // 14 days forecast
        { dayOffset: 1, date: "Sep 07", actualRate: null, forecastRate: 29.00, lowerBand: 28.30, upperBand: 29.70, benchmarkBPI: 29.10, isHistorical: false },
        { dayOffset: 2, date: "Sep 08", actualRate: null, forecastRate: 28.50, lowerBand: 27.70, upperBand: 29.30, benchmarkBPI: 28.70, isHistorical: false },
        { dayOffset: 3, date: "Sep 09", actualRate: null, forecastRate: 28.10, lowerBand: 27.20, upperBand: 29.00, benchmarkBPI: 28.30, isHistorical: false, inOptimalWindow: true },
        { dayOffset: 4, date: "Sep 10", actualRate: null, forecastRate: 27.90, lowerBand: 26.90, upperBand: 28.90, benchmarkBPI: 28.00, isHistorical: false, inOptimalWindow: true, isTrough: true },
        { dayOffset: 5, date: "Sep 11", actualRate: null, forecastRate: 28.00, lowerBand: 27.00, upperBand: 29.00, benchmarkBPI: 28.10, isHistorical: false, inOptimalWindow: true },
        { dayOffset: 7, date: "Sep 13", actualRate: null, forecastRate: 28.40, lowerBand: 27.20, upperBand: 29.60, benchmarkBPI: 28.50, isHistorical: false },
        { dayOffset: 9, date: "Sep 15", actualRate: null, forecastRate: 28.90, lowerBand: 27.50, upperBand: 30.30, benchmarkBPI: 29.10, isHistorical: false },
        { dayOffset: 11, date: "Sep 17", actualRate: null, forecastRate: 29.60, lowerBand: 28.00, upperBand: 31.20, benchmarkBPI: 29.80, isHistorical: false },
        { dayOffset: 14, date: "Sep 20", actualRate: null, forecastRate: 30.20, lowerBand: 28.40, upperBand: 32.00, benchmarkBPI: 30.40, isHistorical: false }
      ]
    },

    costAnalysis: {
      unitCurrency: "₹ Cr",
      totalCostRecommended: 14.21,
      recommendedItemized: [
        { label: "Ocean Freight", amountCr: 11.86, pct: 83.5, color: "#F47B3A", note: "1 voyage × 50,000 MT @ $28.50/MT = $1.43M" },
        { label: "Port Waiting / Demurrage", amountCr: 1.34, pct: 9.4, color: "#D9A441", note: "1 voyage × 3.2 days @ $5,000/day" },
        { label: "Bunker Fuel (VLSFO)", amountCr: 0.72, pct: 5.1, color: "#4FA69A", note: "13.8 sea days × ~30 MT/day @ $620/MT" },
        { label: "Port Dues & Agency Misc", amountCr: 0.29, pct: 2.0, color: "#82949A", note: "Pilotage, tugs, line handling, customs" }
      ],
      comparisonMatrix: [
        { item: "Voyages Required", panamax: "1", supramax: "1", handysize: "2", isMetadata: true },
        { item: "Billable MT (incl. dead freight)", panamax: "50,000", supramax: "50,000", handysize: "2 × 25,000", isMetadata: true },
        { item: "Ocean Freight", panamax: 11.86, supramax: 13.35, handysize: 15.72 },
        { item: "Port Waiting / Demurrage", panamax: 1.34, supramax: 1.13, handysize: 1.76 },
        { item: "Bunker Fuel", panamax: 0.72, supramax: 0.81, handysize: 1.90 },
        { item: "Port Dues & Misc", panamax: 0.29, supramax: 0.25, handysize: 0.42 },
        { item: "Total Voyage Cost", panamax: 14.21, supramax: 15.54, handysize: 19.80, isTotal: true }
      ],
      waitingTimeBreakdown: [
        { vessel: "Panamax", loadingDays: 1.4, dischargeDays: 1.8, totalDays: 3.2, costCr: 1.34, voyages: 1, status: "Recommended" },
        { vessel: "Supramax", loadingDays: 1.2, dischargeDays: 1.5, totalDays: 2.7, costCr: 1.13, voyages: 1, status: "Higher Freight" },
        { vessel: "Handysize (2×)", loadingDays: 0.9, dischargeDays: 1.2, totalDays: 2.1, costCr: 1.76, voyages: 2, status: "2× Split Parcel" }
      ]
    },

    riskAndConfidence: {
      overallRisk: "LOW",
      overallRiskColor: "#4FA69A",
      confidenceScore: 87,
      confidenceStatusText: "High confidence — model uncertainty is within acceptable range.",
      warningText: null, // no alert when > 75%
      riskFactors: [
        { name: "Freight Rate Volatility", level: "Low", statusColor: "#4FA69A", score: "22% Ann. Spread", detail: "Baltic Panamax volatility subdued ahead of contract renewals" },
        { name: "Port Congestion Risk", level: "Medium", statusColor: "#D9A441", score: "1.8d Avg Queue", detail: "Paradip rainy season weather may induce minor berth queue variances" },
        { name: "Forecast Uncertainty", level: "Low", statusColor: "#4FA69A", score: "±$1.15/MT Margin", detail: "Prediction interval narrow across 14-day horizon" },
        { name: "Vessel Availability", level: "Low", statusColor: "#4FA69A", score: "7 Prompt Ships", detail: "Ample prompt Panamax tonnage open in East Coast Australia" }
      ],
      scenarios: [
        {
          id: "best",
          name: "Best Case Scenario",
          freightRate: "$26.80/MT",
          freightAssumption: "Early fixture locked at trough, minimal Pacific ballast competition",
          waitingDays: "2.0 Days",
          waitingAssumption: "Immediate berth availability upon NOR tender at Paradip",
          totalCostCr: "₹13.15 Cr",
          costDelta: "-₹1.07 Cr (-7.5%)",
          color: "#4FA69A",
          probability: "25% Probability"
        },
        {
          id: "expected",
          name: "Expected Case (Baseline)",
          freightRate: "$28.50/MT",
          freightAssumption: "Fixture completed within recommended 3–5 day window",
          waitingDays: "3.2 Days",
          waitingAssumption: "Standard line-up delay at Hay Point (1.4d) and Paradip (1.8d)",
          totalCostCr: "₹14.21 Cr",
          costDelta: "Baseline Reference",
          color: "#F47B3A",
          probability: "60% Probability",
          isBaseline: true
        },
        {
          id: "worst",
          name: "Worst Case Scenario",
          freightRate: "$31.20/MT",
          freightAssumption: "Delay in chartering leads to late fixture during spot market surge",
          waitingDays: "5.5 Days",
          waitingAssumption: "Tropical depression off Bay of Bengal causes swell delays at Paradip",
          totalCostCr: "₹15.89 Cr",
          costDelta: "+₹1.67 Cr (+11.7%)",
          color: "#D9573F",
          probability: "15% Probability"
        }
      ],
      modelTelemetry: {
        modelVersion: "v2.4-maritime-xgboost+prophet",
        inferenceLatencyMs: 142,
        dataFreshnessTimestamp: "2026-09-06 16:45 UTC",
        topFeatures: [
          { feature: "Historical Spot Fixtures (30d)", importance: 35 },
          { feature: "AIS Vessel Fleet Concentration", importance: 25 },
          { feature: "Port Turnaround & Congestion Telemetry", importance: 20 },
          { feature: "Bunker Fuel Spot Swaps (VLSFO)", importance: 10 },
          { feature: "Seasonal Monsoon Weather Ensembles", importance: 10 }
        ]
      }
    }
  },

  {
    id: "aus-qingdao-iron-ore",
    label: "70,000 MT Iron Ore · Port Hedland → Qingdao",
    cargoType: "Iron Ore Fines",
    cargoQuantityMT: 70000,
    originPort: "Port Hedland, Australia",
    originCountry: "Australia",
    originFlag: "AU",
    destinationPort: "Qingdao Port, China",
    destinationCountry: "China",
    destinationFlag: "CN",
    laycanStart: "2026-09-18",
    laycanEnd: "2026-09-22",
    desiredArrivalDate: "2026-10-02",
    loadingWindow: "2.5 Days Laytime",
    dischargeWindow: "3.0 Days Laytime",
    voyageDistanceNM: 3780,
    voyageDaysEst: 11.8,
    bunkerFuelPricePerMT: 615,

    heroDecision: {
      recommendedVesselId: "panamax",
      recommendedVesselName: "Panamax (Baby-Cape / Kamsarmax)",
      recommendedVesselIcon: "",
      charterTimingAction: "Charter immediately (0–2 days)",
      timingWindowDates: "Sep 07 – Sep 09, 2026",
      timingRationale: "China steel mill inventory restocking pushing spot rates up rapidly",
      expectedTotalCostCr: 12.85,
      expectedTotalCostUSD: 1545000,
      riskLevel: "Medium",
      riskColor: "amber",
      forecastConfidencePct: 82,
      executiveSummary: "Panamax/Kamsarmax fits the 70,000 MT lot perfectly with lowest freight unit economics and immediate drydock clearance."
    },

    kpis: [
      { id: "freight", label: "EXPECTED FREIGHT", value: "$22.10", subtext: "per Metric Ton", trend: "+3.2%", trendFavorable: false },
      { id: "waiting", label: "EXPECTED WAITING", value: "2.4", unit: "days", subtext: "0.9d Load / 1.5d Disch", trend: "-0.3d", trendFavorable: true },
      { id: "totalCost", label: "TOTAL COST", value: "₹12.85", unit: "Cr", subtext: "$1.55M USD equiv", trend: "Optimal sizing", trendFavorable: true },
      { id: "confidence", label: "FORECAST CONFIDENCE", value: "82%", subtext: "Pacific fixture verified", trend: "+2% vs 3d ago", trendFavorable: true },
      { id: "risk", label: "RISK LEVEL", value: "MEDIUM", subtext: "Typhoon season watch", status: "medium" }
    ],

    whyThisVessel: {
      headline: "Maximized Lot Capacity Compliance",
      bullets: [
        "Carrying 70,000 MT in a single Panamax voyage eliminates split-loading penalties of smaller vessels.",
        "Qingdao deep-water terminal handles up to 21m draft, so both Panamax and Capesize are structurally feasible, but lot size of 70,000 MT makes Capesize deadweight uneconomical.",
        "High prompt availability of Kamsarmax tonnage ballasting from South China."
      ]
    },

    alerts: [
      { id: 1, type: "market", title: "Typhoon Watch in East China Sea", text: "Typhoon track near Taiwan may cause 24h pilot boarding delays at Qingdao next week.", tag: "WEATHER" },
      { id: 2, type: "opportunity", title: "Charter Urgency", text: "Spot freight trend is rising +3.2% week-on-week. Prompt fixture recommended.", tag: "TIMING URGENT" }
    ],

    candidateVessels: [
      {
        id: "panamax",
        name: "Panamax / Kamsarmax",
        classCategory: "Dry Bulk",
        capacityMT: 82000,
        cargoCarriedMT: 70000,
        draftMeters: 14.5,
        beamMeters: 32.2,
        loaMeters: 229,
        dwt: 82000,
        freightRatePerMT: 22.10,
        waitingDays: { loading: 0.9, discharge: 1.5, total: 2.4 },
        costBreakdownCr: { freight: 10.74, waitingDemurrage: 1.05, bunkerFuel: 0.78, portCanalMisc: 0.28, total: 12.85 },
        riskLevel: "Medium",
        confidencePct: 82,
        isFeasible: true,
        isRecommended: true,
        badgeText: "RECOMMENDED PICK",
        feasibilityReason: "Optimal 70k MT fit; draft clear at both Port Hedland (19m) and Qingdao (21m)."
      },
      {
        id: "supramax",
        name: "Supramax",
        capacityMT: 58000,
        cargoCarriedMT: 58000,
        draftMeters: 12.8,
        freightRatePerMT: 26.50,
        waitingDays: { loading: 0.8, discharge: 1.2, total: 2.0 },
        costBreakdownCr: { freight: 12.88, waitingDemurrage: 0.85, bunkerFuel: 0.82, portCanalMisc: 0.25, total: 14.80 },
        riskLevel: "Low",
        confidencePct: 85,
        isFeasible: false,
        isRecommended: false,
        badgeText: "CAPACITY DEFICIT",
        feasibilityReason: "Supramax capacity (58,000 MT) cannot accommodate 70,000 MT lot."
      },
      {
        id: "handysize",
        name: "Handysize",
        capacityMT: 35000,
        cargoCarriedMT: 35000,
        draftMeters: 10.5,
        freightRatePerMT: 32.00,
        waitingDays: { loading: 0.7, discharge: 1.0, total: 1.7 },
        costBreakdownCr: { freight: 15.55, waitingDemurrage: 0.70, bunkerFuel: 0.90, portCanalMisc: 0.30, total: 17.45 },
        riskLevel: "Medium",
        confidencePct: 80,
        isFeasible: false,
        isRecommended: false,
        badgeText: "INFEASIBLE (SPLIT 2X)",
        feasibilityReason: "Requires 2 distinct voyages."
      },
      {
        id: "capesize",
        name: "Capesize",
        capacityMT: 180000,
        cargoCarriedMT: 70000,
        draftMeters: 18.2,
        freightRatePerMT: 20.00,
        waitingDays: { loading: 1.2, discharge: 2.0, total: 3.2 },
        costBreakdownCr: { freight: 11.20, waitingDemurrage: 1.80, bunkerFuel: 1.10, portCanalMisc: 0.40, total: 14.50 },
        riskLevel: "Medium",
        confidencePct: 75,
        isFeasible: true,
        isRecommended: false,
        badgeText: "DEADWEIGHT FREIGHT PENALTY",
        feasibilityReason: "Physically feasible at Qingdao but deadfreight on empty 110,000 MT holds makes total cost higher."
      }
    ],

    portConstraints: {
      loadingPort: {
        id: "port-hedland",
        name: "Port Hedland Inner Harbour",
        country: "Australia",
        flag: "AU",
        maxDraftMeters: 19.8,
        maxLoaMeters: 330,
        berthLengthMeters: 360,
        handlingCapacityMTPD: 120000,
        currentCongestionDays: 0.9,
        suitability: {
          handysize: { feasible: true, reason: "Compliant" },
          supramax: { feasible: true, reason: "Compliant" },
          panamax: { feasible: true, reason: "Compliant" },
          capesize: { feasible: true, reason: "Compliant" }
        }
      },
      dischargePort: {
        id: "qingdao",
        name: "Qingdao Qianwan Ore Terminal",
        country: "China",
        flag: "CN",
        maxDraftMeters: 21.5,
        maxLoaMeters: 350,
        berthLengthMeters: 400,
        handlingCapacityMTPD: 85000,
        currentCongestionDays: 1.5,
        suitability: {
          handysize: { feasible: true, reason: "Compliant" },
          supramax: { feasible: true, reason: "Compliant" },
          panamax: { feasible: true, reason: "Compliant" },
          capesize: { feasible: true, reason: "Compliant" }
        }
      },
      draftComparisonChart: [
        { vessel: "Handysize", requiredDraft: 10.5, portLimit: 21.5, clearance: 11.0, status: "compliant" },
        { vessel: "Supramax", requiredDraft: 12.8, portLimit: 21.5, clearance: 8.7, status: "compliant" },
        { vessel: "Panamax", requiredDraft: 14.5, portLimit: 21.5, clearance: 7.0, status: "compliant" },
        { vessel: "Capesize", requiredDraft: 18.2, portLimit: 21.5, clearance: 3.3, status: "compliant" }
      ]
    },

    freightForecast: {
      currency: "$/MT",
      currentMarketRate: 21.40,
      forecastRateIn7Days: 22.80,
      forecastHorizonDays: 14,
      expectedChangePct: +6.5,
      expectedChangeDirection: "unfavorable",
      optimalWindowStartDay: 0,
      optimalWindowEndDay: 2,
      optimalWindowDateRange: "Sep 07 – Sep 09, 2026",
      benchmarkName: "Baltic Capesize/Panamax Index",
      timeSeries: [
        { dayOffset: -14, date: "Aug 23", actualRate: 20.20, forecastRate: null, lowerBand: null, upperBand: null, isHistorical: true },
        { dayOffset: -10, date: "Aug 27", actualRate: 20.60, forecastRate: null, lowerBand: null, upperBand: null, isHistorical: true },
        { dayOffset: -5, date: "Sep 01", actualRate: 21.00, forecastRate: null, lowerBand: null, upperBand: null, isHistorical: true },
        { dayOffset: 0, date: "Today (Sep 06)", actualRate: 21.40, forecastRate: 21.40, lowerBand: 20.80, upperBand: 22.00, isHistorical: true, isCurrent: true },
        { dayOffset: 2, date: "Sep 08", actualRate: null, forecastRate: 21.80, lowerBand: 21.00, upperBand: 22.60, isHistorical: false, inOptimalWindow: true },
        { dayOffset: 4, date: "Sep 10", actualRate: null, forecastRate: 22.30, lowerBand: 21.30, upperBand: 23.30, isHistorical: false },
        { dayOffset: 7, date: "Sep 13", actualRate: null, forecastRate: 22.80, lowerBand: 21.60, upperBand: 24.00, isHistorical: false },
        { dayOffset: 14, date: "Sep 20", actualRate: null, forecastRate: 23.50, lowerBand: 22.00, upperBand: 25.00, isHistorical: false }
      ]
    },

    costAnalysis: {
      unitCurrency: "₹ Cr",
      totalCostRecommended: 12.85,
      recommendedItemized: [
        { label: "Ocean Freight", amountCr: 10.74, pct: 83.6, color: "#F47B3A", note: "70,000 MT @ $22.10/MT" },
        { label: "Port Waiting / Demurrage", amountCr: 1.05, pct: 8.2, color: "#D9A441", note: "2.4 days total" },
        { label: "Bunker Fuel", amountCr: 0.78, pct: 6.1, color: "#4FA69A", note: "3,780 NM round-trip allowance" },
        { label: "Port Dues & Misc", amountCr: 0.28, pct: 2.1, color: "#82949A", note: "Customs and berthage" }
      ],
      comparisonMatrix: [
        { item: "Ocean Freight", panamax: 10.74, supramax: 12.88, handysize: 15.55 },
        { item: "Port Waiting / Demurrage", panamax: 1.05, supramax: 0.85, handysize: 0.70 },
        { item: "Bunker Fuel", panamax: 0.78, supramax: 0.82, handysize: 0.90 },
        { item: "Port Dues & Misc", panamax: 0.28, supramax: 0.25, handysize: 0.30 },
        { item: "Total Voyage Cost", panamax: 12.85, supramax: 14.80, handysize: 17.45, isTotal: true }
      ],
      waitingTimeBreakdown: [
        { vessel: "Panamax", loadingDays: 0.9, dischargeDays: 1.5, totalDays: 2.4, costCr: 1.05, status: "Recommended" },
        { vessel: "Supramax", loadingDays: 0.8, dischargeDays: 1.2, totalDays: 2.0, costCr: 0.85, status: "Capacity Deficit" },
        { vessel: "Handysize", loadingDays: 0.7, dischargeDays: 1.0, totalDays: 1.7, costCr: 0.70, status: "Infeasible" }
      ]
    },

    riskAndConfidence: {
      overallRisk: "MEDIUM",
      overallRiskColor: "#D9A441",
      confidenceScore: 82,
      confidenceStatusText: "Moderate-high confidence — rate upsurge detected in Chinese import flow.",
      warningText: null,
      riskFactors: [
        { name: "Freight Volatility", level: "Medium", statusColor: "#D9A441", score: "31% Ann. Spread", detail: "Rising iron ore import fixtures" },
        { name: "Port Congestion Risk", level: "Low", statusColor: "#4FA69A", score: "1.5d Avg Queue", detail: "Qianwan automated berths running normal" },
        { name: "Forecast Uncertainty", level: "Low", statusColor: "#4FA69A", score: "±$1.30/MT Margin", detail: "Consistent route volume" },
        { name: "Vessel Availability", level: "Low", statusColor: "#4FA69A", score: "12 Prompt Ships", detail: "High Pacific tonnage" }
      ],
      scenarios: [
        { id: "best", name: "Best Case", freightRate: "$21.00/MT", waitingDays: "1.8 Days", totalCostCr: "₹12.10 Cr", costDelta: "-₹0.75 Cr (-5.8%)", color: "#4FA69A" },
        { id: "expected", name: "Expected Case", freightRate: "$22.10/MT", waitingDays: "2.4 Days", totalCostCr: "₹12.85 Cr", costDelta: "Baseline Reference", color: "#F47B3A", isBaseline: true },
        { id: "worst", name: "Worst Case", freightRate: "$24.50/MT", waitingDays: "4.0 Days", totalCostCr: "₹14.15 Cr", costDelta: "+₹1.30 Cr (+10.1%)", color: "#D9573F" }
      ],
      modelTelemetry: {
        modelVersion: "v2.4-maritime-xgboost+prophet",
        inferenceLatencyMs: 138,
        dataFreshnessTimestamp: "2026-09-06 16:45 UTC",
        topFeatures: [
          { feature: "Chinese Port Inventory Drawdowns", importance: 38 },
          { feature: "Pilbara Port Clearance Rates", importance: 27 },
          { feature: "Pacific FFA Futures Curve", importance: 20 },
          { feature: "Bunker Fuel Spot Swaps", importance: 15 }
        ]
      }
    }
  },

  {
    id: "santos-alexandria-soybeans",
    label: "38,000 MT Soybeans · Santos → Alexandria",
    cargoType: "Soybeans in Bulk",
    cargoQuantityMT: 38000,
    originPort: "Port of Santos, Brazil",
    originCountry: "Brazil",
    originFlag: "BR",
    destinationPort: "Port of Alexandria, Egypt",
    destinationCountry: "Egypt",
    destinationFlag: "EG",
    laycanStart: "2026-09-25",
    laycanEnd: "2026-09-30",
    desiredArrivalDate: "2026-10-18",
    loadingWindow: "4.0 Days Laytime",
    dischargeWindow: "3.5 Days Laytime",
    voyageDistanceNM: 5420,
    voyageDaysEst: 17.2,
    bunkerFuelPricePerMT: 635,

    heroDecision: {
      recommendedVesselId: "supramax",
      recommendedVesselName: "Supramax (Ultramax)",
      recommendedVesselIcon: "",
      charterTimingAction: "Charter within 5–7 days",
      timingWindowDates: "Sep 11 – Sep 13, 2026",
      timingRationale: "Atlantic ballast fleet arrival expected to push grain freight down -4.2%",
      expectedTotalCostCr: 16.45,
      expectedTotalCostUSD: 1980000,
      riskLevel: "Medium",
      riskColor: "amber",
      forecastConfidencePct: 76,
      executiveSummary: "Supramax provides self-discharging grab capability ideal for Alexandria grain siloing, with optimal 38,000 MT deadweight utilization."
    },

    kpis: [
      { id: "freight", label: "EXPECTED FREIGHT", value: "$36.80", subtext: "per Metric Ton", trend: "-4.2%", trendFavorable: true },
      { id: "waiting", label: "EXPECTED WAITING", value: "4.1", unit: "days", subtext: "2.3d Santos / 1.8d Alex", trend: "+0.4d", trendFavorable: false },
      { id: "totalCost", label: "TOTAL COST", value: "₹16.45", unit: "Cr", subtext: "$1.98M USD equiv", trend: "Lowest total", trendFavorable: true },
      { id: "confidence", label: "FORECAST CONFIDENCE", value: "76%", subtext: "Atlantic basin variance", trend: "Within bound", trendFavorable: true },
      { id: "risk", label: "RISK LEVEL", value: "MEDIUM", subtext: "Santos grain queue", status: "medium" }
    ],

    whyThisVessel: {
      headline: "Geared & Grab Capability for Alexandria Silos",
      bullets: [
        "Alexandria outer grain silos prioritize self-discharging 4x30T geared vessels, which Supramax possesses natively.",
        "Santos waiting time is 2.3 days due to seasonal soya line-ups, factored into total demurrage.",
        "Panamax would incur higher port turnaround dues and deadfreight on a 38,000 MT lot."
      ]
    },

    alerts: [
      { id: 1, type: "port", title: "Santos Anchorage Congestion", text: "Grain terminal anchorage currently queueing 14 vessels. 2.3 days pre-berthing wait factored.", tag: "CONGESTION" },
      { id: 2, type: "opportunity", title: "Charter Timing Window", text: "Wait 5-7 days for incoming ballast tonnage from West Africa to negotiate -4.2% lower charter rate.", tag: "STRATEGY" }
    ],

    candidateVessels: [
      {
        id: "supramax",
        name: "Supramax / Ultramax",
        capacityMT: 58000,
        cargoCarriedMT: 38000,
        draftMeters: 12.8,
        freightRatePerMT: 36.80,
        waitingDays: { loading: 2.3, discharge: 1.8, total: 4.1 },
        costBreakdownCr: { freight: 13.50, waitingDemurrage: 1.62, bunkerFuel: 0.98, portCanalMisc: 0.35, total: 16.45 },
        riskLevel: "Medium",
        confidencePct: 76,
        isFeasible: true,
        isRecommended: true,
        badgeText: "RECOMMENDED PICK",
        feasibilityReason: "Geared ship suited for discharge; compliant with Alexandria 13.5m draft."
      },
      {
        id: "panamax",
        name: "Panamax",
        capacityMT: 75000,
        cargoCarriedMT: 38000,
        draftMeters: 14.2,
        freightRatePerMT: 35.00,
        waitingDays: { loading: 2.8, discharge: 2.4, total: 5.2 },
        costBreakdownCr: { freight: 14.80, waitingDemurrage: 2.10, bunkerFuel: 1.15, portCanalMisc: 0.45, total: 18.50 },
        riskLevel: "Medium",
        confidencePct: 78,
        isFeasible: false,
        isRecommended: false,
        badgeText: "INFEASIBLE AT ALEXANDRIA",
        feasibilityReason: "Panamax draft (14.2m) exceeds Alexandria maximum grain berth draft (13.5m)."
      },
      {
        id: "handysize",
        name: "Handysize",
        capacityMT: 35000,
        cargoCarriedMT: 35000,
        draftMeters: 10.5,
        freightRatePerMT: 42.50,
        waitingDays: { loading: 1.8, discharge: 1.4, total: 3.2 },
        costBreakdownCr: { freight: 15.60, waitingDemurrage: 1.25, bunkerFuel: 0.92, portCanalMisc: 0.30, total: 18.07 },
        riskLevel: "Low",
        confidencePct: 81,
        isFeasible: true,
        isRecommended: false,
        badgeText: "PARCEL EXCEEDS CAPACITY",
        feasibilityReason: "38,000 MT parcel slightly exceeds single Handysize 35,000 MT load limit."
      },
      {
        id: "capesize",
        name: "Capesize",
        capacityMT: 180000,
        cargoCarriedMT: 38000,
        draftMeters: 18.2,
        freightRatePerMT: 28.00,
        waitingDays: { loading: 3.5, discharge: 4.5, total: 8.0 },
        costBreakdownCr: { freight: 14.00, waitingDemurrage: 3.20, bunkerFuel: 1.60, portCanalMisc: 0.60, total: 19.40 },
        riskLevel: "High",
        confidencePct: 60,
        isFeasible: false,
        isRecommended: false,
        badgeText: "INFEASIBLE (DRAFT & SIZE)",
        feasibilityReason: "Capesize cannot berth at Alexandria; draft and LOA severely exceed limits."
      }
    ],

    portConstraints: {
      loadingPort: {
        id: "santos",
        name: "Port of Santos (Outer Basin)",
        country: "Brazil",
        flag: "BR",
        maxDraftMeters: 14.5,
        maxLoaMeters: 280,
        berthLengthMeters: 310,
        handlingCapacityMTPD: 40000,
        currentCongestionDays: 2.3,
        suitability: {
          handysize: { feasible: true, reason: "Compliant" },
          supramax: { feasible: true, reason: "Compliant" },
          panamax: { feasible: true, reason: "Compliant" },
          capesize: { feasible: false, reason: "Draft restricted" }
        }
      },
      dischargePort: {
        id: "alexandria",
        name: "Port of Alexandria Grain Terminal",
        country: "Egypt",
        flag: "EG",
        maxDraftMeters: 13.5,
        maxLoaMeters: 220,
        berthLengthMeters: 240,
        handlingCapacityMTPD: 25000,
        currentCongestionDays: 1.8,
        suitability: {
          handysize: { feasible: true, reason: "Compliant" },
          supramax: { feasible: true, reason: "Compliant" },
          panamax: { feasible: false, reason: "Draft 14.2m exceeds 13.5m limit" },
          capesize: { feasible: false, reason: "Draft 18.2m exceeds 13.5m limit" }
        }
      },
      draftComparisonChart: [
        { vessel: "Handysize", requiredDraft: 10.5, portLimit: 13.5, clearance: 3.0, status: "compliant" },
        { vessel: "Supramax", requiredDraft: 12.8, portLimit: 13.5, clearance: 0.7, status: "compliant" },
        { vessel: "Panamax", requiredDraft: 14.2, portLimit: 13.5, clearance: -0.7, status: "restricted" },
        { vessel: "Capesize", requiredDraft: 18.2, portLimit: 13.5, clearance: -4.7, status: "restricted" }
      ]
    },

    freightForecast: {
      currency: "$/MT",
      currentMarketRate: 38.40,
      forecastRateIn7Days: 36.80,
      forecastHorizonDays: 14,
      expectedChangePct: -4.2,
      expectedChangeDirection: "favorable",
      optimalWindowStartDay: 5,
      optimalWindowEndDay: 7,
      optimalWindowDateRange: "Sep 11 – Sep 13, 2026",
      benchmarkName: "Baltic Supramax Index (BSI)",
      timeSeries: [
        { dayOffset: -14, date: "Aug 23", actualRate: 40.10, forecastRate: null, lowerBand: null, upperBand: null, isHistorical: true },
        { dayOffset: -7, date: "Aug 30", actualRate: 39.20, forecastRate: null, lowerBand: null, upperBand: null, isHistorical: true },
        { dayOffset: 0, date: "Today (Sep 06)", actualRate: 38.40, forecastRate: 38.40, lowerBand: 37.50, upperBand: 39.30, isHistorical: true, isCurrent: true },
        { dayOffset: 3, date: "Sep 09", actualRate: null, forecastRate: 37.60, lowerBand: 36.40, upperBand: 38.80, isHistorical: false },
        { dayOffset: 6, date: "Sep 12", actualRate: null, forecastRate: 36.80, lowerBand: 35.20, upperBand: 38.40, isHistorical: false, inOptimalWindow: true, isTrough: true },
        { dayOffset: 10, date: "Sep 16", actualRate: null, forecastRate: 37.20, lowerBand: 35.40, upperBand: 39.00, isHistorical: false },
        { dayOffset: 14, date: "Sep 20", actualRate: null, forecastRate: 37.90, lowerBand: 35.80, upperBand: 40.00, isHistorical: false }
      ]
    },

    costAnalysis: {
      unitCurrency: "₹ Cr",
      totalCostRecommended: 16.45,
      recommendedItemized: [
        { label: "Ocean Freight", amountCr: 13.50, pct: 82.1, color: "#F47B3A", note: "38,000 MT @ $36.80/MT" },
        { label: "Port Waiting / Demurrage", amountCr: 1.62, pct: 9.8, color: "#D9A441", note: "4.1 days total" },
        { label: "Bunker Fuel", amountCr: 0.98, pct: 6.0, color: "#4FA69A", note: "Atlantic transit" },
        { label: "Port Dues & Misc", amountCr: 0.35, pct: 2.1, color: "#82949A", note: "Pilotage and silos" }
      ],
      comparisonMatrix: [
        { item: "Ocean Freight", panamax: 14.80, supramax: 13.50, handysize: 15.60 },
        { item: "Port Waiting / Demurrage", panamax: 2.10, supramax: 1.62, handysize: 1.25 },
        { item: "Bunker Fuel", panamax: 1.15, supramax: 0.98, handysize: 0.92 },
        { item: "Port Dues & Misc", panamax: 0.45, supramax: 0.35, handysize: 0.30 },
        { item: "Total Voyage Cost", panamax: 18.50, supramax: 16.45, handysize: 18.07, isTotal: true }
      ],
      waitingTimeBreakdown: [
        { vessel: "Supramax", loadingDays: 2.3, dischargeDays: 1.8, totalDays: 4.1, costCr: 1.62, status: "Recommended" },
        { vessel: "Panamax", loadingDays: 2.8, dischargeDays: 2.4, totalDays: 5.2, costCr: 2.10, status: "Draft Infeasible" },
        { vessel: "Handysize", loadingDays: 1.8, dischargeDays: 1.4, totalDays: 3.2, costCr: 1.25, status: "Capacity Limit" }
      ]
    },

    riskAndConfidence: {
      overallRisk: "MEDIUM",
      overallRiskColor: "#D9A441",
      confidenceScore: 76,
      confidenceStatusText: "Moderate confidence — wider forecast spread due to South American soya line-up volatility.",
      warningText: "Forecast uncertainty is elevated (76%) due to Santos berth congestion variance — monitor daily line-ups before fixture.",
      riskFactors: [
        { name: "Freight Volatility", level: "Medium", statusColor: "#D9A441", score: "28% Ann. Spread", detail: "South American soya season peaks" },
        { name: "Port Congestion Risk", level: "High", statusColor: "#D9573F", score: "2.3d Santos Queue", detail: "Seasonal line-up variance" },
        { name: "Forecast Uncertainty", level: "Medium", statusColor: "#D9A441", score: "±$1.60/MT Margin", detail: "Wider prediction bands" },
        { name: "Vessel Availability", level: "Low", statusColor: "#4FA69A", score: "8 Prompt Ships", detail: "Adequate Ultramax availability" }
      ],
      scenarios: [
        { id: "best", name: "Best Case", freightRate: "$35.20/MT", waitingDays: "3.0 Days", totalCostCr: "₹15.20 Cr", costDelta: "-₹1.25 Cr (-7.6%)", color: "#4FA69A" },
        { id: "expected", name: "Expected Case", freightRate: "$36.80/MT", waitingDays: "4.1 Days", totalCostCr: "₹16.45 Cr", costDelta: "Baseline Reference", color: "#F47B3A", isBaseline: true },
        { id: "worst", name: "Worst Case", freightRate: "$39.50/MT", waitingDays: "6.5 Days", totalCostCr: "₹18.40 Cr", costDelta: "+₹1.95 Cr (+11.8%)", color: "#D9573F" }
      ],
      modelTelemetry: {
        modelVersion: "v2.4-maritime-xgboost+prophet",
        inferenceLatencyMs: 156,
        dataFreshnessTimestamp: "2026-09-06 16:45 UTC",
        topFeatures: [
          { feature: "Santos Soya Line-up Days", importance: 42 },
          { feature: "Atlantic Grain Cargo Fixtures", importance: 26 },
          { feature: "Bunker Fuel Spot Swaps (VLSFO)", importance: 18 },
          { feature: "Panama Canal Transit Waiting Indices", importance: 14 }
        ]
      }
    }
  }
];

export const DEFAULT_ROUTE_ID = "aus-paradip-coking-coal";

export const VESSEL_CLASSES = [
  { id: "handysize", name: "Handysize", dwt: 38000, capacityMT: 35000, designDraftM: 10.5, loaM: 180, beamM: 28.4 },
  { id: "supramax", name: "Supramax", dwt: 58000, capacityMT: 58000, designDraftM: 12.8, loaM: 190, beamM: 32.2 },
  { id: "ultramax", name: "Ultramax", dwt: 63500, capacityMT: 63500, designDraftM: 13.4, loaM: 200, beamM: 32.2 },
  { id: "panamax", name: "Panamax", dwt: 76000, capacityMT: 75000, designDraftM: 14.2, loaM: 225, beamM: 32.2 },
  { id: "kamsarmax", name: "Kamsarmax", dwt: 82500, capacityMT: 82500, designDraftM: 14.4, loaM: 229, beamM: 32.3 },
  { id: "capesize", name: "Capesize", dwt: 181000, capacityMT: 180000, designDraftM: 18.2, loaM: 292, beamM: 45.0 },
  { id: "newcastlemax", name: "Newcastlemax", dwt: 210000, capacityMT: 205000, designDraftM: 18.5, loaM: 300, beamM: 50.0 },
  { id: "valemax", name: "Valemax / VLOC", dwt: 400000, capacityMT: 390000, designDraftM: 23.0, loaM: 362, beamM: 65.0 },
];

export const SUPPORTED_PORTS = [
  { id: "hay-point", name: "Hay Point Coal Terminal (DBCT)", country: "Australia", role: "load", maxDraftM: 19.5, maxLoaM: 300 },
  { id: "port-hedland", name: "Port Hedland", country: "Australia", role: "load", maxDraftM: 19.8, maxLoaM: 330 },
  { id: "santos", name: "Port of Santos (Outer Basin)", country: "Brazil", role: "load", maxDraftM: 14.5, maxLoaM: 280 },
  { id: "paradip", name: "Paradip Port", country: "India", role: "discharge", maxDraftM: 14.5, maxLoaM: 300 },
  { id: "qingdao", name: "Qingdao Qianwan Ore Terminal", country: "China", role: "discharge", maxDraftM: 21.5, maxLoaM: 350 },
  { id: "alexandria", name: "Port of Alexandria Grain Terminal", country: "Egypt", role: "discharge", maxDraftM: 13.5, maxLoaM: 220 },
];

export function getRouteData(routeId) {
  const found = ROUTE_PRESETS.find(r => r.id === routeId);
  return found || ROUTE_PRESETS[0];
}
