import { PencilButton } from '@/components/atoms/PencilButton';

interface StepHeaderProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onToggle: () => void;
  canEdit: boolean;
  onEdit: () => void;
}

export function StepHeader({
  title,
  description,
  isOpen,
  onToggle,
  canEdit,
  onEdit
}: StepHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-8 items-center justify-center rounded-full border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          aria-expanded={isOpen}
        >
          {isOpen ? 'Collapse' : 'Expand'}
        </button>

        <PencilButton onClick={onEdit} disabled={!canEdit} />
      </div>
    </div>
  );
}
