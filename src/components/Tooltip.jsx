import { useState } from 'react';

export default function Tooltip({ children, text }) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute z-10 w-max max-w-xs p-2 text-sm text-white bg-gray-900 rounded shadow-lg -translate-x-1/2 left-1/2 mt-2">
          {text}
        </div>
      )}
    </div>
  );
}
