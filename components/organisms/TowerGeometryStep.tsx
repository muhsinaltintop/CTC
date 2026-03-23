import { Button } from '@/components/atoms/Button';
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
  isOpen: boolean;
  onToggle: () => void;
  editable: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onChange: (value: Partial<TowerGeometry>) => void;
  onNext: () => void;
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

function getInletWallState(configuration: AirInletConfiguration) {
  return {
    leftClosed:
      configuration === 'bothEndsClosed' ||
      configuration === 'leftEndClosed' ||
      configuration === 'threeSidesClosed',
    rightClosed:
      configuration === 'bothEndsClosed' ||
      configuration === 'rightEndClosed' ||
      configuration === 'threeSidesClosed',
    topClosed: configuration === 'threeSidesClosed'
  };
}

export function TowerGeometryStep({
  data,
  isOpen,
  onToggle,
  editable,
  canEdit,
  onEdit,
  onChange,
  onNext
}: TowerGeometryStepProps) {
  const noOfCells = toNumber(data.noOfCells) ?? 0;
  const cellLength = toNumber(data.cellLength) ?? 0;
  const inletHeight = toNumber(data.inletHeight) ?? 0;
  const cellWidth = toNumber(data.cellWidth) ?? 0;
  const obstruction = toNumber(data.inletObstruction) ?? 0;
  const visualInletHeight = Math.max(0, inletHeight);

  const totalLengthOfTower = noOfCells * cellLength;

  const netTotalInletArea =
    noOfCells * inletHeight * cellWidth * (1 - obstruction / 100);

  const previewCells = Math.max(1, Math.min(30, noOfCells || 1));
  const isBackToBack = data.cellArrangement === 'backToBack';
  const previewColumns = isBackToBack
    ? previewCells >= 4
      ? 2
      : 1
    : previewCells;

  const { leftClosed, rightClosed, topClosed } = getInletWallState(
    data.airInletConfiguration
  );

  const sideView = {
    width: 340,
    height: 280,
    margin: 24,
    chimneyHeight: 28,
    bodyTop: 64,
    bodyHeight: 178
  };
  const louverHeightRatio = Math.min(1, visualInletHeight / 6);
  const louverHeight = Math.max(38, 38 + louverHeightRatio * 72);
  const louverTop =
    sideView.bodyTop + sideView.bodyHeight - louverHeight - sideView.margin / 2;
  const towerLeft = sideView.margin + 48;
  const towerWidth = sideView.width - sideView.margin * 2 - 96;
  const bodyRight = towerLeft + towerWidth;
  const topView = {
    width: 340,
    height: 240,
    margin: 34
  };
  const widthOneValue = Math.max(0, cellWidth);
  const widthTwoValue = Math.max(0, cellLength);
  const widthRatio = widthOneValue > 0 && widthTwoValue > 0
    ? widthOneValue / widthTwoValue
    : 1;
  const topRectMaxWidth = topView.width - topView.margin * 2 - 44;
  const topRectMaxHeight = topView.height - topView.margin * 2 - 20;
  const topRectWidth = Math.min(
    topRectMaxWidth,
    Math.max(72, widthRatio >= 1 ? topRectMaxWidth : topRectMaxHeight * widthRatio)
  );
  const topRectHeight = Math.min(
    topRectMaxHeight,
    Math.max(72, widthRatio >= 1 ? topRectMaxWidth / widthRatio : topRectMaxHeight)
  );
  const topRectX = (topView.width - topRectWidth) / 2;
  const topRectY = (topView.height - topRectHeight) / 2 + 10;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <StepHeader
        title="Tower Geometry"
        description="Please complete the information below:"
        isOpen={isOpen}
        onToggle={onToggle}
        canEdit={canEdit}
        onEdit={onEdit}
      />

      {isOpen ? (
        <>
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
            <p className="mb-2 font-semibold text-slate-800">Tower Layout Preview</p>

            <div className="overflow-x-auto rounded border border-dashed border-slate-300 bg-white p-4">
              <div
                className={[
                  'inline-block rounded-sm border-b-2 border-b-slate-400 p-2',
                  leftClosed ? 'border-l-4 border-l-slate-500' : 'border-l-4 border-l-transparent',
                  rightClosed ? 'border-r-4 border-r-slate-500' : 'border-r-4 border-r-transparent',
                  topClosed ? 'border-t-4 border-t-slate-500' : 'border-t-4 border-t-transparent'
                ].join(' ')}
              >
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${previewColumns}, minmax(54px, 54px))`
                  }}
                >
                  {Array.from({ length: previewCells }, (_, index) => (
                    <div
                      key={`cell-preview-${index + 1}`}
                      className="flex h-12 w-[54px] items-center justify-center rounded border-2 border-sky-500 bg-sky-100 text-[11px] font-semibold text-sky-900"
                    >
                      C{index + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-2 text-[11px] text-slate-500">
              Closed inlet sides are shown with solid dark boundary lines.
            </p>
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
              <div className="rounded border border-dashed border-slate-300 bg-white p-3">
                <svg
                  viewBox={`0 0 ${sideView.width} ${sideView.height}`}
                  role="img"
                  aria-label="Tower side view with chimney, body, and louver section"
                  className="h-64 w-full"
                >
                  <defs>
                    <pattern
                      id="louverPattern"
                      width="12"
                      height="10"
                      patternUnits="userSpaceOnUse"
                    >
                      <line
                        x1="0"
                        y1="10"
                        x2="12"
                        y2="0"
                        stroke="#0f766e"
                        strokeWidth="1.6"
                      />
                    </pattern>
                  </defs>

                  <rect
                    x={towerLeft}
                    y={sideView.bodyTop}
                    width={towerWidth}
                    height={sideView.bodyHeight}
                    rx="2"
                    fill="#f8fafc"
                    stroke="#0f172a"
                    strokeWidth="2.2"
                  />

                  <rect
                    x={towerLeft + towerWidth * 0.33}
                    y={sideView.bodyTop - sideView.chimneyHeight}
                    width={towerWidth * 0.34}
                    height={sideView.chimneyHeight}
                    fill="#e2e8f0"
                    stroke="#0f172a"
                    strokeWidth="2"
                  />

                  <rect
                    x={towerLeft + 14}
                    y={louverTop}
                    width={towerWidth - 28}
                    height={louverHeight}
                    fill="url(#louverPattern)"
                    stroke="#0f766e"
                    strokeWidth="2"
                  />

                  <line
                    x1={bodyRight + 24}
                    y1={louverTop}
                    x2={bodyRight + 24}
                    y2={louverTop + louverHeight}
                    stroke="#334155"
                    strokeWidth="1.8"
                  />
                  <line
                    x1={bodyRight + 18}
                    y1={louverTop}
                    x2={bodyRight + 30}
                    y2={louverTop}
                    stroke="#334155"
                    strokeWidth="1.8"
                  />
                  <line
                    x1={bodyRight + 18}
                    y1={louverTop + louverHeight}
                    x2={bodyRight + 30}
                    y2={louverTop + louverHeight}
                    stroke="#334155"
                    strokeWidth="1.8"
                  />
                  <text
                    x={bodyRight + 36}
                    y={louverTop + louverHeight / 2 + 4}
                    fontSize="11"
                    fill="#334155"
                  >
                    Inlet / Louver Height: {formatMeters(visualInletHeight)} m
                  </text>

                  <text
                    x={towerLeft + towerWidth / 2}
                    y={sideView.bodyTop + 18}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#1e293b"
                  >
                    Chimney
                  </text>
                  <text
                    x={towerLeft + towerWidth / 2}
                    y={sideView.bodyTop + sideView.bodyHeight / 2}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#1e293b"
                  >
                    Tower Body
                  </text>
                  <text
                    x={towerLeft + towerWidth / 2}
                    y={louverTop + louverHeight / 2}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#0f172a"
                    className="font-semibold"
                  >
                    Louvers
                  </text>
                </svg>
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
              <div className="rounded border border-dashed border-slate-300 bg-white p-3">
                <svg
                  viewBox={`0 0 ${topView.width} ${topView.height}`}
                  role="img"
                  aria-label="Tower top view with width-1 and width-2 dimensions"
                  className="h-56 w-full"
                >
                  <rect
                    x={topRectX}
                    y={topRectY}
                    width={topRectWidth}
                    height={topRectHeight}
                    fill="#e0f2fe"
                    stroke="#0f172a"
                    strokeWidth="2.2"
                    rx="2"
                  />

                  <line
                    x1={topRectX}
                    y1={topRectY - 18}
                    x2={topRectX + topRectWidth}
                    y2={topRectY - 18}
                    stroke="#334155"
                    strokeWidth="1.8"
                  />
                  <line
                    x1={topRectX}
                    y1={topRectY - 24}
                    x2={topRectX}
                    y2={topRectY - 12}
                    stroke="#334155"
                    strokeWidth="1.8"
                  />
                  <line
                    x1={topRectX + topRectWidth}
                    y1={topRectY - 24}
                    x2={topRectX + topRectWidth}
                    y2={topRectY - 12}
                    stroke="#334155"
                    strokeWidth="1.8"
                  />
                  <text
                    x={topRectX + topRectWidth / 2}
                    y={topRectY - 26}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#334155"
                  >
                    Width-1: {formatMeters(widthOneValue)} m
                  </text>

                  <line
                    x1={topRectX + topRectWidth + 18}
                    y1={topRectY}
                    x2={topRectX + topRectWidth + 18}
                    y2={topRectY + topRectHeight}
                    stroke="#334155"
                    strokeWidth="1.8"
                  />
                  <line
                    x1={topRectX + topRectWidth + 12}
                    y1={topRectY}
                    x2={topRectX + topRectWidth + 24}
                    y2={topRectY}
                    stroke="#334155"
                    strokeWidth="1.8"
                  />
                  <line
                    x1={topRectX + topRectWidth + 12}
                    y1={topRectY + topRectHeight}
                    x2={topRectX + topRectWidth + 24}
                    y2={topRectY + topRectHeight}
                    stroke="#334155"
                    strokeWidth="1.8"
                  />
                  <text
                    x={topRectX + topRectWidth + 26}
                    y={topRectY + topRectHeight / 2 + 4}
                    fontSize="11"
                    fill="#334155"
                  >
                    Width-2: {formatMeters(widthTwoValue)} m
                  </text>
                </svg>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  id="cellWidth"
                  type="number"
                  step="0.01"
                  label="Width-1 (m)"
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
                  label="Width-2 (m)"
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

          {editable && (
            <div className="mt-5 flex justify-end">
              <Button onClick={onNext}>Next: Fill Section</Button>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
