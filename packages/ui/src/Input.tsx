import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, required, className = '', id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-caption-1 text-gray-700 font-medium"
        >
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
          {!required && (
            <span className="text-gray-400 ml-1 font-normal">(선택)</span>
          )}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        className={`
          h-12 px-4 rounded-md bg-gray-100 text-body-1 text-gray-900
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white
          ${error ? 'ring-2 ring-error' : ''}
          ${className}
        `}
        {...rest}
      />
      {error ? (
        <p className="text-caption-2 text-error">{error}</p>
      ) : hint ? (
        <p className="text-caption-2 text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
});
