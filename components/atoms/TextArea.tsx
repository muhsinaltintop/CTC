import { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function TextArea({ label, id, ...props }: TextAreaProps) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700" htmlFor={id}>
      <span>{label}</span>
      <textarea
        id={id}
        className="min-h-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-100"
        {...props}
      />
    </label>
  );
}
