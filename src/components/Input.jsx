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
        className={`p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${className}`}
      />
    </div>
  );
});

export default Input;
