import { Button } from '@/components/atoms/Button';
import { TextArea } from '@/components/atoms/TextArea';
import { StepHeader } from '@/components/molecules/StepHeader';
import { ThermalConditions } from '@/lib/types';

interface ThermalConditionsStepProps {
  data: ThermalConditions;
  editable: boolean;
  onChange: (value: Partial<ThermalConditions>) => void;
  onCalculate: () => void;
  onEdit: () => void;
  canEdit: boolean;
}

export function ThermalConditionsStep({
  data,
  editable,
  onChange,
  onCalculate,
  onEdit,
  canEdit
}: ThermalConditionsStepProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <StepHeader
        title="Thermal Conditions"
        description="Step 2 skeleton. The detailed thermal input fields will be added in the next iteration."
        canEdit={canEdit}
        onEdit={onEdit}
      />

      <TextArea
        id="thermalNotes"
        label="Notes"
        placeholder="Optional notes for upcoming thermal inputs..."
        value={data.notes}
        onChange={(event) => onChange({ notes: event.target.value })}
        disabled={!editable}
      />

      {editable ? (
        <div className="mt-5 flex justify-end">
          <Button variant="secondary" onClick={onCalculate}>
            Calculate
          </Button>
        </div>
      ) : null}
    </section>
  );
}
