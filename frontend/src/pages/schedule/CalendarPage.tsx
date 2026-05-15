import { useEffect, useMemo, useRef, useState } from 'react';
import { getMySchedules, updateSchedule, deleteScheduleWithGroup } from '../../api/scheduleApi';
import type { Schedule, UpdateScheduleRequest } from '../../types';
import ScheduleFormModal from '../../components/schedule/ScheduleFormModal';
import DeleteConfirmModal from '../../components/schedule/DeleteConfirmModal';
import { useAuthStore } from '../../store/authStore';
import { useI18n } from '../../i18n/i18n';
import { useToast } from '../../components/shared/ToastProvider';

type ViewMode = 'month' | 'week' | 'day';

const dayColorClass = (day: number) => {
  if (day === 0) return 'text-red-600';
  if (day === 6) return 'text-blue-600';
  return 'text-gray-800';
};

const getWeekNumberInMonth = (date: Date) => {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = startOfMonth.getDay();
  return Math.floor((date.getDate() + offset - 1) / 7) + 1;
};

const getLunarMonthDay = (date: Date) => {
  try {
    const formatter = new Intl.DateTimeFormat('ko-KR-u-ca-chinese', {
      month: 'numeric',
      day: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    const month = parts.find((p) => p.type === 'month')?.value;
    const day = parts.find((p) => p.type === 'day')?.value;
    if (!month || !day) return '';
    return `${month}/${day}`;
  } catch {
    return '';
  }
};

const CalendarPage = () => {
  const { t } = useI18n();
  const [view, setView] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Schedule | null>(null);
  const [holidayMap, setHolidayMap] = useState<Record<string, string>>({});
  const holidayCache = useRef<Record<number, Record<string, string>>>({});
  const { user } = useAuthStore();
  const { pushToast } = useToast();
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ schedule: Schedule; groupCount: number } | null>(null);

  const dayNames = useMemo(() => ([
    t('calendar.day.sun'),
    t('calendar.day.mon'),
    t('calendar.day.tue'),
    t('calendar.day.wed'),
    t('calendar.day.thu'),
    t('calendar.day.fri'),
    t('calendar.day.sat'),
  ]), [t]);

  useEffect(() => {
    loadSchedules();
  }, [currentDate, view]);

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });

  const formatYearMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const loadSchedules = async () => {
    setLoading(true);
    try {
      let start: Date;
      let end: Date;
      if (view === 'week') {
        start = startOfWeek(currentDate);
        end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
      } else if (view === 'day') {
        start = new Date(currentDate);
        end = new Date(currentDate);
      } else {
        start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      }
      const data = await getMySchedules(formatDate(start), formatDate(end));
      setSchedules(data);
    } finally {
      setLoading(false);
    }
  };

  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getRangeYears = () => {
    let start = new Date(currentDate);
    let end = new Date(currentDate);
    if (view === 'month') {
      start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    } else if (view === 'week') {
      start = startOfWeek(currentDate);
      end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
    }
    const years = new Set<number>();
    years.add(start.getFullYear());
    years.add(end.getFullYear());
    return Array.from(years);
  };

  const weekDates = useMemo(() => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [currentDate]);

  const todayKey = useMemo(() => formatDate(new Date()), []);

  const daySchedules = useMemo(() => {
    const dayKey = formatDate(currentDate);
    return schedules.filter((s) => s.workDate === dayKey);
  }, [schedules, currentDate]);

  const selectedDaySchedules = useMemo(
    () => (selectedDayKey ? schedules.filter((s) => s.workDate === selectedDayKey) : []),
    [selectedDayKey, schedules]
  );

  const weekSchedules = useMemo(() => {
    const keys = weekDates.map((d) => formatDate(d));
    return schedules.filter((s) => keys.includes(s.workDate));
  }, [schedules, weekDates]);

  const monthGrid = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const leading = start.getDay();
    const trailing = 6 - end.getDay();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < leading; i++) cells.push(null);
    for (let d = 1; d <= end.getDate(); d++) {
      cells.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), d));
    }
    for (let i = 0; i < trailing; i++) cells.push(null);
    return cells;
  }, [currentDate]);

  useEffect(() => {
    const years = getRangeYears();
    const cached: Record<string, string> = {};
    years.forEach((year) => {
      const yearCache = holidayCache.current[year];
      if (yearCache) {
        Object.assign(cached, yearCache);
      }
    });
    setHolidayMap(cached);

    years.forEach((year) => {
      if (holidayCache.current[year]) return;
      fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/KR`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data: Array<{ date: string; localName?: string; name?: string }>) => {
          const map: Record<string, string> = {};
          data.forEach((item) => {
            const label = item.localName || item.name;
            if (item.date && label) {
              map[item.date] = label;
            }
          });
          holidayCache.current[year] = map;
          setHolidayMap((prev) => ({ ...prev, ...map }));
        })
        .catch(() => {
          holidayCache.current[year] = {};
        });
    });
  }, [currentDate, view]);

  const goPrev = () => {
    if (view === 'month') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    else if (view === 'week') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    else setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1));
  };

  const goNext = () => {
    if (view === 'month') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    else if (view === 'week') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    else setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1));
  };

  const canEdit = (s: Schedule) => user?.empno === s.empno;

  const handleClickSchedule = (s: Schedule) => {
    if (!canEdit(s)) return;
    setSelected(s);
    setModalOpen(true);
  };

  const handleDelete = (schedule: Schedule) => {
    const groupCount = schedules.filter(s => {
      const key = s.startNo && s.startNo !== 0 ? s.startNo : s.no;
      const targetKey = schedule.startNo && schedule.startNo !== 0 ? schedule.startNo : schedule.no;
      return key === targetKey;
    }).length;

    if (groupCount > 1) {
      setDeleteTarget({ schedule, groupCount });
      setShowDeleteModal(true);
    } else {
      doDelete(schedule, false);
    }
  };

  const doDelete = async (schedule: Schedule, deleteGroup: boolean) => {
    try {
      await deleteScheduleWithGroup(schedule.no, deleteGroup);
      pushToast(deleteGroup ? t('schedule.alert.deletedGroup') : t('schedule.alert.deleted'), 'success');
      loadSchedules();
      return true;
    } catch (err: any) {
      pushToast(err.response?.data?.message || t('schedule.error.load'), 'error');
      return false;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('calendar.title')}</h1>
        <div className="flex gap-2">
          <button onClick={() => setView('month')} className={`px-3 py-1 rounded ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{t('calendar.view.month')}</button>
          <button onClick={() => setView('week')} className={`px-3 py-1 rounded ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{t('calendar.view.week')}</button>
          <button onClick={() => setView('day')} className={`px-3 py-1 rounded ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{t('calendar.view.day')}</button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <button onClick={goPrev} className="rounded border bg-white px-3 py-1">{t('calendar.prev')}</button>
        <div className="text-lg font-semibold">
          {view === 'day' ? formatDate(currentDate) : formatYearMonth(currentDate)}
          {view === 'week' && ` (${t('calendar.weekLabel', { num: getWeekNumberInMonth(currentDate) })})`}
        </div>
        <button onClick={goNext} className="rounded border bg-white px-3 py-1">{t('calendar.next')}</button>
      </div>

      {loading && <div className="rounded bg-white p-6 text-center shadow">{t('calendar.loading')}</div>}

      {!loading && view === 'month' && (
        <div className="overflow-hidden rounded bg-white shadow">
          <div className="grid grid-cols-7 bg-gray-50 text-center text-sm font-semibold text-gray-700">
            {dayNames.map((d, idx) => (
              <div key={d} className={`border-b py-2 ${dayColorClass(idx)}`}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthGrid.map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} className="h-24 border-r border-b bg-gray-50" />;
              const day = date.getDay();
              const dayKey = formatDate(date);
              const items = schedules.filter((s) => s.workDate === dayKey);
              const holidayName = holidayMap[dayKey];
              const dayClass = holidayName ? 'text-red-600' : dayColorClass(day);
              const lunarLabel = getLunarMonthDay(date);
              const isToday = dayKey === todayKey;
              const isSelected = selectedDayKey === dayKey;
              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => setSelectedDayKey(dayKey)}
                  className={`h-24 border-r border-b p-2 text-left transition ${
                    isToday ? 'border-2 border-red-400' : ''
                  } ${isSelected ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-1 text-sm font-semibold ${dayClass}`}>
                      <span>{date.getDate()}</span>
                      {holidayName && (
                        <span className="text-[10px] font-medium text-red-500 truncate">
                          {holidayName}
                        </span>
                      )}
                    </div>
                    {lunarLabel && (
                      <span className="text-[10px] font-medium text-gray-500">{lunarLabel}</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-700">
                    {items.length > 0 ? (
                      <>
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-700">{items.length}</span>
                        <span className="truncate">{t('calendar.scheduleDefault')}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">{t('calendar.noSchedule')}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!loading && view === 'week' && (
        <div className="rounded bg-white p-4 shadow">
          <div className="mb-3 text-sm font-semibold text-gray-700">
            {t('calendar.weekLabel', { num: getWeekNumberInMonth(currentDate) })}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date) => {
              const dayKey = formatDate(date);
              const day = date.getDay();
              const items = weekSchedules.filter((s) => s.workDate === dayKey);
              const holidayName = holidayMap[dayKey];
              const dayClass = holidayName ? 'text-red-600' : dayColorClass(day);
              const isToday = dayKey === todayKey;
              const isSelected = selectedDayKey === dayKey;
              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => setSelectedDayKey(dayKey)}
                  className={`h-28 overflow-hidden rounded border p-2 text-left sm:h-48 ${
                    isToday ? 'border-2 border-red-400' : ''
                  } ${isSelected ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-sm font-semibold ${dayClass}`}>
                    {formatDate(date)} ({dayNames[day]})
                  </div>
                  {holidayName && (
                    <div className="text-[11px] font-medium text-red-500 truncate">{holidayName}</div>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-700">
                    {items.length > 0 ? (
                      <>
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-700">{items.length}</span>
                        <span className="truncate">{t('calendar.scheduleDefault')}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">{t('calendar.noSchedule')}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!loading && view === 'day' && (
        <div className="space-y-3 rounded bg-white p-4 shadow">
          <div className={`text-lg font-semibold ${holidayMap[formatDate(currentDate)] ? 'text-red-600' : dayColorClass(currentDate.getDay())}`}>
            {formatDate(currentDate)} ({dayNames[currentDate.getDay()]})
            {holidayMap[formatDate(currentDate)] && (
              <span className="ml-2 text-sm font-semibold text-red-600">
                {holidayMap[formatDate(currentDate)]}
              </span>
            )}
          </div>
          {daySchedules.length === 0 && <div className="text-gray-500">{t('calendar.noSchedule')}</div>}
          {daySchedules
            .slice()
            .sort((a, b) => (a.stime || '').localeCompare(b.stime || ''))
            .map((s) => (
              <button
                key={s.no}
                type="button"
                onClick={() => handleClickSchedule(s)}
                className="flex w-full items-start gap-3 rounded border px-4 py-3 text-left hover:bg-gray-50"
              >
                <div className="text-sm font-semibold text-gray-800">
                  {s.stime ? s.stime.substring(0, 5) : t('calendar.timeUnset')}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">{s.contents || t('calendar.scheduleDefault')}</div>
                  <div className="flex gap-3 text-xs text-gray-600">
                    {s.customerName && <span>{t('schedule.table.customer')}: {s.customerName}</span>}
                    {s.location && <span>{t('schedule.table.location')}: {s.location}</span>}
                    {s.productName && <span>{t('scheduleForm.product')}: {s.productName}</span>}
                  </div>
                </div>
              </button>
            ))}
        </div>
      )}

      {modalOpen && selected && (
        <ScheduleFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          schedule={selected}
          mode="edit"
          onSubmit={async (data: UpdateScheduleRequest) => {
            await updateSchedule(selected.no, data);
            setModalOpen(false);
            loadSchedules();
          }}
          onDelete={async (schedule) => {
            handleDelete(schedule);
            setModalOpen(false);
          }}
        />
      )}

      {selectedDayKey && view !== 'day' && (
        <div className="mt-6 rounded bg-white p-4 shadow">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">
              {selectedDayKey}
            </div>
            <div className="text-xs text-gray-500">
              {t('schedule.total')}: <span className="font-semibold text-blue-600">{selectedDaySchedules.length}</span>
            </div>
          </div>
          {selectedDaySchedules.length === 0 ? (
            <div className="text-sm text-gray-500">{t('calendar.noSchedule')}</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {selectedDaySchedules
                .slice()
                .sort((a, b) => (a.stime || '').localeCompare(b.stime || ''))
                .map((s) => (
                  <button
                    key={s.no}
                    type="button"
                    onClick={() => handleClickSchedule(s)}
                    className="flex w-full items-center justify-between py-2 text-left hover:bg-gray-50"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">
                        {s.contents || s.customerName || t('calendar.scheduleDefault')}
                      </span>
                      <span className="text-xs text-gray-600">
                        {s.stime?.substring(0, 5)}{s.etime ? ` - ${s.etime.substring(0, 5)}` : ''} · {s.location || '-'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{s.customerName || ''}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        groupCount={deleteTarget?.groupCount ?? 0}
        onDeleteSingle={() => {
          if (deleteTarget) {
            setShowDeleteModal(false);
            doDelete(deleteTarget.schedule, false);
          }
        }}
        onDeleteAll={() => {
          if (deleteTarget) {
            setShowDeleteModal(false);
            doDelete(deleteTarget.schedule, true);
          }
        }}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};

export default CalendarPage;
