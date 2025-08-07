import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    value,
    onChange,
    type = 'text',
    placeholder = '',
    required = false,
    className = '',
    ...props
  },
  ref
) {
  return (
    <div className="flex flex-col space-y-1">
      {label && <label className="font-semibold text-sm">{label}</label>}
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 transition ${className}`}
        {...props}
      />
    </div>
  );
});

export default Input;
