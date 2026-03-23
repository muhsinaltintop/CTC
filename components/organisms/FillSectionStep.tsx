import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { StepHeader } from '@/components/molecules/StepHeader';
import { FillSection } from '@/lib/types';

interface FillSectionStepProps {
  data: FillSection;
  editable: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onBackToTowerGeometry: () => void;
  onChange: (value: Partial<FillSection>) => void;
}

const nozzleTypeOptions = [
  { value: 'DekSpray Nozzle', label: 'DekSpray Nozzle' }
];

const fillTypeOptions = [
  { value: 'CF1200', label: 'CF1200' }
];

const availableFillHeights = [
  { value: '300', label: '300 mm', disabled: false },
  { value: '600', label: '600 mm', disabled: true },
  { value: '900', label: '900 mm', disabled: true },
  { value: '1200', label: '1200 mm', disabled: true },
  { value: '1500', label: '1500 mm', disabled: true },
  { value: '1800', label: '1800 mm', disabled: true }
];

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatTwo(value: number): string {
  return value.toFixed(2);
}


function calcTotalFillHeight(fills: string[]): string {
  const totalMm = fills.reduce((sum, fillMm) => sum + toNumber(fillMm), 0);
  return (totalMm / 1000).toFixed(2);
}

export function FillSectionStep({
  data,
  editable,
  canEdit,
  onEdit,
  onBackToTowerGeometry,
  onChange
}: FillSectionStepProps) {
  const fillStack = data.fills ?? [];

  const totalHeight =
    toNumber(data.sprayHeight) +
    toNumber(data.fillHeight) +
    toNumber(data.rainHeight);

  const handleAddFill = () => {
    const updatedFills = [...fillStack, data.availableFillHeight];

    onChange({
      fills: updatedFills,
      fillHeight: calcTotalFillHeight(updatedFills)
    });
  };

  const handleRemoveFill = (indexToRemove: number) => {
    const updatedFills = fillStack.filter((_, index) => index !== indexToRemove);

    onChange({
      fills: updatedFills,
      fillHeight: calcTotalFillHeight(updatedFills)
    });
  };

  const handleRemoveAllFills = () => {
    onChange({
      fills: [],
      fillHeight: '0.00'
    });
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-4">
        <StepHeader
          title="Fill Section"
          description="Please complete the information below:"
          canEdit={canEdit}
          onEdit={onEdit}
        />

        <button
          type="button"
          onClick={onBackToTowerGeometry}
          className="mb-4 text-sm font-medium text-sky-700 hover:text-sky-900"
        >
          Back to Tower Geometry
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <fieldset className="space-y-3 rounded-lg border border-slate-200 p-4">
            <legend className="px-1 text-sm font-semibold text-slate-800">
              Rating Factors
            </legend>

            <div className="grid gap-3">
              <Input
                id="kaVLDerate"
                type="number"
                step="0.1"
                label="KaV/L Derate (%)"
                value={data.kaVLDerate}
                onChange={(event) => onChange({ kaVLDerate: event.target.value })}
                disabled={!editable}
              />

              <Input
                id="dpDerate"
                type="number"
                step="0.1"
                label="dP Derate (%)"
                value={data.dpDerate}
                onChange={(event) => onChange({ dpDerate: event.target.value })}
                disabled={!editable}
              />

              <Input
                id="fillObstruction"
                type="number"
                step="0.1"
                label="Fill Obstruction (%)"
                value={data.fillObstruction}
                onChange={(event) =>
                  onChange({ fillObstruction: event.target.value })
                }
                disabled={!editable}
              />
            </div>
          </fieldset>

          <Select
            id="nozzleType"
            label="Nozzle Type"
            value={data.nozzleType}
            options={nozzleTypeOptions}
            onChange={(event) => onChange({ nozzleType: event.target.value })}
            disabled={!editable}
          />

          <Select
            id="fillType"
            label="Fill Type"
            value={data.fillType}
            options={fillTypeOptions}
            onChange={(event) => onChange({ fillType: event.target.value })}
            disabled={!editable}
          />

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-slate-800">
              Available Fill Heights:
            </legend>

            {availableFillHeights.map((heightOption) => (
              <label
                key={heightOption.value}
                className={[
                  'flex items-center gap-2 text-sm',
                  heightOption.disabled ? 'text-slate-400' : 'text-slate-700'
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="availableFillHeight"
                  value={heightOption.value}
                  checked={data.availableFillHeight === heightOption.value}
                  onChange={(event) =>
                    onChange({ availableFillHeight: event.target.value })
                  }
                  disabled={!editable || heightOption.disabled}
                />
                {heightOption.label}
              </label>
            ))}

            <div className="flex items-center gap-4 pt-1">
              <Button
                type="button"
                onClick={handleAddFill}
                disabled={!editable}
              >
                Add Fill
              </Button>
              <button
                type="button"
                onClick={handleRemoveAllFills}
                disabled={!editable || fillStack.length === 0}
                className="text-sm text-sky-700 underline disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Remove All Fills
              </button>
            </div>
          </fieldset>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-800">Tower Fill</h3>

          <div className="rounded border border-dashed border-sky-300 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                id="sprayHeight"
                type="number"
                step="0.01"
                label="Spray Height (m)"
                value={data.sprayHeight}
                onChange={(event) => onChange({ sprayHeight: event.target.value })}
                disabled={!editable}
              />

              <Input
                id="fillHeight"
                type="number"
                step="0.01"
                label="Fill Height (m)"
                value={data.fillHeight}
                readOnly
                disabled
              />

              <Input
                id="rainHeight"
                type="number"
                step="0.01"
                label="Rain Height (m)"
                value={data.rainHeight}
                onChange={(event) => onChange({ rainHeight: event.target.value })}
                disabled={!editable}
              />

              <Input
                id="inletHeightFill"
                type="number"
                step="0.01"
                label="Inlet Height (m)"
                value={data.inletHeight}
                onChange={(event) => onChange({ inletHeight: event.target.value })}
                disabled={!editable}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Fill Height is auto-calculated from the fills added to the stack.
            </p>

            <div className="mt-3 space-y-2">
              {fillStack.length === 0 ? (
                <p className="text-xs text-slate-500">No fills added yet.</p>
              ) : (
                fillStack.map((fillMm, index) => (
                  <div
                    key={`fill-${index}-${fillMm}`}
                    className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-700">
                      {data.fillType} • {fillMm} mm
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFill(index)}
                      disabled={!editable}
                      className="text-xs font-semibold text-rose-600 underline disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>

          <p className="text-sm font-medium text-slate-700">
            Total Height:{' '}
            <span className="font-semibold text-slate-900">
              {formatTwo(totalHeight)} m
            </span>
          </p>

          <Input
            id="waterLoading"
            type="number"
            step="0.01"
            label="Water Loading (m3/hr-m2)"
            value={data.waterLoading}
            onChange={(event) => onChange({ waterLoading: event.target.value })}
            disabled={!editable}
          />
        </div>
      </div>

      {editable && (
        <div className="mt-5 flex justify-end gap-3">
          <Button>Continue</Button>
          <Button variant="secondary">Close</Button>
        </div>
      )}
    </section>
  );
}
