export default function Button({
  children,
  onClick,
  type = 'button',
  className = '',
  variant = 'primary',
  disabled = false,
  icon = null,
  ...rest
}) {
  const baseClasses =
    'inline-flex items-center justify-center px-4 py-2 rounded-[var(--pv-radius-md)] transition-colors duration-200 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';

  const variants = {
    primary:
      'bg-[var(--pv-accent)] text-white shadow-[var(--pv-shadow-sm)] hover:bg-[var(--pv-accent-strong)]',
    secondary:
      'bg-[var(--pv-surface-muted)] text-[var(--pv-text)] border border-[var(--pv-border)] hover:bg-[var(--pv-surface)]',
    success:
      'bg-emerald-500 text-white shadow-[var(--pv-shadow-sm)] hover:bg-emerald-600',
    danger:
      'bg-red-500 text-white hover:bg-red-600',
    outline:
      'border border-[var(--pv-border)] text-[var(--pv-text)] bg-transparent hover:bg-[var(--pv-surface-muted)]',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${
        disabled ? disabledClasses : ''
      } ${className}`}
      disabled={disabled}
      {...rest}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
