import { CalculatorData } from './types';

export const initialCalculatorData: CalculatorData = {
  projectInformation: {
    projectName: '',
    towerType: 'counterflow',
    unitStandard: 'si',
    country: '',
    city: ''
  },
  thermalConditions: {
    solveFor: 'towerCapability',
    towerCapability: '', // editable unless solveFor is towerCapability
    power: '',
    coldWater: '',
    totalWaterFlow: '',
    wetBulb: '',
    relativeHumidity: '',
    range: '',
    pressureInputMode: 'altitude',
    altitude: '',
    barometricPressure: '',
    hotWater: '',
    approach: ''
  },
  towerGeometry: {
    notes: ''
  }
};
