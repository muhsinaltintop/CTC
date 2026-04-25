import { CalculatorData } from '@/lib/types';

function toNumber(value: string, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

const PI = Math.PI;

export interface KeyValueResult {
  label: string;
  value: string;
}

export interface PressureDropRow {
  section: string;
  netArea: string;
  velocity: string;
  density: string;
  specificVolume: string;
  pressureDrop: string;
}

export interface CalculatedResults {
  topValues: KeyValueResult[];
  kaVlRows: KeyValueResult[];
  miscRows: KeyValueResult[];
  pressureDropRows: PressureDropRow[];
}

function fanTipClearanceDerateFactor(fanTipClearanceMm: number): number {
  if (fanTipClearanceMm <= 24) return 0.9278;
  return Math.max(0.75, 0.9278 - (fanTipClearanceMm - 24) * 0.002);
}

function saturationPressureKPa(tempC: number): number {
  return 0.61078 * Math.exp((17.2694 * tempC) / (tempC + 237.29));
}

function barometricPressureFromAltitude(altitudeM: number): number {
  return 101.325 * (1 - 2.25577e-5 * altitudeM) ** 5.25588;
}

function estimateInletDbtC(
  wetBulbC: number,
  relativeHumidityPercent: number,
  barometricPressureKPa: number
): number {
  const rh = Math.min(99, Math.max(1, relativeHumidityPercent)) / 100;
  const p = Math.max(60, barometricPressureKPa);
  const pwsWb = saturationPressureKPa(wetBulbC);
  const psychrometricConstant = 0.00066 * (1 + 0.00115 * wetBulbC);

  const solveResidual = (dryBulbC: number): number => {
    const actualVaporPressureFromRh = rh * saturationPressureKPa(dryBulbC);
    const actualVaporPressureFromWb =
      pwsWb - psychrometricConstant * p * (dryBulbC - wetBulbC);
    return actualVaporPressureFromRh - actualVaporPressureFromWb;
  };

  let low = wetBulbC;
  let high = wetBulbC + 40;

  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    const residual = solveResidual(mid);

    if (residual > 0) high = mid;
    else low = mid;
  }

  return (low + high) / 2;
}

function inletOpenPerimeterFactor(
  configuration: CalculatorData['towerGeometry']['airInletConfiguration']
) {
  switch (configuration) {
    case 'bothEndsOpen':
      return { longSideCount: 2, shortSideCount: 2 };
    case 'bothEndsClosed':
      return { longSideCount: 2, shortSideCount: 0 };
    case 'leftEndClosed':
    case 'rightEndClosed':
      return { longSideCount: 2, shortSideCount: 1 };
    case 'threeSidesClosed':
      return { longSideCount: 1, shortSideCount: 0 };
    default:
      return { longSideCount: 2, shortSideCount: 2 };
  }
}

function stackExitAreaFromFanStackData(cells: number): number {
  const defaultStackExitAreaPerCell = 2.6;
  return defaultStackExitAreaPerCell * cells;
}

