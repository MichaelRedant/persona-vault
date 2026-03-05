import Input from './Input';
import { useEffect, useRef } from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Search...', autoFocus = false }) {
  const inputRef = useRef();

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className="w-full">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
