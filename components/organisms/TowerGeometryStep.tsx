import { Input } from '@/components/atoms/Input';
import { StepHeader } from '@/components/molecules/StepHeader';
import { TowerGeometry } from '@/lib/types';

interface TowerGeometryStepProps {
  data: TowerGeometry;
  editable: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onChange: (value: Partial<TowerGeometry>) => void;
}

export function TowerGeometryStep({ data, editable, canEdit, onEdit, onChange }: TowerGeometryStepProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <StepHeader
        title="Tower Geometry"
        description="Step 3 is now unlocked. Detailed geometry inputs will be added next."
        canEdit={canEdit}
        onEdit={onEdit}
      />

      <Input
        id="towerGeometryNotes"
        label="Geometry Notes"
        placeholder="Optional notes for upcoming tower geometry inputs..."
        value={data.notes}
        onChange={(event) => onChange({ notes: event.target.value })}
        disabled={!editable}
      />
    </section>
  );
}