export function calculateResults(data: CalculatorData): CalculatedResults {
  const cells = Math.max(1, toNumber(data.towerGeometry.noOfCells, 1));
  const cellWidth = toNumber(data.towerGeometry.cellWidth, 3);
  const cellLength = toNumber(data.towerGeometry.cellLength, 3);
  const inletHeight = toNumber(data.towerGeometry.inletHeight, 2.85);

  const totalWaterFlow = toNumber(data.thermalConditions.totalWaterFlow, 250);
  const wetBulb = toNumber(data.thermalConditions.wetBulb, 30);
  const relativeHumidity = toNumber(data.thermalConditions.relativeHumidity, 70);
  const range = Math.max(0, toNumber(data.thermalConditions.range, 10));
  const hotWater = toNumber(data.thermalConditions.hotWater, wetBulb + range + 3);
  const altitude = toNumber(data.thermalConditions.altitude, 0);
  const pressureInputMode = data.thermalConditions.pressureInputMode;
  const barometricPressure =
    pressureInputMode === 'barometricPressure'
      ? toNumber(
          data.thermalConditions.barometricPressure,
          barometricPressureFromAltitude(altitude)
        )
      : barometricPressureFromAltitude(altitude);

  const fillObstructionPercent = toNumber(data.fillSection.fillObstruction, 1);
  const driftObstructionPercent = toNumber(data.plenumFan.driftObstruction, 2);
  const kaVLDeratePercent = toNumber(data.fillSection.kaVLDerate, 1);
  const hwtCorrectionPercent = round(Math.max(0, (hotWater - 35) * 0.24), 2);

  const selectedFillHeightMm = toNumber(data.fillSection.fillHeight, 0) * 1000;

  const fanDiameter = toNumber(data.plenumFan.fanDiameter, 1.8);
  const sealDiskHubDiameter = toNumber(data.plenumFan.sealDiskHubDiameter, 0.8);
  const transmissionEfficiency = toNumber(data.plenumFan.transmissionEfficiency, 90);
  const totalFanEfficiency = toNumber(data.plenumFan.totalFanEfficiency, 85);
  const fanInletLossCoefficient = toNumber(data.plenumFan.fanInletLossCoefficient, 0.2);

  const grossFillAreaPerCell = cellWidth * cellLength;
  const fillAreaPerCell = grossFillAreaPerCell * (1 - fillObstructionPercent / 100);
  const totalEffectiveFillArea = fillAreaPerCell * cells;

  const waterDensityKgM3 = Math.max(980, 1000 - 0.3 * (hotWater - 4));
  const liquidMassFlowKgS = (totalWaterFlow * waterDensityKgM3) / 3600;

  const designLgRatio = 1.343;
  const totalDryAirRate = liquidMassFlowKgS / designLgRatio;
  const dryAirRatePerCell = totalDryAirRate / cells;

  const fanAirSpecificVolume = 1.035;
  const airflowAtFanPerCell = dryAirRatePerCell * fanAirSpecificVolume;
  const airflowThroughFillPerCell = airflowAtFanPerCell * 0.986;
  const fillVelocity = fillAreaPerCell > 0 ? airflowThroughFillPerCell / fillAreaPerCell : 0;

  const grossFillAreaTotal = grossFillAreaPerCell * cells;
  const fillNetAreaTotal = grossFillAreaTotal * (1 - fillObstructionPercent / 100);
  const driftNetAreaTotal = grossFillAreaTotal * (1 - driftObstructionPercent / 100);

  const towerLength = cellLength * cells;
  const { longSideCount, shortSideCount } = inletOpenPerimeterFactor(
    data.towerGeometry.airInletConfiguration
  );
  const grossInletArea =
    longSideCount * towerLength * inletHeight +
    shortSideCount * cellWidth * inletHeight;
  const netTotalInletArea =
    grossInletArea * (1 - toNumber(data.towerGeometry.inletObstruction, 5) / 100);

  const fanInletAreaPerCell = (PI * (fanDiameter ** 2 - sealDiskHubDiameter ** 2)) / 4;
  const fanInletAreaTotal = fanInletAreaPerCell * cells;

  const stackExitAreaTotal = stackExitAreaFromFanStackData(cells);

  const totalAirflow = airflowAtFanPerCell * cells;

  const inletVelocity = totalAirflow / Math.max(netTotalInletArea, 0.001);
  const rainVelocity = totalAirflow / Math.max(fillNetAreaTotal, 0.001);
  const fillSectionVelocity = (airflowThroughFillPerCell * cells) / Math.max(fillNetAreaTotal, 0.001);
  const sprayVelocity = fillSectionVelocity * 1.014;
  const driftVelocity = totalAirflow / Math.max(driftNetAreaTotal, 0.001);
  const fanInletVelocity = totalAirflow / Math.max(fanInletAreaTotal, 0.001);
  const stackExitVelocity = totalAirflow / Math.max(stackExitAreaTotal, 0.001);

  const density = {
    inlet: 1.014,
    rain: 1.014,
    fill: 1.011,
    spray: 1.008,
    drift: 1.008,
    fan: 1.008,
    stack: 1.008
  };

  const specificVolume = {
    inlet: 1.005,
    rain: 1.005,
    fill: 1.02,
    spray: 1.02,
    drift: 1.035,
    fan: 1.035,
    stack: 1.035
  };

  const scaleDp = (baseDp: number, velocity: number, baseVelocity: number): number =>
    baseDp * (velocity / baseVelocity) ** 2;

  const airInletDP = scaleDp(13.83, inletVelocity, 3.01);
  const rainZoneDP = scaleDp(4.25, rainVelocity, 2.89);
  const fillDP = scaleDp(75.04, fillSectionVelocity, 2.94);
  const sprayZoneDP = scaleDp(19.92, sprayVelocity, 2.98);
  const driftEliminatorDP = scaleDp(12.7, driftVelocity, 3.01);
  const fanInletDP = fanInletLossCoefficient * 0.5 * density.fan * fanInletVelocity ** 2;
  const regainDP = data.plenumFan.fanStackRegain ? -1.5 : 0;
  const buoyancyDP = -0.38;

  const heatTransferSectionPressureDrop = rainZoneDP + fillDP + sprayZoneDP + driftEliminatorDP;
  const inletVelocityPressure = 0.5 * density.inlet * inletVelocity ** 2;
  const pressureRatio = inletVelocityPressure > 0 ? heatTransferSectionPressureDrop / inletVelocityPressure : 0;

  const sumStaticDP =
    airInletDP +
    rainZoneDP +
    fillDP +
    sprayZoneDP +
    driftEliminatorDP +
    fanInletDP +
    regainDP +
    buoyancyDP;

  const netFanVP = 0.5 * density.fan * fanInletVelocity ** 2;
  const fanTotalPressure = sumStaticDP + netFanVP;
  const stackExitVP = 0.5 * density.stack * stackExitVelocity ** 2;

  const tipDerateFactor = fanTipClearanceDerateFactor(toNumber(data.plenumFan.fanTipClearance, 24));
  const effectiveFanEfficiency = totalFanEfficiency * tipDerateFactor;

  const fanPowerKwPerCell =
    (airflowAtFanPerCell * fanTotalPressure) /
    (effectiveFanEfficiency / 100) /
    (transmissionEfficiency / 100) /
    1000;

  const sprayZoneKaVL = 0.181;
  const fillKaVLTotal = 1.423;
  const rainZoneKaVL = 0.065;
  const totalKaVL_CTI = sprayZoneKaVL + fillKaVLTotal + rainZoneKaVL;
  const kaVLAdjusted =
    totalKaVL_CTI * (1 - kaVLDeratePercent / 100) * (1 - hwtCorrectionPercent / 100);

  const LG_ratio = totalDryAirRate > 0 ? liquidMassFlowKgS / totalDryAirRate : 0;
  const LGxKaVL = LG_ratio * kaVLAdjusted;

  const waterLoading = totalEffectiveFillArea > 0 ? totalWaterFlow / totalEffectiveFillArea : 0;
  const totalFillHeight = selectedFillHeightMm / 1000;
  const evaporationRatePercent = range / 5.6;
  const evaporationRateM3Hr = totalWaterFlow * evaporationRatePercent / 100;

  const inletDbt = estimateInletDbtC(wetBulb, relativeHumidity, barometricPressure);
  const exitWbt = wetBulb + range * 0.98;
  const fanArea = (PI * fanDiameter ** 2) / 4;
  const fanBoxRatioPercent = (fanArea / Math.max(grossFillAreaPerCell, 0.001)) * 100;
  const plenumHeight = toNumber(data.plenumFan.plenumHeight, 0);
  const coverageDiameter = fanDiameter + 2 * plenumHeight;
  const coverageArea = (PI * coverageDiameter ** 2) / 4;
  const fanCoveragePercent = Math.min(
    100,
    (coverageArea / Math.max(grossFillAreaPerCell, 0.001)) * 100
  );

  return {
    topValues: [
      { label: 'Power', value: `${round(fanPowerKwPerCell, 2).toFixed(2)} kW` },
      { label: 'Fill Velocity', value: `${round(fillVelocity, 2).toFixed(2)} m/sec` }
    ],
    kaVlRows: [
      { label: 'Spray Zone', value: round(sprayZoneKaVL, 3).toFixed(3) },
      {
        label: `${data.fillSection.fillType || 'CF-1200MABT'} - ${round(selectedFillHeightMm, 0)} mm`,
        value: round(fillKaVLTotal, 3).toFixed(3)
      },
      { label: 'Fill Total', value: round(fillKaVLTotal, 3).toFixed(3) },
      { label: 'Rain Zone', value: round(rainZoneKaVL, 3).toFixed(3) },
      { label: 'Total KaV/L (CTI)', value: round(totalKaVL_CTI, 3).toFixed(3) },
      { label: 'KaV/L Derate (%)', value: round(kaVLDeratePercent, 1).toFixed(1) },
      { label: 'HWT Corr. (%)', value: round(hwtCorrectionPercent, 2).toFixed(2) },
      { label: 'KaV/L Adjusted', value: round(kaVLAdjusted, 3).toFixed(3) },
      { label: 'L/G Ratio', value: round(LG_ratio, 3).toFixed(3) }
    ],
    miscRows: [
      { label: 'Water Loading', value: `${round(waterLoading, 2).toFixed(2)} m3/hr-m2` },
      { label: 'Pressure Ratio', value: round(pressureRatio, 2).toFixed(2) },
      { label: 'L/G * KaV/L', value: round(LGxKaVL, 2).toFixed(2) },
      {
        label: 'Fan: Box Ratio',
        value: `${round(fanBoxRatioPercent, 1).toFixed(1)} %`
      },
      {
        label: 'Fan Coverage',
        value: `${round(fanCoveragePercent, 1).toFixed(1)} %`
      },
      { label: 'Airflow @ Fan', value: `${round(airflowAtFanPerCell, 3).toFixed(3)} m3/s/cell` },
      { label: 'Effective Fan Eff.', value: `${round(effectiveFanEfficiency, 2).toFixed(2)} %` },
      { label: 'Dry Air Rate', value: `${round(dryAirRatePerCell, 2).toFixed(2)} kg/s/cell` },
      { label: 'Total Fill Ht.', value: `${round(totalFillHeight, 1).toFixed(1)} m` },
      { label: 'Fill Area', value: `${round(fillAreaPerCell, 1).toFixed(1)} m2/cell` },
      { label: 'Evaporation Rate (%)', value: `${round(evaporationRatePercent, 2).toFixed(2)} %` },
      { label: 'Evaporation Rate (m3/hr tower)', value: `${round(evaporationRateM3Hr, 1).toFixed(1)} m3/hr tower` },
      { label: 'Inlet DBT', value: `${round(inletDbt, 1).toFixed(1)} C` },
      { label: 'Exit WBT', value: `${round(exitWbt, 1).toFixed(1)} C` }
    ],
    pressureDropRows: [
      {
        section: 'Air Inlet',
        netArea: round(netTotalInletArea, 1).toFixed(1),
        velocity: round(inletVelocity, 2).toFixed(2),
        density: density.inlet.toFixed(3),
        specificVolume: specificVolume.inlet.toFixed(3),
        pressureDrop: round(airInletDP, 2).toFixed(2)
      },
      {
        section: 'Rain Zone',
        netArea: round(fillNetAreaTotal, 1).toFixed(1),
        velocity: round(rainVelocity, 2).toFixed(2),
        density: density.rain.toFixed(3),
        specificVolume: specificVolume.rain.toFixed(3),
        pressureDrop: round(rainZoneDP, 2).toFixed(2)
      },
      {
        section: 'Fill',
        netArea: round(fillNetAreaTotal, 1).toFixed(1),
        velocity: round(fillSectionVelocity, 2).toFixed(2),
        density: density.fill.toFixed(3),
        specificVolume: specificVolume.fill.toFixed(3),
        pressureDrop: round(fillDP, 2).toFixed(2)
      },
      {
        section: 'Spray Zone',
        netArea: round(fillNetAreaTotal, 1).toFixed(1),
        velocity: round(sprayVelocity, 2).toFixed(2),
        density: density.spray.toFixed(3),
        specificVolume: specificVolume.spray.toFixed(3),
        pressureDrop: round(sprayZoneDP, 2).toFixed(2)
      },
      {
        section: 'Drift Eliminator',
        netArea: round(driftNetAreaTotal, 1).toFixed(1),
        velocity: round(driftVelocity, 2).toFixed(2),
        density: density.drift.toFixed(3),
        specificVolume: specificVolume.drift.toFixed(3),
        pressureDrop: round(driftEliminatorDP, 2).toFixed(2)
      },
      {
        section: 'Fan Inlet',
        netArea: round(fanInletAreaTotal, 1).toFixed(1),
        velocity: round(fanInletVelocity, 2).toFixed(2),
        density: density.fan.toFixed(3),
        specificVolume: specificVolume.fan.toFixed(3),
        pressureDrop: round(fanInletDP, 2).toFixed(2)
      },
      {
        section: 'Regain',
        netArea: '-',
        velocity: '-',
        density: '-',
        specificVolume: '-',
        pressureDrop: round(regainDP, 2).toFixed(2)
      },
      {
        section: 'Buoyancy',
        netArea: '-',
        velocity: '-',
        density: '-',
        specificVolume: '-',
        pressureDrop: round(buoyancyDP, 2).toFixed(2)
      },
      {
        section: 'Sum Static dP',
        netArea: '-',
        velocity: '-',
        density: '-',
        specificVolume: '-',
        pressureDrop: round(sumStaticDP, 2).toFixed(2)
      },
      {
        section: 'Net Fan VP',
        netArea: '-',
        velocity: round(fanInletVelocity, 2).toFixed(2),
        density: density.fan.toFixed(3),
        specificVolume: specificVolume.fan.toFixed(3),
        pressureDrop: round(netFanVP, 2).toFixed(2)
      },
      {
        section: 'Fan Total Pressure',
        netArea: '-',
        velocity: '-',
        density: '-',
        specificVolume: '-',
        pressureDrop: round(fanTotalPressure, 2).toFixed(2)
      },
      {
        section: 'Stack Exit',
        netArea: round(stackExitAreaTotal, 1).toFixed(1),
        velocity: round(stackExitVelocity, 2).toFixed(2),
        density: density.stack.toFixed(3),
        specificVolume: specificVolume.stack.toFixed(3),
        pressureDrop: round(stackExitVP, 2).toFixed(2)
      }
    ]
  };
}
