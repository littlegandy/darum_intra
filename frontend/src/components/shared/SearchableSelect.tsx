import { useEffect, useMemo, useRef, useState } from 'react';

interface Option {
  value: number;
  label: string;
}

interface Props {
  value: number;
  options: Option[];
  onChange: (value: number) => void;
  placeholder?: string;
  minWidth?: string;
  disabled?: boolean;
}

const SearchableSelect = ({
  value,
  options,
  onChange,
  placeholder = 'Select',
  minWidth,
  disabled = false,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase()));
  }, [options, query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={containerRef} style={minWidth ? { minWidth } : undefined}>
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => !prev);
        }}
        disabled={disabled}
        className={`w-full min-w-0 h-10 rounded border px-3 text-left flex items-center justify-between ${
          disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <span className={`min-w-0 flex-1 truncate ${selected ? 'text-gray-900' : 'text-gray-400'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded border border-gray-200 bg-white shadow-lg">
          <div className="p-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="max-h-56 overflow-auto">
            {filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setQuery('');
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                  value === opt.value ? 'bg-blue-100 text-blue-700' : 'text-gray-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">No results.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
