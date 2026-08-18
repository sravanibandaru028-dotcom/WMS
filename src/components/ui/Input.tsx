import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div>
        {label && <label htmlFor={inputId} className="label-base">{label}</label>}
        <input ref={ref} id={inputId} className={cn('input-base', error && 'border-error-400 focus:border-error-500 focus:ring-error-500/20', className)} {...props} />
        {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
        {error && <p className="mt-1 text-xs text-error-600">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div>
        {label && <label htmlFor={selectId} className="label-base">{label}</label>}
        <select ref={ref} id={selectId} className={cn('input-base cursor-pointer', className)} {...props}>
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-error-600">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const taId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div>
        {label && <label htmlFor={taId} className="label-base">{label}</label>}
        <textarea ref={ref} id={taId} className={cn('input-base resize-none', className)} {...props} />
        {error && <p className="mt-1 text-xs text-error-600">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
