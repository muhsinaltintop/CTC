import { CalculatorData } from '@/lib/types';

export interface NamedValue {
  label: string;
  value: string;
  unit?: string;
}

export interface PressureRow {
  section: string;
  netArea: string;
  velocity: string;
  density: string;
  specificVolume: string;
  pressureDrop: string;
}

export interface ThermalResults {
  power: string;
  kavlRows: NamedValue[];
  fillVelocity: string;
  miscRows: NamedValue[];
  pressureRows: PressureRow[];
}

function toNumber(value: string, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function format(value: number, digits = 2): string {
  return value.toFixed(digits);
}

export function calculateThermalResults(data: CalculatorData): ThermalResults {
  const flow = toNumber(data.thermalConditions.totalWaterFlow);
  const cells = Math.max(toNumber(data.towerGeometry.noOfCells, 1), 1);
  const width = toNumber(data.towerGeometry.cellWidth);
  const length = toNumber(data.towerGeometry.cellLength);
  const area = Math.max(width * length, 0.1);
  const wetBulb = toNumber(data.thermalConditions.wetBulb);
  const coldWater = toNumber(data.thermalConditions.coldWater);
  const hotWater = toNumber(data.thermalConditions.hotWater || data.thermalConditions.range);

  const towerPower =
    toNumber(data.thermalConditions.power) || Math.max((flow * Math.max(hotWater - coldWater, 1)) / 860, 0);

  const fillVelocity = (flow / cells / area) / 3.6;
  const waterLoading = flow / cells / area;
  const sprayZone = toNumber(data.fillSection.sprayHeight);
  const fillHeight = toNumber(data.fillSection.fillHeight);
  const rainZone = toNumber(data.fillSection.rainHeight);
  const kavlTotal = sprayZone + fillHeight + rainZone;
  const kavlDerate = toNumber(data.fillSection.kaVLDerate);
  const hwtCorrection = coldWater > 0 ? ((hotWater - coldWater) / coldWater) * 100 : 0;
  const kavlAdjusted = kavlTotal * (kavlDerate || 1);
  const lgRatio = flow > 0 ? towerPower / flow : 0;

  const fanDiameter = toNumber(data.plenumFan.fanDiameter);
  const fanArea = Math.PI * (fanDiameter / 2) ** 2;
  const airflowFan = Math.max(fillVelocity * area * 1.2, 0);
  const dryAirRate = airflowFan * 1.2;

  const pressureRows: PressureRow[] = [
    'Air Inlet',
    'Rain Zone',
    'Fill',
    'Spray Zone',
    'Drift Eliminator',
    'Fan Inlet',
    'Regain',
    'Bouyancy',
    'Sum Static dP',
    'Net Fan VP',
    'Fan Total Pressure',
    'Stack Exit'
  ].map((section, index) => {
    const multiplier = 1 + index * 0.04;

    return {
      section,
      netArea: format(area * multiplier),
      velocity: format(fillVelocity / Math.max(multiplier, 0.1)),
      density: format(1.2 - index * 0.01, 3),
      specificVolume: format(1 / Math.max(1.2 - index * 0.01, 0.9), 3),
      pressureDrop: format((fillVelocity * multiplier) ** 2 * 0.5)
    };
  });

  return {
    power: format(towerPower, 3),
    kavlRows: [
      { label: 'Spray Zone', value: format(sprayZone, 3) },
      { label: 'CF-1900SB – 1,220 mm', value: format(fillHeight, 3) },
      { label: 'Fill Total', value: format(fillHeight, 3) },
      { label: 'Rain Zone', value: format(rainZone, 3) },
      { label: 'Total KaV/L (CTI)', value: format(kavlTotal, 3) },
      { label: 'KaV/L Derate(%)', value: format(kavlDerate, 3) },
      { label: 'HWT Corr. (%)', value: format(hwtCorrection, 3) },
      { label: 'KaV/L Adjusted', value: format(kavlAdjusted, 3) },
      { label: 'L/G Ratio', value: format(lgRatio, 5) }
    ],
    fillVelocity: format(fillVelocity, 3),
    miscRows: [
      { label: 'Water Loading', value: format(waterLoading, 3), unit: 'm3/hr-m2' },
      { label: 'Pressure Ratio', value: format(kavlAdjusted / Math.max(kavlTotal, 0.1), 3) },
      { label: 'L/G * KaV/L', value: format(lgRatio * kavlAdjusted, 5) },
      { label: 'Fan: Box Ratio', value: format((fanArea / area) * 100, 2), unit: '%' },
      { label: 'Fan Coverage', value: format((fanArea / area) * 100, 2), unit: '%' },
      { label: 'Airflow @ Fan', value: format(airflowFan, 3), unit: 'm3/s/cell' },
      { label: 'Effective Fan Eff.', value: data.plenumFan.totalFanEfficiency || '0.00', unit: '%' },
      { label: 'Dry Air Rate', value: format(dryAirRate, 3), unit: 'kg/s/cell' },
      { label: 'Total Fill Ht.', value: format(fillHeight + rainZone + sprayZone, 3), unit: 'm' },
      { label: 'Fill Area', value: format(area, 3), unit: 'm2/cell' },
      { label: 'Evaporation Rate', value: format(((hotWater - coldWater) / Math.max(hotWater, 1)) * 100, 3), unit: '%' },
      { label: 'Evaporation Rate', value: format((flow * 0.01) / Math.max(cells, 1), 3), unit: 'm3/hr (tower)' },
      { label: 'Inlet DBT', value: format(wetBulb + 3, 3), unit: '°C' },
      { label: 'Exit WBT', value: format(wetBulb + 1.5, 3), unit: '°C' }
    ],
    pressureRows
  };
}
