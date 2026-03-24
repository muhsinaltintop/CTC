import { ThermalResults } from '@/lib/calculations';
import { Button } from '@/components/atoms/Button';

interface ThermalResultsScreenProps {
  results: ThermalResults;
  onBack: () => void;
}

function DataTable({ rows }: { rows: Array<{ label: string; value: string; unit?: string }> }) {
  return (
    <table className="mt-3 w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-slate-500">
          <th className="py-2 font-medium">Data</th>
          <th className="py-2 font-medium">Value</th>
          <th className="py-2 font-medium">Units</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.label}-${row.unit || 'na'}`} className="border-b border-slate-100">
            <td className="py-2 text-slate-700">{row.label}</td>
            <td className="py-2 font-semibold text-slate-900">{row.value}</td>
            <td className="py-2 text-slate-600">{row.unit || ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ThermalResultsScreen({ results, onBack }: ThermalResultsScreenProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Thermal Results</h2>
        <Button variant="secondary" onClick={onBack}>Back to Inputs</Button>
      </div>

      <p className="mt-3 text-sm text-slate-700">
        <span className="font-semibold">Power:</span> {results.power} kW
      </p>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">KaV/L Data</h3>
          <DataTable rows={results.kavlRows} />
          <p className="mt-3 text-sm text-slate-700">
            <span className="font-semibold">Fill Velocity:</span> {results.fillVelocity} m/sec
          </p>
        </div>

        <div>
          <h3 className="text-base font-semibold text-slate-900">Misc. Data</h3>
          <DataTable rows={results.miscRows} />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-base font-semibold text-slate-900">Tower Section</h3>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2">Tower Section</th>
                <th className="py-2">Net Area (m2)</th>
                <th className="py-2">Velocity (m/sec)</th>
                <th className="py-2">Density (kg/m3)</th>
                <th className="py-2">Sp. Vol. (m3/kg)</th>
                <th className="py-2">Pres. Drop (Pa)</th>
              </tr>
            </thead>
            <tbody>
              {results.pressureRows.map((row) => (
                <tr key={row.section} className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">{row.section}</td>
                  <td className="py-2 font-semibold text-slate-900">{row.netArea}</td>
                  <td className="py-2">{row.velocity}</td>
                  <td className="py-2">{row.density}</td>
                  <td className="py-2">{row.specificVolume}</td>
                  <td className="py-2">{row.pressureDrop}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
