import { CalculatorData } from '@/lib/types';

interface ThermalKaVL {
  spray: number;
  fill: number;
  fillTotal: number;
  rain: number;
  total: number;
  derate: number;
  hwtCorrection: number;
  adjusted: number;
  lgRatio: number;
}

interface ThermalMisc {
  waterLoading: number;
  pressureRatio: number;
  lgKaVL: number;
  fanBoxRatio: number;
  fanCoverage: number;
  airflowAtFan: number;
  effectiveFanEff: number;
  dryAirRate: number;
  totalFillHeight: number;
  fillArea: number;
  evaporationRatePct: number;
  evaporationRateM3Hr: number;
  inletDBT: number;
  exitWBT: number;
}

export interface PressureDropRow {
  name: string;
  netArea?: number;
  velocity?: number;
  density?: number;
  specificVolume?: number;
  pressureDrop?: number;
}

export interface CoolingTowerPerformanceResults {
  thermalResults: {
    power: number;
    fillVelocity: number;
    KaVL: ThermalKaVL;
    misc: ThermalMisc;
  };
  airflow: {
    airflow_m3s: number;
    dryAirRate: number;
  };
  pressureDrop: {
    rows: PressureDropRow[];
    totalStatic: number;
    netFanVP: number;
    fanTotalPressure: number;
  };
  performance: {
    waterLoading: number;
    pressureRatio: number;
    LG_KaVL: number;
    fanEfficiency: number;
  };
}

const ATM_KPA = 101.325;

