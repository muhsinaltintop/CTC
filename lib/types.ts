export type TowerType = 'counterflow';
export type UnitStandard = 'si';

export interface ProjectInformation {
  projectName: string;
  towerType: TowerType;
  unitStandard: UnitStandard;
  country: string;
  city: string;
}

export interface ThermalConditions {
  notes: string;
}

export interface CalculatorData {
  projectInformation: ProjectInformation;
  thermalConditions: ThermalConditions;
}
