import { PencilButton } from '@/components/atoms/PencilButton';

interface StepHeaderProps {
  title: string;
  description?: string;
  canEdit: boolean;
  onEdit: () => void;
}

export function StepHeader({ title, description, canEdit, onEdit }: StepHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>
      <PencilButton onClick={onEdit} disabled={!canEdit} />
    </div>
  );
}
