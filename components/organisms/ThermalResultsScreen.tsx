'use client';

import { useState } from 'react';
import {
  CoolingTowerPerformanceResults,
  PressureDropRow
} from '@/lib/calculations';
import { Button } from '@/components/atoms/Button';

interface ThermalResultsScreenProps {
  results: CoolingTowerPerformanceResults;
  onBack: () => void;
}

function fmt(value?: number, digits = 2): string {
  if (value === undefined || Number.isNaN(value)) return '';
  return value.toFixed(digits);
}

function PressureRow({ row }: { row: PressureDropRow }) {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-2 text-slate-700">{row.name}</td>
      <td className="py-2">{fmt(row.netArea, 1)}</td>
      <td className="py-2">{fmt(row.velocity, 2)}</td>
      <td className="py-2">{fmt(row.density, 3)}</td>
      <td className="py-2">{fmt(row.specificVolume, 3)}</td>
      <td className="py-2 font-medium">{fmt(row.pressureDrop, 2)}</td>
    </tr>
  );
}

export function ThermalResultsScreen({ results, onBack }: ThermalResultsScreenProps) {
  const [activeTab, setActiveTab] = useState<'thermal' | 'pressure'>('thermal');
  const { thermalResults, pressureDrop } = results;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button
            className={activeTab === 'thermal' ? '' : 'opacity-70'}
            onClick={() => setActiveTab('thermal')}
          >
            Thermal Results
          </Button>
          <Button
            variant="secondary"
            className={activeTab === 'pressure' ? '' : 'opacity-70'}
            onClick={() => setActiveTab('pressure')}
          >
            Pressure Drop/Air Flow Results
          </Button>
        </div>

        <Button variant="secondary" onClick={onBack}>Back to Inputs</Button>
      </div>

      {activeTab === 'thermal' ? (
        <div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-slate-300 p-3 text-lg font-semibold text-slate-900">
              Power: {fmt(thermalResults.power, 2)} kW
            </div>
            <div className="rounded-md border border-slate-300 p-3 text-lg font-semibold text-slate-900">
              Fill Velocity: {fmt(thermalResults.fillVelocity, 2)} m/sec
            </div>
          </div>

          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border border-slate-300 bg-slate-50 text-base text-slate-900">
                    <th className="p-2">KaV/L Data</th>
                    <th className="p-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border border-slate-200"><td className="p-2">Spray Zone</td><td className="p-2">{fmt(thermalResults.KaVL.spray, 3)}</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">CF-1900SB – 1,220 mm</td><td className="p-2">{fmt(thermalResults.KaVL.fill, 3)}</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">Fill Total</td><td className="p-2">{fmt(thermalResults.KaVL.fillTotal, 3)}</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">Rain Zone</td><td className="p-2">{fmt(thermalResults.KaVL.rain, 3)}</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">Total KaV/L (CTI)</td><td className="p-2">{fmt(thermalResults.KaVL.total, 3)}</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">KaV/L Derate(%)</td><td className="p-2">{fmt(thermalResults.KaVL.derate, 2)}</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">HWT Corr. (%)</td><td className="p-2">{fmt(thermalResults.KaVL.hwtCorrection, 2)}</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">KaV/L Adjusted</td><td className="p-2">{fmt(thermalResults.KaVL.adjusted, 3)}</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">L/G Ratio</td><td className="p-2">{fmt(thermalResults.KaVL.lgRatio, 3)}</td></tr>
                </tbody>
              </table>
            </div>

            <div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border border-slate-300 bg-slate-50 text-base text-slate-900">
                    <th className="p-2">Misc. Data</th>
                    <th className="p-2">Value</th>
                    <th className="p-2">Units</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border border-slate-200"><td className="p-2">Water Loading</td><td className="p-2">{fmt(thermalResults.misc.waterLoading, 2)}</td><td className="p-2">m3/hr-m2</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">Pressure Ratio</td><td className="p-2">{fmt(thermalResults.misc.pressureRatio, 2)}</td><td className="p-2" /></tr>
                  <tr className="border border-slate-200"><td className="p-2">L/G * KaV/L</td><td className="p-2">{fmt(thermalResults.misc.lgKaVL, 2)}</td><td className="p-2" /></tr>
                  <tr className="border border-slate-200"><td className="p-2">Fan: Box Ratio</td><td className="p-2">{fmt(thermalResults.misc.fanBoxRatio, 1)}</td><td className="p-2">%</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">Fan Coverage</td><td className="p-2">{fmt(thermalResults.misc.fanCoverage, 1)}</td><td className="p-2">%</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">Airflow @ Fan</td><td className="p-2">{fmt(thermalResults.misc.airflowAtFan, 2)}</td><td className="p-2">m3/s/cell</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">Effective Fan Eff.</td><td className="p-2">{fmt(thermalResults.misc.effectiveFanEff, 2)}</td><td className="p-2">%</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">Dry Air Rate</td><td className="p-2">{fmt(thermalResults.misc.dryAirRate, 1)}</td><td className="p-2">kg/s/cell</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">Total Fill Ht.</td><td className="p-2">{fmt(thermalResults.misc.totalFillHeight, 2)}</td><td className="p-2">m</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">Fill Area</td><td className="p-2">{fmt(thermalResults.misc.fillArea, 1)}</td><td className="p-2">m2/cell</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">Evaporation Rate</td><td className="p-2">{fmt(thermalResults.misc.evaporationRatePct, 2)}</td><td className="p-2">%</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">Evaporation Rate</td><td className="p-2">{fmt(thermalResults.misc.evaporationRateM3Hr, 1)}</td><td className="p-2">m3/hr (tower)</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">Inlet DBT</td><td className="p-2">{fmt(thermalResults.misc.inletDBT, 1)}</td><td className="p-2">°C</td></tr>
                  <tr className="border border-slate-200"><td className="p-2">Exit WBT</td><td className="p-2">{fmt(thermalResults.misc.exitWBT, 1)}</td><td className="p-2">°C</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="mb-3 text-base font-semibold text-slate-900">Pressure Drop/Air Flow Results</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border border-slate-300 bg-slate-50 text-base text-slate-900">
                <th className="p-2">Tower Section</th>
                <th className="p-2">Net Area</th>
                <th className="p-2">Velocity</th>
                <th className="p-2">Density</th>
                <th className="p-2">Sp. Vol.</th>
                <th className="p-2">Pres. Drop</th>
              </tr>
              <tr className="border border-slate-200 text-slate-700">
                <th className="p-2 font-normal" />
                <th className="p-2 font-normal">Tower-m2</th>
                <th className="p-2 font-normal">m/sec</th>
                <th className="p-2 font-normal">kg/m3</th>
                <th className="p-2 font-normal">m3/kg</th>
                <th className="p-2 font-normal">Pa</th>
              </tr>
            </thead>
            <tbody>
              {pressureDrop.rows.map((row) => (
                <PressureRow key={row.name} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
