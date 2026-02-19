'use client';

import { useMemo, useState } from 'react';
import { ProjectInformationStep } from '@/components/organisms/ProjectInformationStep';
import { ThermalConditionsStep } from '@/components/organisms/ThermalConditionsStep';
import { TowerGeometryStep } from '@/components/organisms/TowerGeometryStep';
import { initialCalculatorData } from '@/lib/constants';
import { CalculatorData, ThermalConditions } from '@/lib/types';

function toNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function calculateThermalFields(
  data: ThermalConditions
): Pick<ThermalConditions, 'hotWater' | 'approach'> {
  const coldWater = toNumber(data.coldWater);
  const range = toNumber(data.range);
  const wetBulb = toNumber(data.wetBulb);

  const hotWater =
    coldWater !== null && range !== null
      ? String(coldWater + range)
      : '';

  const approach =
    coldWater !== null && wetBulb !== null
      ? String(coldWater - wetBulb)
      : '';

  return { hotWater, approach };
}

export function CalculatorWizard() {
  const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0);
  const [highestUnlockedStep, setHighestUnlockedStep] =
    useState<0 | 1 | 2>(0);

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

      [
        'Tower Geometry Notes',
        calculatorData.towerGeometry.notes || '-'
      ]
    ],
    [calculatorData]
  );

  /* ---------------- VALIDATION ---------------- */

  const canContinueFromThermal = useMemo(() => {
    const t = calculatorData.thermalConditions;

    const pressureProvided =
      t.pressureInputMode === 'altitude'
        ? t.altitude.trim().length > 0
        : t.barometricPressure.trim().length > 0;

    const isSet = (v: string) => v.trim().length > 0;

    return (
      isSet(t.wetBulb) &&
      isSet(t.relativeHumidity) &&
      isSet(t.range) &&
      pressureProvided
    );
  }, [calculatorData]);

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
              setHighestUnlockedStep(1);
              setActiveStep(1);
            }}
            onEdit={() => setActiveStep(0)}
          />

          {/* STEP 2 */}
          <ThermalConditionsStep
            data={calculatorData.thermalConditions}
            editable={activeStep === 1}
            canEdit={highestUnlockedStep >= 1 && activeStep !== 1}
            canContinue={canContinueFromThermal}
            onChange={handleThermalChange}
            onCalculate={() => {}}
            onNext={() => {
              setHighestUnlockedStep(2);
              setActiveStep(2);
            }}
            onEdit={() => {
              if (highestUnlockedStep >= 1) setActiveStep(1);
            }}
          />

          {/* STEP 3 */}
          <TowerGeometryStep
            data={calculatorData.towerGeometry}
            editable={activeStep === 2}
            canEdit={highestUnlockedStep >= 2 && activeStep !== 2}
            onEdit={() => {
              if (highestUnlockedStep >= 2) setActiveStep(2);
            }}
            onChange={(value) =>
              setCalculatorData((prev) => ({
                ...prev,
                towerGeometry: {
                  ...prev.towerGeometry,
                  ...value
                }
              }))
            }
          />
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
