export default function Button({
  children,
  onClick,
  type = 'button',
  className = '',
  variant = 'primary',
  disabled = false,
  icon = null,
}) {
  const baseClasses =
    'inline-flex items-center justify-center px-4 py-2 rounded transition-colors duration-300 font-medium focus:outline-none';

  const variants = {
    primary:
      'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600',
    secondary:
      'bg-green-300 text-green-800 hover:bg-green-400',
    danger:
      'bg-red-500 text-white hover:bg-red-600',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${disabled ? disabledClasses : ''} ${className}`}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
