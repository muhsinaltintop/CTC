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

export type CellArrangement = 'inline' | 'backToBack';

export type AirInletConfiguration =
  | 'bothEndsOpen'
  | 'bothEndsClosed'
  | 'leftEndClosed'
  | 'rightEndClosed'
  | 'threeSidesClosed';

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
  noOfCells: string;
  cellArrangement: CellArrangement;
  airInletConfiguration: AirInletConfiguration;
  louverType: string;
  louverCoeff: string;
  inletObstruction: string;
  inletHeight: string;
  cellWidth: string;
  cellLength: string;
}

/* ---------------- ROOT ---------------- */

export interface FillSection {
  kaVLDerate: string;
  dpDerate: string;
  fillObstruction: string;
  nozzleType: string;
  fillType: string;
  availableFillHeight: string;
  towerFillLabel: string;
  sprayHeight: string;
  fillHeight: string;
  rainHeight: string;
  inletHeight: string;
  waterLoading: string;
  fills: string[];
}

/* ---------------- ROOT ---------------- */

export interface CalculatorData {
  projectInformation: ProjectInformation;
  thermalConditions: ThermalConditions;
  towerGeometry: TowerGeometry;
  fillSection: FillSection;
}
