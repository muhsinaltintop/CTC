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
  },

  fillSection: {
    kaVLDerate: '1.0',
    dpDerate: '1.0',
    fillObstruction: '2.0',
    nozzleType: 'DekSpray Nozzle',
    fillType: 'CF1200',
    availableFillHeight: '300',
    sprayHeight: '0.40',
    fillHeight: '0.00',
    rainHeight: '2.50',
    inletHeight: '2.50',
    waterLoading: '15.94',
    fills: []
  }
};
