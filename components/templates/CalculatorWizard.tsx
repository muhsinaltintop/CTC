'use client';

import { useMemo, useState } from 'react';
import { ProjectInformationStep } from '@/components/organisms/ProjectInformationStep';
import { ThermalConditionsStep } from '@/components/organisms/ThermalConditionsStep';
import { TowerGeometryStep } from '@/components/organisms/TowerGeometryStep';
import { FillSectionStep } from '@/components/organisms/FillSectionStep';
import { PlenumFanStep } from '@/components/organisms/PlenumFanStep';
import { ReviewRunCalculationsStep } from '@/components/organisms/ReviewRunCalculationsStep';
import { initialCalculatorData } from '@/lib/constants';
import { CalculatorData, ThermalConditions } from '@/lib/types';

function toNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function calculateThermalFields(
  data: ThermalConditions
): Pick<ThermalConditions, 'hotWater' | 'range' | 'approach'> {
  const coldWater = toNumber(data.coldWater);
  const hotWaterInput = toNumber(data.hotWater);
  const range = toNumber(data.range);
  const wetBulb = toNumber(data.wetBulb);
  const approachInput = toNumber(data.approach);

  const hotWaterCalculated =
    coldWater !== null && range !== null
      ? coldWater + range
      : hotWaterInput;

  const rangeCalculated =
    coldWater !== null && hotWaterCalculated !== null
      ? hotWaterCalculated - coldWater
      : range;

  const approachCalculated =
    coldWater !== null && wetBulb !== null
      ? coldWater - wetBulb
      : approachInput;

  return {
    hotWater: hotWaterCalculated !== null ? String(hotWaterCalculated) : '',
    range: rangeCalculated !== null ? String(rangeCalculated) : '',
    approach: approachCalculated !== null ? String(approachCalculated) : ''
  };
}

