'use client';

import { useMemo, useState } from 'react';
import { ProjectInformationStep } from '@/components/organisms/ProjectInformationStep';
import { ThermalConditionsStep } from '@/components/organisms/ThermalConditionsStep';
import { initialCalculatorData } from '@/lib/constants';
import { CalculatorData } from '@/lib/types';

export function CalculatorWizard() {
  const [activeStep, setActiveStep] = useState<0 | 1>(0);
  const [calculatorData, setCalculatorData] = useState<CalculatorData>(initialCalculatorData);
  const [isThermalStepUnlocked, setIsThermalStepUnlocked] = useState(false);
  const [resultMessage, setResultMessage] = useState<string>('');

  const summaryRows = useMemo(
    () => [
      ['Project Name', calculatorData.projectInformation.projectName || '-'],
      ['Tower Type', calculatorData.projectInformation.towerType],
      ['Unit Standards', calculatorData.projectInformation.unitStandard.toUpperCase()],
      ['Country', calculatorData.projectInformation.country || '-'],
      ['City', calculatorData.projectInformation.city || '-'],
      ['Thermal Notes', calculatorData.thermalConditions.notes || '-']
    ],
    [calculatorData]
  );

  const onCalculate = () => {
    setResultMessage(
      `Calculation trigger ready. Stored project: ${calculatorData.projectInformation.projectName || 'Unnamed Project'}.`
    );
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">CTP Water Cooling Tower Calculator</h1>
        <p className="mt-1 text-sm text-slate-600">
          Multi-step wizard with locked completed steps and centralized state.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <ProjectInformationStep
            data={calculatorData.projectInformation}
            editable={activeStep === 0}
            onChange={(value) =>
              setCalculatorData((previous) => ({
                ...previous,
                projectInformation: { ...previous.projectInformation, ...value }
              }))
            }
            onNext={() => {
              setIsThermalStepUnlocked(true);
              setActiveStep(1);
              setResultMessage('');
            }}
            onEdit={() => {
              setActiveStep(0);
              setResultMessage('');
            }}
          />

          <ThermalConditionsStep
            data={calculatorData.thermalConditions}
            editable={activeStep === 1 && isThermalStepUnlocked}
            onChange={(value) =>
              setCalculatorData((previous) => ({
                ...previous,
                thermalConditions: { ...previous.thermalConditions, ...value }
              }))
            }
            onCalculate={onCalculate}
            canEdit={isThermalStepUnlocked && activeStep !== 1}
            onEdit={() => {
              if (!isThermalStepUnlocked) return;
              setActiveStep(1);
              setResultMessage('');
            }}
          />
        </div>

        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Captured Data</h2>
          <p className="mt-1 text-sm text-slate-600">Values remain visible while progressing through each page.</p>
          <dl className="mt-4 space-y-2">
            {summaryRows.map(([label, value]) => (
              <div key={label} className="rounded-md bg-slate-50 p-2">
                <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="text-sm font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>

          {resultMessage ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {resultMessage}
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
