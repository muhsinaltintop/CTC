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
    /* Solve For */
    solveFor: 'towerCapability',

    /* Core Thermal Inputs */
    towerCapability: '',
    power: '',
    coldWater: '',
    totalWaterFlow: '',
    wetBulb: '',
    relativeHumidity: '',
    range: '',

    /* Atmospheric */
    pressureInputMode: 'altitude',
    altitude: '',
    barometricPressure: '',

    /* Calculated */
    hotWater: '',
    approach: ''
  },

  towerGeometry: {
    noOfCells: '1',
    cellArrangement: 'inline',
    airInletConfiguration: 'bothEndsOpen',
    louverType: 'Louvers Type',
    louverCoeff: '2.15',
    inletObstruction: '1.0',
    inletHeight: '',
    cellWidth: '',
    cellLength: '16'
  }
};
