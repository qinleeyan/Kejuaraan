'use client';

import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({
    label,
    name,
    value,
    onChange,
    options,
    error,
    hint,
    required = false,
    disabled = false,
    placeholder = 'Select an option',
  }, ref) => {
    const hasError = !!error;
    const selectId = `select-${name}`;

    return (
      <div className="w-full">
        <label
          htmlFor={selectId}
          className="block text-sm font-semibold text-foreground mb-2"
        >
          {label}
          {required && <span className="text-primary ml-1">*</span>}
        </label>

        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? `error-${name}` : hint ? `hint-${name}` : undefined}
          className={`w-full px-4 py-3 rounded-md border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer bg-input ${
            hasError
              ? 'border-primary bg-primary/5 text-foreground'
              : 'border-border text-foreground focus:border-primary'
          } ${disabled ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%234B5563' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem',
          }}
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <p
            id={`error-${name}`}
            className="text-primary text-sm font-medium mt-2 flex items-center gap-1"
            role="alert"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18.101 12.93a.75.75 0 000-1.06l-6.75-6.75a.75.75 0 00-1.06 0L3.22 11.87a.75.75 0 001.06 1.06L11 5.91l6.75 6.75a.75.75 0 001.06 0z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`hint-${name}`} className="text-muted-foreground text-xs mt-2">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';
