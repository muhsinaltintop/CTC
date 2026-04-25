import { CalculatorData } from '@/lib/types';
import { calculateResults } from '@/lib/calculations/results';

interface ResultsPageProps {
  data: CalculatorData;
}

export function ResultsPage({ data }: ResultsPageProps) {
  const results = calculateResults(data);

  return (
    <section className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Results</h2>

      <div className="space-y-3">
        <h3 className="text-base font-semibold text-slate-800">1) THERMAL RESULTS</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {results.topValues.map((row) => (
            <div key={row.label} className="rounded-md bg-slate-50 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">{row.label}</div>
              <div className="text-lg font-semibold text-slate-900">{row.value}</div>
            </div>
          ))}
        </div>

        <ResultList title="KaV/L Data" rows={results.kaVlRows} />
        <ResultList title="Misc. Data" rows={results.miscRows} />
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-semibold text-slate-800">2) PRESSURE DROP / AIR FLOW RESULTS</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-700">
                <th className="border border-slate-200 px-3 py-2">Tower Section</th>
                <th className="border border-slate-200 px-3 py-2">Net Area</th>
                <th className="border border-slate-200 px-3 py-2">Velocity</th>
                <th className="border border-slate-200 px-3 py-2">Density</th>
                <th className="border border-slate-200 px-3 py-2">Sp. Vol.</th>
                <th className="border border-slate-200 px-3 py-2">Pres. Drop</th>
              </tr>
            </thead>
            <tbody>
              {results.pressureDropRows.map((row) => (
                <tr key={row.section}>
                  <td className="border border-slate-200 px-3 py-2 font-medium text-slate-800">{row.section}</td>
                  <td className="border border-slate-200 px-3 py-2">{row.netArea}</td>
                  <td className="border border-slate-200 px-3 py-2">{row.velocity}</td>
                  <td className="border border-slate-200 px-3 py-2">{row.density}</td>
                  <td className="border border-slate-200 px-3 py-2">{row.specificVolume}</td>
                  <td className="border border-slate-200 px-3 py-2">{row.pressureDrop}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ResultList({ title, rows }: { title: string; rows: { label: string; value: string }[] }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600">{title}</h4>
      <dl className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-1 gap-1 rounded-md border border-slate-200 p-2 sm:grid-cols-[1fr_auto]">
            <dt className="text-slate-600">{row.label}</dt>
            <dd className="font-medium text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
