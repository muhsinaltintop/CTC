import { CalculatorData } from '@/lib/types';

export interface TowerPressureSection {
  name: string;
  velocity: number;
  pressureDrop: number;
}

export interface CoolingTowerPerformanceResults {
  thermalResults: {
    power: number;
    KaVL: {
      spray: number;
      fill: number;
      rain: number;
      total: number;
      adjusted: number;
    };
    LG_ratio: number;
    fillVelocity: number;
  };
  airflow: {
    airflow_m3s: number;
    dryAirRate: number;
  };
  pressureDrop: {
    sections: TowerPressureSection[];
    totalStatic: number;
    fanTotalPressure: number;
  };
  performance: {
    waterLoading: number;
    pressureRatio: number;
    LG_KaVL: number;
    fanEfficiency: number;
  };
}

const MW_WATER = 18.01528;
const MW_DRY_AIR = 28.9647;
const ATM_KPA = 101.325;
const C_PA_DRY_AIR = 1.005;
const C_PV = 1.86;
const H_FG = 2501;

function toNumber(value: string, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function saturationPressureKPa(tempC: number): number {
  // Tetens approximation for 0-60 C
  return 0.61078 * Math.exp((17.2694 * tempC) / (tempC + 237.29));
}

function humidityRatioFromWetBulb(
  wetBulbC: number,
  dryBulbC: number,
  pressureKPa: number,
  relativeHumidityPct?: number
): number {
  const pwsWb = saturationPressureKPa(wetBulbC);
  const wSaturatedWB = 0.62198 * pwsWb / Math.max(pressureKPa - pwsWb, 0.01);

  if (relativeHumidityPct !== undefined && relativeHumidityPct > 0) {
    const rh = clamp(relativeHumidityPct / 100, 0.01, 1);
    const pwsDb = saturationPressureKPa(dryBulbC);
    const pw = rh * pwsDb;
    return 0.62198 * pw / Math.max(pressureKPa - pw, 0.01);
  }

  // psychrometric approximation from WB/DB pair
  const numerator = ((H_FG - 2.326 * wetBulbC) * wSaturatedWB) - C_PA_DRY_AIR * (dryBulbC - wetBulbC);
  const denominator = H_FG + C_PV * dryBulbC - 4.186 * wetBulbC;
  return clamp(numerator / Math.max(denominator, 0.01), 0.0001, 0.06);
}

function moistAirDensity(pressureKPa: number, dryBulbC: number, humidityRatio: number): number {
  const temperatureK = dryBulbC + 273.15;
  const specificGasConstantMoistAir = 287.042 * (1 + humidityRatio) / (1 + humidityRatio * MW_DRY_AIR / MW_WATER);
  return (pressureKPa * 1000) / (specificGasConstantMoistAir * temperatureK);
}


function pressureFromAltitude(altitudeM: number): number {
  // ISA barometric formula
  return ATM_KPA * (1 - 2.25577e-5 * altitudeM) ** 5.2559;
}

function solveLGRatio(targetKaVL: number): number {
  // simplified Merkel-demand relation: demand = a*(L/G)^2 + b*(L/G)
  const a = 0.35;
  const b = 0.85;
  let guess = 1.0;

  for (let i = 0; i < 25; i += 1) {
    const demand = a * guess * guess + b * guess;
    const residual = demand - targetKaVL;

    if (Math.abs(residual) < 1e-5) {
      break;
    }

    const derivative = 2 * a * guess + b;
    guess -= residual / Math.max(derivative, 1e-5);
    guess = clamp(guess, 0.1, 3.5);
  }

  return guess;
}

export function calculateCoolingTowerPerformance(data: CalculatorData): CoolingTowerPerformanceResults {
  const cells = Math.max(toNumber(data.towerGeometry.noOfCells, 1), 1);
  const flowM3Hr = Math.max(toNumber(data.thermalConditions.totalWaterFlow), 0.1);
  const flowM3sPerCell = flowM3Hr / 3600 / cells;

  const coldWater = toNumber(data.thermalConditions.coldWater, 30);
  const range = Math.max(toNumber(data.thermalConditions.range, 5), 0.1);
  const hotWater = toNumber(data.thermalConditions.hotWater) || coldWater + range;
  const wetBulb = toNumber(data.thermalConditions.wetBulb, 25);
  const relativeHumidity = toNumber(data.thermalConditions.relativeHumidity);

  const pressureKPa = data.thermalConditions.pressureInputMode === 'barometricPressure'
    ? Math.max(toNumber(data.thermalConditions.barometricPressure, ATM_KPA), 70)
    : Math.max(pressureFromAltitude(toNumber(data.thermalConditions.altitude, 0)), 70);

  const width = Math.max(toNumber(data.towerGeometry.cellWidth, 12), 0.1);
  const length = Math.max(toNumber(data.towerGeometry.cellLength, 16), 0.1);
  const fillArea = width * length;

  const sprayKaVL = Math.max(toNumber(data.fillSection.sprayHeight, 0.4) * 0.45, 0.01);
  const fillKaVL = Math.max(toNumber(data.fillSection.fillHeight, 1.2) * 1.05, 0.01);
  const rainKaVL = Math.max(toNumber(data.fillSection.rainHeight, 2.5) * 0.33, 0.01);

  const kaVLTotal = sprayKaVL + fillKaVL + rainKaVL;
  const kaVLDerate = clamp(toNumber(data.fillSection.kaVLDerate, 1), 0.6, 1.2);
  const hotWaterCorrectionFactor = clamp(1 + (hotWater - 35) * 0.0055, 0.8, 1.25);
  const kaVLAdjusted = kaVLTotal * kaVLDerate * hotWaterCorrectionFactor;

  const lgRatio = solveLGRatio(kaVLAdjusted);

  const waterMassFlow = flowM3sPerCell * 997;
  const airMassFlow = waterMassFlow / lgRatio;

  const inletDryBulb = wetBulb + 3;
  const humidityRatio = humidityRatioFromWetBulb(
    wetBulb,
    inletDryBulb,
    pressureKPa,
    relativeHumidity > 0 ? relativeHumidity : undefined
  );

  const airDensity = moistAirDensity(pressureKPa, inletDryBulb, humidityRatio);
  const airflowM3s = airMassFlow / Math.max(airDensity, 0.5);
  const fillVelocity = airflowM3s / fillArea;

  const coefficients = {
    inlet: 1.6,
    rain: 2.0,
    fill: 3.2,
    spray: 1.8,
    drift: 1.3,
    fanInlet: Math.max(toNumber(data.plenumFan.fanInletLossCoefficient, 0.2), 0.1)
  };

  const sectionData: Array<{ name: string; areaFactor: number; k: number }> = [
    { name: 'Air Inlet', areaFactor: 1.0, k: coefficients.inlet },
    { name: 'Rain Zone', areaFactor: 0.96, k: coefficients.rain },
    { name: 'Fill', areaFactor: 0.93, k: coefficients.fill },
    { name: 'Spray Zone', areaFactor: 0.95, k: coefficients.spray },
    { name: 'Drift Eliminator', areaFactor: 0.92, k: coefficients.drift },
    { name: 'Fan Inlet', areaFactor: 0.88, k: coefficients.fanInlet }
  ];

  const sections = sectionData.map(({ name, areaFactor, k }) => {
    const velocity = airflowM3s / Math.max(fillArea * areaFactor, 0.1);
    const pressureDrop = k * (velocity ** 2 * airDensity / 2);

    return {
      name,
      velocity,
      pressureDrop
    };
  });

  const totalStatic = sections.reduce((sum, row) => sum + row.pressureDrop, 0);
  const regainPa = clamp(toNumber(data.plenumFan.fanStackRegain ? '12' : '0'), 0, 20);
  const buoyancyPa = clamp((hotWater - wetBulb) * 0.8, 0, 25);
  const velocityPressure = 0.5 * airDensity * fillVelocity ** 2;
  const fanTotalPressure = Math.max(totalStatic - regainPa - buoyancyPa + velocityPressure, 0);

  const tipClearanceMm = toNumber(data.plenumFan.fanTipClearance, 24);
  const designEfficiency = clamp(toNumber(data.plenumFan.totalFanEfficiency, 85) / 100, 0.45, 0.92);
  const tipCorrection = clamp(1 - (tipClearanceMm - 10) * 0.003, 0.75, 1.02);
  const fanEfficiency = designEfficiency * tipCorrection;

  const fanPowerKW = (airflowM3s * fanTotalPressure) / Math.max(fanEfficiency, 0.35) / 1000;

  const waterLoading = flowM3Hr / Math.max(fillArea * cells, 0.1);
  const pressureRatio = fanTotalPressure / Math.max(totalStatic, 1);
  const lgKaVL = lgRatio * kaVLAdjusted;

  return {
    thermalResults: {
      power: fanPowerKW,
      KaVL: {
        spray: sprayKaVL,
        fill: fillKaVL,
        rain: rainKaVL,
        total: kaVLTotal,
        adjusted: kaVLAdjusted
      },
      LG_ratio: lgRatio,
      fillVelocity
    },
    airflow: {
      airflow_m3s: airflowM3s,
      dryAirRate: airMassFlow
    },
    pressureDrop: {
      sections,
      totalStatic,
      fanTotalPressure
    },
    performance: {
      waterLoading,
      pressureRatio,
      LG_KaVL: lgKaVL,
      fanEfficiency: fanEfficiency * 100
    }
  };
}
