/* ---------------- ENUMS ---------------- */

export type TowerType = 'counterflow';

export type UnitStandard = 'si';

export type SolveFor =
  | 'towerCapability'
  | 'power'
  | 'coldWater'
  | 'totalWaterFlow';

export type PressureInputMode =
  | 'altitude'
  | 'barometricPressure';

/* ---------------- PROJECT ---------------- */

export interface ProjectInformation {
  projectName: string;
  towerType: TowerType;
  unitStandard: UnitStandard;
  country: string;
  city: string;
}

/* ---------------- THERMAL ---------------- */

export interface ThermalConditions {
  /* Solve-for selection */
  solveFor: SolveFor;

  /* Core Inputs */
  towerCapability: string;
  power: string;
  coldWater: string;
  totalWaterFlow: string;
  wetBulb: string;
  relativeHumidity: string;
  range: string;

  /* Atmospheric */
  pressureInputMode: PressureInputMode;
  altitude: string;
  barometricPressure: string;

  /* Calculated */
  hotWater: string;
  approach: string;
}

/* ---------------- GEOMETRY ---------------- */

export interface TowerGeometry {
  notes: string;
}

/* ---------------- ROOT ---------------- */

export interface CalculatorData {
  projectInformation: ProjectInformation;
  thermalConditions: ThermalConditions;
  towerGeometry: TowerGeometry;
}
