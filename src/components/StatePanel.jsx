import Button from './Button';
import { FiAlertCircle, FiInbox } from 'react-icons/fi';

function LoadingIndicator() {
  return (
    <div className="relative h-8 w-8">
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400 animate-spin" />
      <div className="absolute inset-0 rounded-full border-2 border-gray-300 dark:border-gray-600" />
    </div>
  );
}

export default function StatePanel({
  variant = 'loading',
  title,
  description = '',
  actionLabel = '',
  onAction,
  className = '',
}) {
  const isLoading = variant === 'loading';
  const isError = variant === 'error';
  const iconClass = isError
    ? 'text-red-500 dark:text-red-400'
    : 'text-gray-400 dark:text-gray-500';

  return (
    <div className={`pv-panel p-8 text-center ${className}`}>
      <div className="flex justify-center mb-3">
        {isLoading ? <LoadingIndicator /> : (
          <span className={iconClass}>
            {isError ? <FiAlertCircle className="h-8 w-8" /> : <FiInbox className="h-8 w-8" />}
          </span>
        )}
      </div>
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      ) : null}
      {actionLabel && typeof onAction === 'function' ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  );
}
