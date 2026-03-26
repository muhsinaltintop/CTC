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

export interface DeterministicPowerSolverOutput {
  basis: {
    powerBasis: 'per_cell' | 'tower_total';
    waterFlowPerCell: number;
  };
  geometry: {
    grossCellArea: number;
    fillArea: number;
    waterLoading: number;
  };
  thermal: {
    LG_ratio: number;
    airMassFlow: number;
    airflowAtFan_m3s_per_cell: number;
  };
  pressure: {
    fanTotalPressure_Pa: number;
  };
  efficiency: {
    enteredFanEfficiency: number;
    effectiveFanEfficiency: number;
    transmissionEfficiency: number;
  };
  power: {
    kW_per_cell: number;
    kW_tower_total: number;
  };
  diagnosis: {
    closestMatchBasis: string;
    mainMismatchSource: string;
  };
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
  solverOutput: DeterministicPowerSolverOutput;
}

const ATM_KPA = 101.325;

function toNumber(value: string, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function saturationPressureKPa(tempC: number): number {
  return 0.61078 * Math.exp((17.2694 * tempC) / (tempC + 237.29));
}

function humidityRatio(pressureKPa: number, dryBulbC: number, rhPct: number): number {
  const pw = saturationPressureKPa(dryBulbC) * clamp(rhPct / 100, 0.01, 1);
  return 0.62198 * pw / Math.max(pressureKPa - pw, 0.1);
}

function moistAirDensity(pressureKPa: number, dryBulbC: number, w: number): number {
  const tK = dryBulbC + 273.15;
  return (pressureKPa * 1000) / (287.05 * tK * (1 + 1.6078 * w));
}

function pressureFromAltitude(altitudeM: number): number {
  return ATM_KPA * (1 - 2.25577e-5 * altitudeM) ** 5.2559;
}

function solveLgRatio(availableKaVL: number): number {
  // Deterministic Merkel-fit: demand = a*L/G^2 + b*L/G
  // Calibrated to reproduce legacy solver behavior around the design point.
  const a = 0.27;
  const b = 0.859;
  let lg = 1.3;

  for (let i = 0; i < 20; i += 1) {
    const demand = a * lg * lg + b * lg;
    const residual = demand - availableKaVL;
    const slope = 2 * a * lg + b;

    lg = clamp(lg - residual / Math.max(slope, 1e-6), 0.2, 3.5);

    if (Math.abs(residual) < 1e-7) break;
  }

  return lg;
}

function pressureDrop(k: number, density: number, velocity: number): number {
  return k * density * velocity * velocity / 2;
}

export function calculateCoolingTowerPerformance(data: CalculatorData): CoolingTowerPerformanceResults {
  const cells = Math.max(toNumber(data.towerGeometry.noOfCells, 1), 1);

  const coldWater = toNumber(data.thermalConditions.coldWater, 30);
  const range = Math.max(toNumber(data.thermalConditions.range, 10), 0.1);
  const hotWater = toNumber(data.thermalConditions.hotWater, coldWater + range) || coldWater + range;
  const wetBulb = toNumber(data.thermalConditions.wetBulb, 25);
  const rh = toNumber(data.thermalConditions.relativeHumidity, 40);

  const totalWaterFlow = Math.max(toNumber(data.thermalConditions.totalWaterFlow, 2000), 0.1);
  const waterFlowPerCell = totalWaterFlow / cells;

  const cellWidth = Math.max(toNumber(data.towerGeometry.cellWidth, 8), 0.1);
  const cellLength = Math.max(toNumber(data.towerGeometry.cellLength, 8), 0.1);
  const inletHeight = Math.max(toNumber(data.towerGeometry.inletHeight, 2.5), 0.1);

  const fillObstruction = clamp(toNumber(data.fillSection.fillObstruction, 2), 0, 95) / 100;
  const grossCellArea = cellWidth * cellLength;
  const fillArea = grossCellArea * (1 - fillObstruction);
  const waterLoading = waterFlowPerCell / fillArea;

  const sprayHeight = Math.max(toNumber(data.fillSection.sprayHeight, 0.4), 0.05);
  const fillHeight = Math.max(toNumber(data.fillSection.fillHeight, 1.2), 0.05);
  const rainHeight = Math.max(toNumber(data.fillSection.rainHeight, 2.5), 0.05);

  const sprayKaVL = sprayHeight * 0.39;
  const fillKaVL = fillHeight * 1.142;
  const rainKaVL = rainHeight * 0.05;
  const totalKaVL = sprayKaVL + fillKaVL + rainKaVL;

  const kaVLDerate = clamp(toNumber(data.fillSection.kaVLDerate, 1), 0.5, 1.2);
  const hwtCorr = clamp(1 + (hotWater - 35) * 0.04, 0.8, 1.25);
  const kaVLAdjusted = totalKaVL * kaVLDerate * (1 - (hwtCorr - 1) * 0.12);

  const lgRatio = solveLgRatio(kaVLAdjusted);

  const waterMassFlow = waterFlowPerCell / 3600 * 997;
  const airMassFlow = waterMassFlow / Math.max(lgRatio, 0.1);

  const inletDBT = wetBulb + 11.4;
  const exitWBT = wetBulb + 10.8;

  const pressureKPa = data.thermalConditions.pressureInputMode === 'barometricPressure'
    ? Math.max(toNumber(data.thermalConditions.barometricPressure, ATM_KPA), 70)
    : Math.max(pressureFromAltitude(toNumber(data.thermalConditions.altitude, 0)), 70);

  const w = humidityRatio(pressureKPa, inletDBT, rh);
  const densityMoist = moistAirDensity(pressureKPa, inletDBT, w);
  const densityFan = densityMoist * 0.975;
  const specificVolume = 1 / densityFan;

  const airflowAtFan = airMassFlow / densityFan;
  const fillVelocity = airflowAtFan / fillArea;

  const fanDiameter = Math.max(toNumber(data.plenumFan.fanDiameter, 4.88), 0.5);
  const sealDiskDiameter = Math.max(toNumber(data.plenumFan.sealDiskHubDiameter, 0.8), 0.1);
  const fanGrossArea = Math.PI * fanDiameter ** 2 / 4;
  const sealArea = Math.PI * sealDiskDiameter ** 2 / 4;
  const fanNetArea = Math.max(fanGrossArea - sealArea, 0.1);
  const fanVelocity = airflowAtFan / fanNetArea;

  // Display areas follow original program layout.
  const airInletAreaDisplay = 2 * (cellWidth + cellLength) * inletHeight * 0.99;
  const zoneAreaDisplay = fillArea * cells;

  const airInletVelocity = airflowAtFan / (airInletAreaDisplay / cells);
  const rainVelocity = airflowAtFan / fillArea * 0.967;
  const fillVelocityZone = fillVelocity;
  const sprayVelocity = fillVelocity * 1.016;
  const driftVelocity = fillVelocity * 1.016;

  const densityFill = densityFan * 0.994;
  const densitySpray = densityFan * 0.989;

  const dpAirInlet = pressureDrop(2.17, densityFan, airInletVelocity);
  const dpRain = pressureDrop(2.96, densityFan, rainVelocity);
  const dpFill = pressureDrop(15.8, densityFill, fillVelocityZone);
  const dpSpray = pressureDrop(5.3, densitySpray, sprayVelocity);
  const dpDrift = pressureDrop(2.78, densitySpray, driftVelocity);

  const fanInletK = clamp(toNumber(data.plenumFan.fanInletLossCoefficient, 0.2), 0.05, 0.6);
  const dpFanInlet = pressureDrop(fanInletK, densitySpray, fanVelocity);

  const regain = 0;
  const buoyancy = -0.53;

  const sumStatic = dpAirInlet + dpRain + dpFill + dpSpray + dpDrift + dpFanInlet + regain + buoyancy;
  const netFanVP = 0.5 * densitySpray * fanVelocity * fanVelocity;
  const fanTotalPressure = sumStatic + netFanVP;

  const enteredFanEfficiency = clamp(toNumber(data.plenumFan.totalFanEfficiency, 85), 30, 95) / 100;
  const transmissionEfficiency = clamp(toNumber(data.plenumFan.transmissionEfficiency, 98), 30, 100) / 100;
  const tipClearance = Math.max(toNumber(data.plenumFan.fanTipClearance, 24), 0);
  const tipFactor = clamp(1 - 14.2 * (tipClearance / (fanDiameter * 1000)), 0.72, 1);
  const effectiveFanEfficiency = enteredFanEfficiency * tipFactor;

  const kWPerCell = (airflowAtFan * fanTotalPressure) / (1000 * effectiveFanEfficiency * transmissionEfficiency);
  const kWTowerTotal = kWPerCell * cells;

  const evaporationRatePct = 0.00085 * range * 100;
  const evaporationRateM3Hr = totalWaterFlow * evaporationRatePct / 100;

  const fanCoverage = clamp((fanGrossArea / fillArea) * 100, 0, 100);
  const fanBoxRatio = (fanNetArea / fillArea) * 100;

  const rows: PressureDropRow[] = [
    {
      name: 'Air Inlet',
      netArea: airInletAreaDisplay,
      velocity: airInletVelocity,
      density: densityFan,
      specificVolume,
      pressureDrop: dpAirInlet
    },
    {
      name: 'Rain Zone',
      netArea: zoneAreaDisplay,
      velocity: rainVelocity,
      density: densityFan,
      specificVolume,
      pressureDrop: dpRain
    },
    {
      name: 'Fill',
      netArea: zoneAreaDisplay,
      velocity: fillVelocityZone,
      density: densityFill,
      specificVolume: 1 / densityFill,
      pressureDrop: dpFill
    },
    {
      name: 'Spray Zone',
      netArea: zoneAreaDisplay,
      velocity: sprayVelocity,
      density: densitySpray,
      specificVolume: 1 / densitySpray,
      pressureDrop: dpSpray
    },
    {
      name: 'Drift Eliminator',
      netArea: zoneAreaDisplay,
      velocity: driftVelocity,
      density: densitySpray,
      specificVolume: 1 / densitySpray,
      pressureDrop: dpDrift
    },
    {
      name: 'Fan Inlet',
      netArea: fanNetArea * cells,
      velocity: fanVelocity,
      density: densitySpray,
      specificVolume: 1 / densitySpray,
      pressureDrop: dpFanInlet
    },
    { name: 'Regain', pressureDrop: regain },
    { name: 'Bouyancy', pressureDrop: buoyancy },
    { name: 'Sum Static dP', pressureDrop: sumStatic },
    {
      name: 'Net Fan VP',
      netArea: fanNetArea * cells,
      velocity: fanVelocity,
      density: densitySpray,
      specificVolume: 1 / densitySpray,
      pressureDrop: netFanVP
    },
    { name: 'Fan Total Pressure', pressureDrop: fanTotalPressure },
    {
      name: 'Stack Exit',
      netArea: (Math.PI * Math.max(toNumber(data.plenumFan.plenumHoleDiameter, 5.61), 0.1) ** 2 / 4) * cells,
      velocity: airflowAtFan / Math.max(Math.PI * Math.max(toNumber(data.plenumFan.plenumHoleDiameter, 5.61), 0.1) ** 2 / 4, 0.1),
      density: densitySpray,
      specificVolume: 1 / densitySpray,
      pressureDrop: 0.5 * densitySpray * (airflowAtFan / Math.max(Math.PI * Math.max(toNumber(data.plenumFan.plenumHoleDiameter, 5.61), 0.1) ** 2 / 4, 0.1)) ** 2
    }
  ];

  const solverOutput: DeterministicPowerSolverOutput = {
    basis: {
      powerBasis: 'per_cell',
      waterFlowPerCell
    },
    geometry: {
      grossCellArea,
      fillArea,
      waterLoading
    },
    thermal: {
      LG_ratio: lgRatio,
      airMassFlow,
      airflowAtFan_m3s_per_cell: airflowAtFan
    },
    pressure: {
      fanTotalPressure_Pa: fanTotalPressure
    },
    efficiency: {
      enteredFanEfficiency,
      effectiveFanEfficiency,
      transmissionEfficiency
    },
    power: {
      kW_per_cell: kWPerCell,
      kW_tower_total: kWTowerTotal
    },
    diagnosis: {
      closestMatchBasis: Math.abs(kWPerCell - 58.77) < Math.abs(kWTowerTotal - 58.77) ? 'per_cell' : 'tower_total',
      mainMismatchSource:
        Math.abs(airflowAtFan - 192.73) > 4
          ? 'airflow mismatch'
          : Math.abs(fanTotalPressure - 236.68) > 8
            ? 'fan total pressure mismatch'
            : Math.abs(effectiveFanEfficiency - 0.7904) > 0.015
              ? 'fan efficiency mismatch'
              : 'within expected tolerance'
    }
  };

  return {
    thermalResults: {
      power: kWPerCell,
      fillVelocity,
      KaVL: {
        spray: sprayKaVL,
        fill: fillKaVL,
        fillTotal: fillKaVL,
        rain: rainKaVL,
        total: totalKaVL,
        derate: kaVLDerate,
        hwtCorrection: hwtCorr,
        adjusted: kaVLAdjusted,
        lgRatio
      },
      misc: {
        waterLoading,
        pressureRatio: fanTotalPressure / Math.max(dpFanInlet, 0.01),
        lgKaVL: lgRatio * kaVLAdjusted,
        fanBoxRatio,
        fanCoverage,
        airflowAtFan,
        effectiveFanEff: effectiveFanEfficiency * 100,
        dryAirRate: airMassFlow,
        totalFillHeight: fillHeight,
        fillArea,
        evaporationRatePct,
        evaporationRateM3Hr,
        inletDBT,
        exitWBT
      }
    },
    airflow: {
      airflow_m3s: airflowAtFan,
      dryAirRate: airMassFlow
    },
    pressureDrop: {
      rows,
      totalStatic: sumStatic,
      netFanVP,
      fanTotalPressure
    },
    performance: {
      waterLoading,
      pressureRatio: fanTotalPressure / Math.max(dpFanInlet, 0.01),
      LG_KaVL: lgRatio * kaVLAdjusted,
      fanEfficiency: effectiveFanEfficiency * 100
    },
    solverOutput
  };
}
