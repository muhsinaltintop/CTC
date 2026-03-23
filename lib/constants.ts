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
  },

  plenumFan: {
    fanDiameter: '4.88',
    sealDiskHubDiameter: '0.80',
    fanTipClearance: '24.00',
    fanStackRegain: false,
    totalFanEfficiency: '85.0',
    transmissionEfficiency: '98.0',
    fanInletLossCoefficient: '0.20',
    driftObstruction: '2.0',
    driftEliminators: 'CF80MAx',
    fanStackHeight: '1.80',
    fanDeckHeight: '6.60',
    plenumHoleDiameter: '5.61',
    plenumHeight: '1.98',
    sprayToTopOfDrift: '0.50'
  }
};
