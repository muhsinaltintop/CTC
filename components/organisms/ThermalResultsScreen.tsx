import {
  CoolingTowerPerformanceResults,
  TowerPressureSection
} from '@/lib/calculations';
import { Button } from '@/components/atoms/Button';

interface ThermalResultsScreenProps {
  results: CoolingTowerPerformanceResults;
  onBack: () => void;
}

function format(value: number, digits = 3): string {
  return Number.isFinite(value) ? value.toFixed(digits) : '0.000';
}

function Row({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-2 text-slate-700">{label}</td>
      <td className="py-2 font-semibold text-slate-900">{value}</td>
      <td className="py-2 text-slate-600">{unit || ''}</td>
    </tr>
  );
}

function SectionRow({ row }: { row: TowerPressureSection }) {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-2 text-slate-700">{row.name}</td>
      <td className="py-2">{format(row.velocity)}</td>
      <td className="py-2">{format(row.pressureDrop)}</td>
    </tr>
  );
}

export function ThermalResultsScreen({ results, onBack }: ThermalResultsScreenProps) {
  const { thermalResults, airflow, pressureDrop, performance } = results;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Thermal Results</h2>
        <Button variant="secondary" onClick={onBack}>Back to Inputs</Button>
      </div>

      <p className="mt-3 text-sm text-slate-700">
        <span className="font-semibold">Power:</span> {format(thermalResults.power)} kW
      </p>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">KaV/L Data</h3>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2">Data</th>
                <th className="py-2">Value</th>
                <th className="py-2">Units</th>
              </tr>
            </thead>
            <tbody>
              <Row label="Spray Zone" value={format(thermalResults.KaVL.spray)} />
              <Row label="CF-1900SB – 1,220 mm" value={format(thermalResults.KaVL.fill)} />
              <Row label="Fill Total" value={format(thermalResults.KaVL.fill)} />
              <Row label="Rain Zone" value={format(thermalResults.KaVL.rain)} />
              <Row label="Total KaV/L (CTI)" value={format(thermalResults.KaVL.total)} />
              <Row label="KaV/L Adjusted" value={format(thermalResults.KaVL.adjusted)} />
              <Row label="L/G Ratio" value={format(thermalResults.LG_ratio, 5)} />
            </tbody>
          </table>

          <p className="mt-3 text-sm text-slate-700">
            <span className="font-semibold">Fill Velocity:</span> {format(thermalResults.fillVelocity)} m/sec
          </p>
        </div>

        <div>
          <h3 className="text-base font-semibold text-slate-900">Misc. Data</h3>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2">Data</th>
                <th className="py-2">Value</th>
                <th className="py-2">Units</th>
              </tr>
            </thead>
            <tbody>
              <Row label="Water Loading" value={format(performance.waterLoading)} unit="m3/hr-m2" />
              <Row label="Pressure Ratio" value={format(performance.pressureRatio)} />
              <Row label="L/G * KaV/L" value={format(performance.LG_KaVL)} />
              <Row label="Airflow @ Fan" value={format(airflow.airflow_m3s)} unit="m3/s/cell" />
              <Row label="Dry Air Rate" value={format(airflow.dryAirRate)} unit="kg/s/cell" />
              <Row label="Effective Fan Eff." value={format(performance.fanEfficiency, 2)} unit="%" />
              <Row label="Fan Total Pressure" value={format(pressureDrop.fanTotalPressure)} unit="Pa" />
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-base font-semibold text-slate-900">Tower Section</h3>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2">Tower Section</th>
              <th className="py-2">Velocity (m/sec)</th>
              <th className="py-2">Pres. Drop (Pa)</th>
            </tr>
          </thead>
          <tbody>
            {pressureDrop.sections.map((row) => (
              <SectionRow key={row.name} row={row} />
            ))}
            <tr className="border-b border-slate-100 font-semibold text-slate-900">
              <td className="py-2">Sum Static dP</td>
              <td className="py-2">-</td>
              <td className="py-2">{format(pressureDrop.totalStatic)}</td>
            </tr>
            <tr className="border-b border-slate-100 font-semibold text-slate-900">
              <td className="py-2">Fan Total Pressure</td>
              <td className="py-2">-</td>
              <td className="py-2">{format(pressureDrop.fanTotalPressure)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
