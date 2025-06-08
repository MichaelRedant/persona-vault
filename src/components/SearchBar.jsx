import Input from './Input';
import { useEffect, useRef } from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="mb-4">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
