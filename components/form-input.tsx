'use client';

import React from 'react';

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  step?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    hint,
    required = false,
    disabled = false,
    inputMode,
    ...rest
  }, ref) => {
    const hasError = !!error;
    const inputId = `input-${name}`;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-foreground mb-2"
        >
          {label}
          {required && <span className="text-primary ml-1">*</span>}
        </label>

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          inputMode={inputMode}
          aria-invalid={hasError}
          aria-describedby={hasError ? `error-${name}` : hint ? `hint-${name}` : undefined}
          className={`w-full px-4 py-3 rounded-md border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            hasError
              ? 'border-primary bg-primary/5 text-foreground'
              : 'border-border bg-input text-foreground focus:border-primary'
          } ${disabled ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}`}
          {...rest}
        />

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

FormInput.displayName = 'FormInput';