function toNumber(value: string, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function saturationPressureKPa(tempC: number): number {
  return 0.61078 * Math.exp((17.2694 * tempC) / (tempC + 237.29));
}

function pressureFromAltitude(altitudeM: number): number {
  return ATM_KPA * (1 - 2.25577e-5 * altitudeM) ** 5.2559;
}

function humidityRatio(pressureKPa: number, wetBulbC: number, dryBulbC: number, rhPct: number): number {
  if (rhPct > 0) {
    const pw = saturationPressureKPa(dryBulbC) * clamp(rhPct / 100, 0.02, 1);
    return 0.62198 * pw / Math.max(pressureKPa - pw, 0.1);
  }

  const pwsWb = saturationPressureKPa(wetBulbC);
  const ws = 0.62198 * pwsWb / Math.max(pressureKPa - pwsWb, 0.1);
  const numerator = (2501 - 2.326 * wetBulbC) * ws - 1.005 * (dryBulbC - wetBulbC);
  const denominator = 2501 + 1.86 * dryBulbC - 4.186 * wetBulbC;

  return clamp(numerator / Math.max(denominator, 0.01), 0.001, 0.05);
}

function moistAirDensity(pressureKPa: number, dryBulbC: number, w: number): number {
  const tK = dryBulbC + 273.15;
  const pPa = pressureKPa * 1000;

  return pPa / (287.05 * tK * (1 + 1.6078 * w));
}

function solveLGRatio(targetKaVL: number): number {
  // Simplified Merkel-demand fit with Newton iteration.
  const a = 0.32;
  const b = 0.92;
  let x = 1.25;

  for (let i = 0; i < 30; i += 1) {
    const f = a * x * x + b * x - targetKaVL;
    const df = 2 * a * x + b;
    x = clamp(x - f / Math.max(df, 1e-6), 0.15, 3.5);

    if (Math.abs(f) < 1e-6) break;
  }

  return x;
}

function sectionPressureDrop(k: number, density: number, velocity: number): number {
  return k * (density * velocity * velocity / 2);
}

export function calculateCoolingTowerPerformance(data: CalculatorData): CoolingTowerPerformanceResults {
  const cells = Math.max(toNumber(data.towerGeometry.noOfCells, 1), 1);

  const coldWater = toNumber(data.thermalConditions.coldWater, 33);
  const range = Math.max(toNumber(data.thermalConditions.range, 5), 0.1);
  const hotWater = toNumber(data.thermalConditions.hotWater) || coldWater + range;
  const wetBulb = toNumber(data.thermalConditions.wetBulb, 27);
  const rh = toNumber(data.thermalConditions.relativeHumidity, 0);
  const inletDBT = wetBulb + 3.2;
  const exitWBT = wetBulb + Math.max(range * 0.18, 0.8);

  const pressureKPa = data.thermalConditions.pressureInputMode === 'barometricPressure'
    ? Math.max(toNumber(data.thermalConditions.barometricPressure, ATM_KPA), 70)
    : Math.max(pressureFromAltitude(toNumber(data.thermalConditions.altitude, 0)), 70);

  const width = Math.max(toNumber(data.towerGeometry.cellWidth, 7.9), 0.1);
  const length = Math.max(toNumber(data.towerGeometry.cellLength, 15.87), 0.1);
  const fillArea = width * length / Math.max(cells, 1);

  const sprayHeight = Math.max(toNumber(data.fillSection.sprayHeight, 0.4), 0.1);
  const fillHeight = Math.max(toNumber(data.fillSection.fillHeight, 1.22), 0.1);
  const rainHeight = Math.max(toNumber(data.fillSection.rainHeight, 0.4), 0.1);

  const sprayKaVL = sprayHeight * 0.39;
  const fillKaVL = fillHeight * 1.12;
  const rainKaVL = rainHeight * 0.31;
  const totalKaVL = sprayKaVL + fillKaVL + rainKaVL;

  const derate = clamp(toNumber(data.fillSection.kaVLDerate, 1), 0.7, 1.15);
  const hwtCorrection = clamp(1 + (hotWater - 38) * 0.013, 0.85, 1.25);
  const adjustedKaVL = totalKaVL * derate * (1 - (hwtCorrection - 1) * 0.12);

  const lgRatio = solveLGRatio(adjustedKaVL);

  const totalWaterFlowM3Hr = Math.max(toNumber(data.thermalConditions.totalWaterFlow, 1000), 0.1);
  const waterFlowPerCellM3Hr = totalWaterFlowM3Hr / cells;
  const waterMassFlow = waterFlowPerCellM3Hr / 3600 * 997;

  const w = humidityRatio(pressureKPa, wetBulb, inletDBT, rh);
  const densityInlet = moistAirDensity(pressureKPa, inletDBT, w);
  const airMassFlow = waterMassFlow / lgRatio;
  const airflowM3s = airMassFlow / Math.max(densityInlet, 0.5);

  const fanDiameter = Math.max(toNumber(data.plenumFan.fanDiameter, 4.88), 0.5);
  const fanAreaGross = Math.PI * (fanDiameter ** 2) / 4;
  const hubDiameter = Math.max(toNumber(data.plenumFan.sealDiskHubDiameter, 0.8), 0.1);
  const hubArea = Math.PI * (hubDiameter ** 2) / 4;
  const fanNetArea = Math.max(fanAreaGross - hubArea, 0.1);

  const fillVelocity = airflowM3s / Math.max(fillArea, 0.1);
  const fanVelocity = airflowM3s / fanNetArea;

  const sectionDefs = [
    { name: 'Air Inlet', area: fillArea * 0.63, k: 2.2, densityFactor: 1 },
    { name: 'Rain Zone', area: fillArea, k: 2.9, densityFactor: 1 },
    { name: 'Fill', area: fillArea, k: 15.7, densityFactor: 0.993 },
    { name: 'Spray Zone', area: fillArea, k: 5.3, densityFactor: 0.988 },
    { name: 'Drift Eliminator', area: fillArea, k: 2.8, densityFactor: 0.988 },
    { name: 'Fan Inlet', area: fanNetArea, k: Math.max(toNumber(data.plenumFan.fanInletLossCoefficient, 0.2) * 8, 1.6), densityFactor: 0.988 }
  ];

  const rows: PressureDropRow[] = sectionDefs.map((section) => {
    const density = densityInlet * section.densityFactor;
    const velocity = airflowM3s / section.area;
    const drop = sectionPressureDrop(section.k, density, velocity);

    return {
      name: section.name,
      netArea: section.area,
      velocity,
      density,
      specificVolume: 1 / Math.max(density, 0.1),
      pressureDrop: drop
    };
  });

  const staticOnly = rows.reduce((sum, row) => sum + (row.pressureDrop || 0), 0);
  const regain = data.plenumFan.fanStackRegain ? 0 : 0;
  const buoyancy = -clamp((hotWater - wetBulb) * 0.05, 0, 2);
  const sumStatic = staticOnly + regain + buoyancy;

  const netFanVP = 0.5 * (rows[rows.length - 1].density || densityInlet) * fanVelocity ** 2;
  const fanTotalPressure = sumStatic + netFanVP;

  const tipClearanceMm = Math.max(toNumber(data.plenumFan.fanTipClearance, 24), 0);
  const totalFanEff = clamp(toNumber(data.plenumFan.totalFanEfficiency, 85), 40, 95) / 100;
  const tipFactor = clamp(1 - tipClearanceMm / (fanDiameter * 1000) * 2.1, 0.72, 1.0);
  const effectiveFanEff = totalFanEff * tipFactor;

  const fanPowerKW = airflowM3s * fanTotalPressure / Math.max(effectiveFanEff, 0.3) / 1000;

  const waterLoading = waterFlowPerCellM3Hr / fillArea;
  const fanCoverage = clamp((fanAreaGross / fillArea) * 100, 0, 100);
  const fanBoxRatio = (fanNetArea / fillArea) * 100;

  const evaporationRatePct = 0.00085 * range * 100;
  const evaporationRateM3Hr = totalWaterFlowM3Hr * (evaporationRatePct / 100);

  rows.push({ name: 'Regain', pressureDrop: regain });
  rows.push({ name: 'Bouyancy', pressureDrop: buoyancy });
  rows.push({ name: 'Sum Static dP', pressureDrop: sumStatic });
  rows.push({
    name: 'Net Fan VP',
    netArea: fanNetArea,
    velocity: fanVelocity,
    density: rows[rows.length - 4].density,
    specificVolume: rows[rows.length - 4].specificVolume,
    pressureDrop: netFanVP
  });
  rows.push({ name: 'Fan Total Pressure', pressureDrop: fanTotalPressure });
  rows.push({
    name: 'Stack Exit',
    netArea: Math.max(toNumber(data.plenumFan.plenumHoleDiameter, 5.6), 0.1) ** 2 * Math.PI / 4,
    velocity: airflowM3s / Math.max(Math.max(toNumber(data.plenumFan.plenumHoleDiameter, 5.6), 0.1) ** 2 * Math.PI / 4, 0.1),
    density: rows[rows.length - 3].density,
    specificVolume: rows[rows.length - 3].specificVolume,
    pressureDrop: 0.5 * densityInlet * (airflowM3s / Math.max(Math.max(toNumber(data.plenumFan.plenumHoleDiameter, 5.6), 0.1) ** 2 * Math.PI / 4, 0.1)) ** 2
  });

  const thermalResults = {
    power: fanPowerKW,
    fillVelocity,
    KaVL: {
      spray: sprayKaVL,
      fill: fillKaVL,
      fillTotal: fillKaVL,
      rain: rainKaVL,
      total: totalKaVL,
      derate,
      hwtCorrection,
      adjusted: adjustedKaVL,
      lgRatio
    },
    misc: {
      waterLoading,
      pressureRatio: fanTotalPressure / Math.max(netFanVP, 0.01),
      lgKaVL: lgRatio * adjustedKaVL,
      fanBoxRatio,
      fanCoverage,
      airflowAtFan: airflowM3s,
      effectiveFanEff: effectiveFanEff * 100,
      dryAirRate: airMassFlow,
      totalFillHeight: fillHeight,
      fillArea,
      evaporationRatePct,
      evaporationRateM3Hr,
      inletDBT,
      exitWBT
    }
  };

  return {
    thermalResults,
    airflow: {
      airflow_m3s: airflowM3s,
      dryAirRate: airMassFlow
    },
    pressureDrop: {
      rows,
      totalStatic: sumStatic,
      netFanVP,
      fanTotalPressure
    },
    performance: {
      waterLoading: thermalResults.misc.waterLoading,
      pressureRatio: thermalResults.misc.pressureRatio,
      LG_KaVL: thermalResults.misc.lgKaVL,
      fanEfficiency: thermalResults.misc.effectiveFanEff
    }
  };
}
