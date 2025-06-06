import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, fullWidth = false, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col space-y-1", fullWidth ? "w-full" : "")}>
        {label && (
          <label 
            htmlFor={props.id || props.name} 
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          className={cn(
            "px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
            error && "border-red-500 focus:ring-red-500 focus:border-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';