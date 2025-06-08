export default function Textarea({
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  className = '',
  minHeight = '150px',
}) {
  return (
    <div className="flex flex-col space-y-1">
      {label && <label className="font-semibold text-sm">{label}</label>}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-vertical ${className}`}
        style={{ minHeight }}
      ></textarea>
    </div>
  );
}
