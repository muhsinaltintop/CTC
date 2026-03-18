import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { StepHeader } from '@/components/molecules/StepHeader';
import {
  AirInletConfiguration,
  CellArrangement,
  TowerGeometry
} from '@/lib/types';

interface TowerGeometryStepProps {
  data: TowerGeometry;
  editable: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onChange: (value: Partial<TowerGeometry>) => void;
}

const numberOfCellsOptions = Array.from({ length: 30 }, (_, index) => {
  const value = String(index + 1);
  return { value, label: value };
});

const cellArrangementOptions: { value: CellArrangement; label: string }[] = [
  { value: 'inline', label: 'Inline' },
  { value: 'backToBack', label: 'Back to Back' }
];

const airInletConfigurationOptions: {
  value: AirInletConfiguration;
  label: string;
}[] = [
  { value: 'bothEndsOpen', label: 'Both Ends Open' },
  { value: 'bothEndsClosed', label: 'Both Ends Closed' },
  { value: 'leftEndClosed', label: 'Left End Closed' },
  { value: 'rightEndClosed', label: 'Right End Closed' },
  { value: 'threeSidesClosed', label: '3 Sides Closed' }
];

function toNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatMeters(value: number): string {
  return value.toFixed(2);
}

export function TowerGeometryStep({
  data,
  editable,
  canEdit,
  onEdit,
  onChange
}: TowerGeometryStepProps) {
  const noOfCells = toNumber(data.noOfCells) ?? 0;
  const cellLength = toNumber(data.cellLength) ?? 0;
  const inletHeight = toNumber(data.inletHeight) ?? 0;
  const cellWidth = toNumber(data.cellWidth) ?? 0;
  const obstruction = toNumber(data.inletObstruction) ?? 0;

  const totalLengthOfTower = noOfCells * cellLength;

  const netTotalInletArea =
    noOfCells * inletHeight * cellWidth * (1 - obstruction / 100);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <StepHeader
        title="Tower Geometry"
        description="Please complete the information below:"
        canEdit={canEdit}
        onEdit={onEdit}
      />

      <div className="space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-slate-800">
            Tower Layout
          </legend>

          <div className="grid gap-4 md:grid-cols-2">
            <Select
              id="noOfCells"
              label="No. of Cells"
              value={data.noOfCells}
              options={numberOfCellsOptions}
              onChange={(event) => onChange({ noOfCells: event.target.value })}
              disabled={!editable}
            />

            <Select
              id="cellArrangement"
              label="Cell Arrangement"
              value={data.cellArrangement}
              options={cellArrangementOptions}
              onChange={(event) =>
                onChange({
                  cellArrangement: event.target.value as CellArrangement
                })
              }
              disabled={!editable}
            />

            <Select
              id="airInletConfiguration"
              label="Air Inlet Configuration"
              value={data.airInletConfiguration}
              options={airInletConfigurationOptions}
              onChange={(event) =>
                onChange({
                  airInletConfiguration:
                    event.target.value as AirInletConfiguration
                })
              }
              disabled={!editable}
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
            <p className="mb-2 font-semibold text-slate-800">
              Tower Layout Sketch (simple)
            </p>
            <div className="rounded border border-dashed border-slate-300 bg-white p-3 font-mono">
              ┌──────────────────────────────┐
              <br />
              │&nbsp;CELL&nbsp;1&nbsp;|&nbsp;CELL&nbsp;2&nbsp;|&nbsp;...&nbsp;|&nbsp;CELL&nbsp;N&nbsp;│
              <br />
              └──────────────────────────────┘
            </div>
          </div>

          <p className="text-sm font-medium text-slate-700">
            Total Length of Tower ={' '}
            <span className="font-semibold text-slate-900">
              {formatMeters(totalLengthOfTower)} m
            </span>
          </p>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-slate-800">
            Cell Geometry
          </legend>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              id="louverType"
              label="Louvers Type"
              value={data.louverType}
              onChange={(event) => onChange({ louverType: event.target.value })}
              disabled={!editable}
            />

            <Input
              id="louverCoeff"
              type="number"
              step="0.01"
              label="Louver Coeff."
              value={data.louverCoeff}
              onChange={(event) => onChange({ louverCoeff: event.target.value })}
              disabled={!editable}
            />

            <Input
              id="inletObstruction"
              type="number"
              step="0.1"
              label="Inlet Obstruction (%)"
              value={data.inletObstruction}
              onChange={(event) =>
                onChange({ inletObstruction: event.target.value })
              }
              disabled={!editable}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-800">Side View</h3>
              <div className="rounded border border-dashed border-slate-300 bg-white p-3 text-xs font-mono text-slate-700">
                ┌───────────────┐
                <br />
                │&nbsp;&nbsp;Inlet&nbsp;Height&nbsp;&nbsp;│
                <br />
                └───────────────┘
              </div>
              <Input
                id="inletHeight"
                type="number"
                step="0.01"
                label="Inlet Height (m)"
                value={data.inletHeight}
                onChange={(event) =>
                  onChange({ inletHeight: event.target.value })
                }
                disabled={!editable}
              />
            </div>

            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-800">Top View</h3>
              <div className="rounded border border-dashed border-slate-300 bg-white p-3 text-xs font-mono text-slate-700">
                ┌──────────────────┐
                <br />
                │&nbsp;Cell&nbsp;Width&nbsp;×&nbsp;Length&nbsp;│
                <br />
                └──────────────────┘
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  id="cellWidth"
                  type="number"
                  step="0.01"
                  label="Cell Width (m)"
                  value={data.cellWidth}
                  onChange={(event) =>
                    onChange({ cellWidth: event.target.value })
                  }
                  disabled={!editable}
                />

                <Input
                  id="cellLength"
                  type="number"
                  step="0.01"
                  label="Cell Length (m)"
                  value={data.cellLength}
                  onChange={(event) =>
                    onChange({ cellLength: event.target.value })
                  }
                  disabled={!editable}
                />
              </div>
            </div>
          </div>

          <p className="text-sm font-medium text-slate-700">
            Net Total Inlet Area ={' '}
            <span className="font-semibold text-slate-900">
              {formatMeters(netTotalInletArea)} m²
            </span>
          </p>
        </fieldset>
      </div>
    </section>
  );
}
