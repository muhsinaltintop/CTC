import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { StepHeader } from '@/components/molecules/StepHeader';
import { PressureInputMode, SolveFor, ThermalConditions } from '@/lib/types';

interface ThermalConditionsStepProps {
  data: ThermalConditions;
  editable: boolean;
  canEdit: boolean;
  canContinue: boolean;
  onChange: (value: Partial<ThermalConditions>) => void;
  onCalculate: () => void;
  onNext: () => void;
  onEdit: () => void;
}

const solveForOptions: { value: SolveFor; label: string }[] = [
  { value: 'towerCapability', label: 'Tower Capability' },
  { value: 'power', label: 'Power' },
  { value: 'coldWater', label: 'Cold Water (°C)' },
  { value: 'totalWaterFlow', label: 'Total Water Flow (m3/hr)' }
];

const pressureOptions: { value: PressureInputMode; label: string }[] = [
  { value: 'altitude', label: 'Altitude (m)' },
  { value: 'barometricPressure', label: 'Barometric Pressure (kPa)' }
];

export function ThermalConditionsStep({
  data,
  editable,
  canEdit,
  canContinue,
  onChange,
  onCalculate,
  onNext,
  onEdit
}: ThermalConditionsStepProps) {
  const canFillTowerCapability = data.solveFor !== 'towerCapability';
  const canFillPower =
    data.solveFor === 'towerCapability' ||
    data.solveFor === 'coldWater' ||
    data.solveFor === 'totalWaterFlow';

  const canFillColdWater =
    data.solveFor === 'towerCapability' ||
    data.solveFor === 'power' ||
    data.solveFor === 'totalWaterFlow';

  const canFillTotalWater =
    data.solveFor === 'towerCapability' ||
    data.solveFor === 'power' ||
    data.solveFor === 'coldWater';

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <StepHeader
        title="Thermal Conditions"
        description="Please complete the information below:"
        canEdit={canEdit}
        onEdit={onEdit}
      />

      <div className="space-y-5">
        {/* Solve For */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-slate-800">
            Solve for:
          </legend>
          <div className="grid gap-2 md:grid-cols-2">
            {solveForOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                <input
                  type="radio"
                  name="solveFor"
                  value={option.value}
                  checked={data.solveFor === option.value}
                  onChange={(event) =>
                    onChange({ solveFor: event.target.value as SolveFor })
                  }
                  disabled={!editable}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Main Inputs */}
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            id="towerCapability"
            type="number"
            label="Tower Capability"
            value={data.towerCapability}
            onChange={(e) => onChange({ towerCapability: e.target.value })}
            disabled={!editable || !canFillTowerCapability}
          />

          <Input
            id="power"
            type="number"
            label="Power"
            value={data.power}
            onChange={(e) => onChange({ power: e.target.value })}
            disabled={!editable || !canFillPower}
          />

          <Input
            id="coldWater"
            type="number"
            label="Cold Water (°C)"
            value={data.coldWater}
            onChange={(e) => onChange({ coldWater: e.target.value })}
            disabled={!editable || !canFillColdWater}
          />

          <Input
            id="totalWaterFlow"
            type="number"
            label="Total Water Flow (m3/hr)"
            value={data.totalWaterFlow}
            onChange={(e) => onChange({ totalWaterFlow: e.target.value })}
            disabled={!editable || !canFillTotalWater}
          />

          <Input
            id="wetBulb"
            type="number"
            label="Wet Bulb (°C)"
            value={data.wetBulb}
            onChange={(e) => onChange({ wetBulb: e.target.value })}
            disabled={!editable}
          />

          <Input
            id="relativeHumidity"
            type="number"
            label="Relative Humidity (%)"
            value={data.relativeHumidity}
            onChange={(e) => onChange({ relativeHumidity: e.target.value })}
            disabled={!editable}
          />

          <Input
            id="range"
            type="number"
            label="Range (°C)"
            value={data.range}
            onChange={(e) => onChange({ range: e.target.value })}
            disabled={!editable}
          />
        </div>

        {/* Atmospheric Input */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-slate-800">
            Atmospheric Input
          </legend>

          <div className="grid gap-2 md:grid-cols-2">
            {pressureOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                <input
                  type="radio"
                  name="pressureInputMode"
                  value={option.value}
                  checked={data.pressureInputMode === option.value}
                  onChange={(event) =>
                    onChange({
                      pressureInputMode:
                        event.target.value as PressureInputMode
                    })
                  }
                  disabled={!editable}
                />
                {option.label}
              </label>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              id="altitude"
              type="number"
              label="Altitude (m)"
              value={data.altitude}
              onChange={(e) => onChange({ altitude: e.target.value })}
              disabled={!editable || data.pressureInputMode !== 'altitude'}
            />

            <Input
              id="barometricPressure"
              type="number"
              label="Barometric Pressure (kPa)"
              value={data.barometricPressure}
              onChange={(e) =>
                onChange({ barometricPressure: e.target.value })
              }
              disabled={
                !editable ||
                data.pressureInputMode !== 'barometricPressure'
              }
            />
          </div>
        </fieldset>
      </div>

      {editable && (
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCalculate}>
            Calculate
          </Button>

          <Button onClick={onNext} disabled={!canContinue}>
            Next: Tower Geometry
          </Button>
        </div>
      )}
    </section>
  );
}
