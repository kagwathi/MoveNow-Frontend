'use client';

import { useState } from 'react';
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

// Base Input Component
export function Input({
  label,
  error,
  helperText,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2 border text-gray-700 placeholder:text-gray-300 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          error && 'border-red-300 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

// Password Input Component
export function PasswordInput({
  label = 'Password',
  error,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className={cn(
            'w-full px-3 py-2 pr-10 border text-gray-700 placeholder:text-gray-300 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            error && 'border-red-300 focus:ring-red-500',
            className
          )}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <EyeIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}

// Select Component
export function Select({
  label,
  options = [],
  error,
  helperText,
  required = false,
  placeholder = 'Select an option',
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={cn(
          'w-full px-3 py-2 text-gray-700 placeholder:text-gray-300 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          error && 'border-red-300 focus:ring-red-500',
          className
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

// Textarea Component
export function Textarea({
  label,
  error,
  helperText,
  required = false,
  rows = 4,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={cn(
          'w-full px-3 py-2 text-gray-700 placeholder:text-gray-300 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none',
          error && 'border-red-300 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

// Checkbox Component
export function Checkbox({
  label,
  description,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-start">
        <input
          type="checkbox"
          className={cn(
            'mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500',
            error && 'border-red-300',
            className
          )}
          {...props}
        />
        <div className="ml-3">
          {label && (
            <label className="text-sm font-medium text-gray-700">{label}</label>
          )}
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}

// Radio Group Component
export function RadioGroup({
  label,
  options = [],
  error,
  name,
  value,
  onChange,
  required = false,
  className = '',
}) {
  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className={cn('space-y-2', className)}>
        {options.map((option) => (
          <div key={option.value} className="flex items-start">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className={cn(
                'mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500',
                error && 'border-red-300'
              )}
            />
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                {option.label}
              </label>
              {option.description && (
                <p className="text-sm text-gray-500">{option.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}

// Default export for backward compatibility
const FormInput = {
  Input,
  PasswordInput,
  Select,
  Textarea,
  Checkbox,
  RadioGroup,
};

export default FormInput;
