export type TowerType = 'counterflow';
export type UnitStandard = 'si';
export type SolveFor = 'towerCapability' | 'power' | 'coldWater' | 'totalWaterFlow';
export type PressureInputMode = 'altitude' | 'barometricPressure';

export interface ProjectInformation {
  projectName: string;
  towerType: TowerType;
  unitStandard: UnitStandard;
  country: string;
  city: string;
}

export interface ThermalConditions {
  solveFor: SolveFor;
  towerCapability: string;
  power: string;
  coldWater: string;
  totalWaterFlow: string;
  wetBulb: string;
  relativeHumidity: string;
  range: string;
  pressureInputMode: PressureInputMode;
  altitude: string;
  barometricPressure: string;
  hotWater: string;
  approach: string;
}

export interface TowerGeometry {
  notes: string;
}

export interface CalculatorData {
  projectInformation: ProjectInformation;
  thermalConditions: ThermalConditions;
  towerGeometry: TowerGeometry;
}
