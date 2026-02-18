interface PencilButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function PencilButton({ onClick, disabled = false }: PencilButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      onClick={onClick}
      disabled={disabled}
      aria-label="Edit step"
      title="Edit"
    >
      ✎
    </button>
  );
}
