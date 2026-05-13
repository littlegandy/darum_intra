import { useEffect, useMemo, useRef, useState } from 'react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  startLabel: string;
  endLabel: string;
  onChange: (startDate: string, endDate: string) => void;
  inputsClassName?: string;
  closeLabel: string;
  required?: boolean;
  startInputRef?: React.Ref<HTMLInputElement>;
  endInputRef?: React.Ref<HTMLInputElement>;
}

const toDate = (value: string | null | undefined) => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isSameDay = (a: Date | null, b: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isInRange = (day: Date, start: Date | null, end: Date | null) => {
  if (!start || !end) return false;
  const time = day.getTime();
  return time >= start.getTime() && time <= end.getTime();
};

const DateRangePicker = ({
  startDate,
  endDate,
  startLabel,
  endLabel,
  onChange,
  inputsClassName,
  closeLabel,
  required,
  startInputRef,
  endInputRef,
}: DateRangePickerProps) => {
  const [open, setOpen] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() => {
    const base = toDate(startDate) || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const startValue = useMemo(() => toDate(startDate), [startDate]);
  const endValue = useMemo(() => toDate(endDate), [endDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const days = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay();
    const last = new Date(year, month + 1, 0);
    const totalDays = last.getDate();
    const cells = Array.from({ length: startWeekday }, () => null as Date | null);
    for (let day = 1; day <= totalDays; day += 1) {
      cells.push(new Date(year, month, day));
    }
    return cells;
  }, [monthCursor]);

  const handleSelectDay = (day: Date) => {
    if (!startValue || (startValue && endValue)) {
      onChange(toIsoDate(day), '');
      return;
    }

    if (startValue && !endValue) {
      if (day.getTime() < startValue.getTime()) {
        onChange(toIsoDate(day), toIsoDate(startValue));
        setOpen(false);
      } else {
        onChange(startDate, toIsoDate(day));
        setOpen(false);
      }
    }
  };

  const monthLabel = monthCursor.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div ref={containerRef} className="relative">
      <div className={inputsClassName ?? 'grid gap-4 sm:grid-cols-2'}>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {startLabel}
            {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            readOnly
            value={startDate}
            onClick={() => setOpen(true)}
            ref={startInputRef}
            placeholder="YYYY-MM-DD"
            className="w-full cursor-pointer rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {endLabel}
            {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            readOnly
            value={endDate}
            onClick={() => setOpen(true)}
            ref={endInputRef}
            placeholder="YYYY-MM-DD"
            className="w-full cursor-pointer rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {open && (
        <div className="absolute left-1/2 top-full z-20 mt-2 w-[min(320px,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-4 shadow-lg sm:left-0 sm:w-[320px] sm:translate-x-0">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))
              }
              className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            >
              {'<'}
            </button>
            <div className="text-sm font-semibold text-gray-900">{monthLabel}</div>
            <button
              type="button"
              onClick={() =>
                setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))
              }
              className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            >
              {'>'}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} />;
              }
              const isStart = isSameDay(day, startValue);
              const isEnd = isSameDay(day, endValue);
              const inRange = isInRange(day, startValue, endValue);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-9 rounded text-sm transition ${
                    isStart || isEnd
                      ? 'bg-blue-600 text-white'
                      : inRange
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between text-xs text-gray-500">
            <span>{startDate || 'YYYY-MM-DD'}</span>
            <span>{endDate || 'YYYY-MM-DD'}</span>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              {closeLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;

