import { Button } from '@/components/atoms/Button';

interface ReviewRunCalculationsStepProps {
  onRunCalculations?: () => void;
}

export function ReviewRunCalculationsStep({
  onRunCalculations
}: ReviewRunCalculationsStepProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Review &amp; Run Calculations
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        Everything looks consistent and complete. Run calculations now to generate
        your cooling tower performance results.
      </p>

      <div className="mt-5 flex justify-end">
        <Button onClick={onRunCalculations}>Run Calculations</Button>
      </div>
    </section>
  );
}