export function CalculatorWizard() {
  const [activeStep, setActiveStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [openSteps, setOpenSteps] = useState<Record<0 | 1 | 2 | 3 | 4 | 5, boolean>>({
    0: true,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false
  });

  const [calculatorData, setCalculatorData] =
    useState<CalculatorData>(initialCalculatorData);

  /* ---------------- SUMMARY ---------------- */

  const summaryRows = useMemo(
    () => [
      ['Project Name', calculatorData.projectInformation.projectName || '-'],
      ['Tower Type', calculatorData.projectInformation.towerType],
      [
        'Unit Standards',
        calculatorData.projectInformation.unitStandard.toUpperCase()
      ],
      ['Country', calculatorData.projectInformation.country || '-'],
      ['City', calculatorData.projectInformation.city || '-'],

      ['Solve For', calculatorData.thermalConditions.solveFor],
      ['Power', calculatorData.thermalConditions.power || '-'],
      ['Cold Water (°C)', calculatorData.thermalConditions.coldWater || '-'],
      [
        'Total Water Flow (m3/hr)',
        calculatorData.thermalConditions.totalWaterFlow || '-'
      ],
      ['Wet Bulb (°C)', calculatorData.thermalConditions.wetBulb || '-'],
      [
        'Relative Humidity (%)',
        calculatorData.thermalConditions.relativeHumidity || '-'
      ],
      ['Range (°C)', calculatorData.thermalConditions.range || '-'],
      ['Altitude (m)', calculatorData.thermalConditions.altitude || '-'],
      [
        'Barometric Pressure (kPa)',
        calculatorData.thermalConditions.barometricPressure || '-'
      ],
      ['Hot Water (°C)', calculatorData.thermalConditions.hotWater || '-'],
      ['Approach (°C)', calculatorData.thermalConditions.approach || '-'],

      ['No. of Cells', calculatorData.towerGeometry.noOfCells || '-'],
      [
        'Cell Arrangement',
        calculatorData.towerGeometry.cellArrangement === 'backToBack'
          ? 'Back to Back'
          : 'Inline'
      ],
      [
        'Air Inlet Configuration',
        {
          bothEndsOpen: 'Both Ends Open',
          bothEndsClosed: 'Both Ends Closed',
          leftEndClosed: 'Left End Closed',
          rightEndClosed: 'Right End Closed',
          threeSidesClosed: '3 Sides Closed'
        }[calculatorData.towerGeometry.airInletConfiguration]
      ],
      ['Inlet Height (m)', calculatorData.towerGeometry.inletHeight || '-'],
      ['Cell Width (m)', calculatorData.towerGeometry.cellWidth || '-'],
      ['Cell Length (m)', calculatorData.towerGeometry.cellLength || '-'],

      ['KaV/L Derate (%)', calculatorData.fillSection.kaVLDerate || '-'],
      ['dP Derate (%)', calculatorData.fillSection.dpDerate || '-'],
      ['Fill Obstruction (%)', calculatorData.fillSection.fillObstruction || '-'],
      ['Nozzle Type', calculatorData.fillSection.nozzleType || '-'],
      ['Fill Type', calculatorData.fillSection.fillType || '-'],
      ['Spray Height (m)', calculatorData.fillSection.sprayHeight || '-'],
      ['Fill Height (m)', calculatorData.fillSection.fillHeight || '-'],
      ['Rain Height (m)', calculatorData.fillSection.rainHeight || '-'],
      ['Inlet Height (m) - Fill', calculatorData.fillSection.inletHeight || '-'],
      ['Water Loading (m3/hr-m2)', calculatorData.fillSection.waterLoading || '-'],

      ['Fan Diameter (m)', calculatorData.plenumFan.fanDiameter || '-'],
      ['Seal Disk/Hub Diameter (m)', calculatorData.plenumFan.sealDiskHubDiameter || '-'],
      ['Fan Tip Clearance (mm)', calculatorData.plenumFan.fanTipClearance || '-'],
      ['Fan Stack Regain', calculatorData.plenumFan.fanStackRegain ? 'Yes' : 'No'],
      ['Total Fan Efficiency (%)', calculatorData.plenumFan.totalFanEfficiency || '-'],
      ['Transmission Efficiency (%)', calculatorData.plenumFan.transmissionEfficiency || '-'],
      ['Fan Inlet Loss Coefficient', calculatorData.plenumFan.fanInletLossCoefficient || '-'],
      ['Drift Obstruction (%)', calculatorData.plenumFan.driftObstruction || '-'],
      ['Drift Eliminators', calculatorData.plenumFan.driftEliminators || '-'],
      ['Fan Stack Height (m)', calculatorData.plenumFan.fanStackHeight || '-'],
      ['Fan Deck Height (m)', calculatorData.plenumFan.fanDeckHeight || '-'],
      ['Plenum Hole Diameter (m)', calculatorData.plenumFan.plenumHoleDiameter || '-'],
      ['Plenum Height (m)', calculatorData.plenumFan.plenumHeight || '-'],
      ['Spray to Top of Drift (m)', calculatorData.plenumFan.sprayToTopOfDrift || '-']
    ],
    [calculatorData]
  );

  /* ---------------- VALIDATION ---------------- */
  // TODO: Re-enable thermal prerequisite checks after development is completed.
  // const canContinueFromThermal = useMemo(() => { ... }, [calculatorData]);

  /* ---------------- HANDLERS ---------------- */

  const handleThermalChange = (
    value: Partial<ThermalConditions>
  ) => {
    setCalculatorData((prev) => {
      const merged = { ...prev.thermalConditions, ...value };
      const calculated = calculateThermalFields(merged);

      if ('pressureInputMode' in value) {
        if (value.pressureInputMode === 'altitude')
          merged.barometricPressure = '';

        if (value.pressureInputMode === 'barometricPressure')
          merged.altitude = '';
      }

      return {
        ...prev,
        thermalConditions: {
          ...merged,
          ...calculated
        }
      };
    });
  };

  const activateStep = (step: 0 | 1 | 2 | 3 | 4 | 5) => {
    setActiveStep(step);
    setOpenSteps((prev) => ({
      ...prev,
      [step]: true
    }));
  };

  const toggleStepOpen = (step: 0 | 1 | 2 | 3 | 4 | 5) => {
    setOpenSteps((prev) => ({
      ...prev,
      [step]: !prev[step]
    }));
  };

  /* ---------------- UI ---------------- */

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          CTP Water Cooling Tower Calculator
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Multi-step wizard with locked completed steps and centralized state.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* LEFT — STEPS */}

        <div className="space-y-4">
          {/* STEP 1 */}
          <ProjectInformationStep
            data={calculatorData.projectInformation}
            isOpen={openSteps[0]}
            onToggle={() => toggleStepOpen(0)}
            editable={activeStep === 0}
            onChange={(value) =>
              setCalculatorData((prev) => ({
                ...prev,
                projectInformation: {
                  ...prev.projectInformation,
                  ...value
                }
              }))
            }
            onNext={() => {
              activateStep(1);
            }}
            onEdit={() => activateStep(0)}
          />

          {/* STEP 2 */}
          <ThermalConditionsStep
            data={calculatorData.thermalConditions}
            isOpen={openSteps[1]}
            onToggle={() => toggleStepOpen(1)}
            editable={activeStep === 1}
            canEdit={activeStep !== 1}
            canContinue
            onChange={handleThermalChange}
            onCalculate={() => {}}
            onNext={() => {
              activateStep(2);
            }}
            onEdit={() => activateStep(1)}
          />

          {/* STEP 3 */}
          <TowerGeometryStep
            data={calculatorData.towerGeometry}
            isOpen={openSteps[2]}
            onToggle={() => toggleStepOpen(2)}
            editable={activeStep === 2}
            canEdit={activeStep !== 2}
            onEdit={() => activateStep(2)}
            onChange={(value) =>
              setCalculatorData((prev) => ({
                ...prev,
                towerGeometry: {
                  ...prev.towerGeometry,
                  ...value
                }
              }))
            }
            onNext={() => {
              activateStep(3);
            }}
          />

          <FillSectionStep
            data={calculatorData.fillSection}
            isOpen={openSteps[3]}
            onToggle={() => toggleStepOpen(3)}
            editable={activeStep === 3}
            canEdit={activeStep !== 3}
            onEdit={() => activateStep(3)}
            onNext={() => activateStep(4)}
            onChange={(value) =>
              setCalculatorData((prev) => ({
                ...prev,
                fillSection: {
                  ...prev.fillSection,
                  ...value
                }
              }))
            }
          />

          <PlenumFanStep
            data={calculatorData.plenumFan}
            isOpen={openSteps[4]}
            onToggle={() => toggleStepOpen(4)}
            editable={activeStep === 4}
            canEdit={activeStep !== 4}
            onEdit={() => activateStep(4)}
            onChange={(value) =>
              setCalculatorData((prev) => ({
                ...prev,
                plenumFan: {
                  ...prev.plenumFan,
                  ...value
                }
              }))
            }
            onNext={() => activateStep(5)}
          />

          {activeStep === 5 ? <ReviewRunCalculationsStep /> : null}
        </div>

        {/* RIGHT — SUMMARY */}

        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Captured Data
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Values remain visible while progressing through each page.
          </p>

          <dl className="mt-4 space-y-2">
            {summaryRows.map(([label, value]) => (
              <div
                key={label}
                className="rounded-md bg-slate-50 p-2"
              >
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  {label}
                </dt>
                <dd className="text-sm font-medium text-slate-800">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </main>
  );
}
