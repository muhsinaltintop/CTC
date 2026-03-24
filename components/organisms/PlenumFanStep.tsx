import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { StepHeader } from '@/components/molecules/StepHeader';
import { PlenumFan } from '@/lib/types';

interface PlenumFanStepProps {
  data: PlenumFan;
  isOpen: boolean;
  editable: boolean;
  canEdit: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onBackToFillSection: () => void;
  onChange: (value: Partial<PlenumFan>) => void;
}

// Keeping option list local for now; future eliminator catalog can be wired here.
const driftEliminatorOptions = [{ value: 'CF80MAx', label: 'CF80MAx' }];

export function PlenumFanStep({
  data,
  isOpen,
  editable,
  canEdit,
  onToggle,
  onEdit,
  onBackToFillSection,
  onChange
}: PlenumFanStepProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-4">
        <StepHeader
          title="Plenum & Fan"
          description="Please complete the information below:"
          isOpen={isOpen}
          onToggle={onToggle}
          canEdit={canEdit}
          onEdit={onEdit}
        />

        <button
          type="button"
          onClick={onBackToFillSection}
          className="mb-4 text-sm font-medium text-sky-700 hover:text-sky-900"
        >
          Back to Fill Section
        </button>
      </div>

      {isOpen ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              id="fanDiameter"
              type="number"
              step="0.01"
              label="Fan Diameter (m)"
              value={data.fanDiameter}
              onChange={(event) => onChange({ fanDiameter: event.target.value })}
              disabled={!editable}
            />

            <label className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={data.fanStackRegain}
                onChange={(event) =>
                  onChange({ fanStackRegain: event.target.checked })
                }
                disabled={!editable}
              />
              Fan Stack Regain
            </label>

            <Input
              id="fanInletLossCoefficient"
              type="number"
              step="0.01"
              label="Fan Inlet Loss Coefficient"
              value={data.fanInletLossCoefficient}
              onChange={(event) =>
                onChange({ fanInletLossCoefficient: event.target.value })
              }
              disabled={!editable}
            />

            <Input
              id="sealDiskHubDiameter"
              type="number"
              step="0.01"
              label="Seal Disk/Hub Diameter (m)"
              value={data.sealDiskHubDiameter}
              onChange={(event) =>
                onChange({ sealDiskHubDiameter: event.target.value })
              }
              disabled={!editable}
            />

            <Input
              id="totalFanEfficiency"
              type="number"
              step="0.1"
              label="Total Fan Efficiency (%)"
              value={data.totalFanEfficiency}
              onChange={(event) =>
                onChange({ totalFanEfficiency: event.target.value })
              }
              disabled={!editable}
            />

            <Input
              id="driftObstruction"
              type="number"
              step="0.1"
              label="Drift Obstruction (%)"
              value={data.driftObstruction}
              onChange={(event) => onChange({ driftObstruction: event.target.value })}
              disabled={!editable}
            />

            <Input
              id="fanTipClearance"
              type="number"
              step="0.01"
              label="Fan Tip Clearance (mm)"
              value={data.fanTipClearance}
              onChange={(event) => onChange({ fanTipClearance: event.target.value })}
              disabled={!editable}
            />

            <Input
              id="transmissionEfficiency"
              type="number"
              step="0.1"
              label="Transmission Efficiency (%)"
              value={data.transmissionEfficiency}
              onChange={(event) =>
                onChange({ transmissionEfficiency: event.target.value })
              }
              disabled={!editable}
            />

            <Select
              id="driftEliminators"
              label="Drift Eliminators"
              value={data.driftEliminators}
              options={driftEliminatorOptions}
              onChange={(event) => onChange({ driftEliminators: event.target.value })}
              disabled={!editable}
            />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Input
              id="fanStackHeight"
              type="number"
              step="0.01"
              label="Fan Stack Height (m)"
              value={data.fanStackHeight}
              onChange={(event) => onChange({ fanStackHeight: event.target.value })}
              disabled={!editable}
            />

            <Input
              id="plenumHeight"
              type="number"
              step="0.01"
              label="Plenum Height (m)"
              value={data.plenumHeight}
              onChange={(event) => onChange({ plenumHeight: event.target.value })}
              disabled={!editable}
            />

            <Input
              id="fanDeckHeight"
              type="number"
              step="0.01"
              label="Fan Deck Height (m)"
              value={data.fanDeckHeight}
              onChange={(event) => onChange({ fanDeckHeight: event.target.value })}
              disabled={!editable}
            />

            <Input
              id="sprayToTopOfDrift"
              type="number"
              step="0.01"
              label="Spray to Top of Drift (m)"
              value={data.sprayToTopOfDrift}
              onChange={(event) =>
                onChange({ sprayToTopOfDrift: event.target.value })
              }
              disabled={!editable}
            />

            <Input
              id="plenumHoleDiameter"
              type="number"
              step="0.01"
              label="Plenum Hole Diameter (m)"
              value={data.plenumHoleDiameter}
              onChange={(event) =>
                onChange({ plenumHoleDiameter: event.target.value })
              }
              disabled={!editable}
            />
          </div>

          {editable ? (
            <div className="mt-5 flex justify-end gap-3">
              <Button>Continue</Button>
              <Button variant="secondary">Close</Button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
