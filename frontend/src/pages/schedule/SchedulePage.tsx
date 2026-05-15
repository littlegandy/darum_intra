import { useState, useEffect } from 'react';
import {
  getMySchedules,
  createSchedule,
  updateSchedule,
  deleteScheduleWithGroup,
} from '../../api/scheduleApi';
import type { Schedule, CreateScheduleRequest, UpdateScheduleRequest } from '../../types';
import ScheduleFormModal from '../../components/schedule/ScheduleFormModal';
import { useI18n } from '../../i18n/i18n';
import DateRangePicker from '../../components/shared/DateRangePicker';
import { useToast } from '../../components/shared/ToastProvider';

export default function SchedulePage() {
  const { t } = useI18n();
  const { pushToast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [startDate, setStartDate] = useState(toLocalDateString(firstDay));
  const [endDate, setEndDate] = useState(toLocalDateString(lastDay));

  const formatWorkDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00`);
    const dayIndex = date.getDay();
    const dayLabel = ['\uC77C', '\uC6D4', '\uD654', '\uC218', '\uBAA9', '\uAE08', '\uD1A0'][dayIndex] ?? '';
    const colorClass = dayIndex === 0 ? 'text-red-600' : dayIndex === 6 ? 'text-blue-600' : 'text-gray-900';
    return { label: `${dateStr} (${dayLabel})`, colorClass };
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedIds(new Set()); // 체크 상태 초기화
      const data = await getMySchedules(startDate, endDate);
      const sorted = [...data].sort((a, b) => {
        if (a.workDate === b.workDate) {
          const aTime = a.stime || '';
          const bTime = b.stime || '';
          return bTime.localeCompare(aTime);
        }
        return b.workDate.localeCompare(a.workDate);
      });
      setSchedules(sorted);
    } catch (err: any) {
      setError(err.response?.data?.message || t('schedule.error.load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!startDate || !endDate) {
      return;
    }
    loadSchedules();
  }, [startDate, endDate]);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedSchedule(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setModalMode('edit');
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleDelete = async (schedule: Schedule) => {
    const startNo = schedule.startNo ?? 0;
    const deleteGroup = startNo > 0;
    const confirmed = confirm(
      deleteGroup ? t('schedule.confirm.deleteGroup') : t('schedule.confirm.deleteSingle')
    );

    if (!confirmed) {
      return false;
    }

    try {
      await deleteScheduleWithGroup(schedule.no, deleteGroup);
      pushToast(deleteGroup ? t('schedule.alert.deletedGroup') : t('schedule.alert.deleted'), 'success');
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(schedule.no);
        return next;
      });
      loadSchedules();
      return true;
    } catch (err: any) {
      pushToast(err.response?.data?.message || t('schedule.error.load'), 'error');
      return false;
    }
  };

  const handleFormSubmit = async (
    data: CreateScheduleRequest | UpdateScheduleRequest
  ) => {
    if (modalMode === 'create') {
      await createSchedule(data as CreateScheduleRequest);
      pushToast(t('schedule.alert.created'), 'success');
    } else {
      await updateSchedule(selectedSchedule!.no, data as UpdateScheduleRequest);
      pushToast(t('schedule.alert.updated'), 'success');
    }
    loadSchedules();
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('schedule.title')}</h1>
          <p className="mt-1 text-gray-600">{t('schedule.subtitle')}</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('schedule.new')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            startLabel={t('schedule.startDate')}
            endLabel={t('schedule.endDate')}
            closeLabel={t('scheduleForm.close')}
            inputsClassName="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
            onChange={(nextStart, nextEnd) => {
              setStartDate(nextStart);
              setEndDate(nextEnd);
            }}
          />
          <div className="ml-0 flex items-end gap-3 sm:ml-auto">
            {!loading && (
              <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                <span className="text-base font-semibold text-blue-600">{schedules.length}</span>
                <span className="ml-2">{t('schedule.total')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="text-gray-600">{t('schedule.loading')}</div>
        </div>
      )}

      {!loading && schedules.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">{t('schedule.empty')}</p>
        </div>
      )}

      {!loading && schedules.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-100 sm:hidden">
            {schedules.map((schedule) => (
              <div
                key={schedule.no}
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => handleEdit(schedule)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {(() => {
                      const { label, colorClass } = formatWorkDate(schedule.workDate);
                      return <div className={`text-sm font-semibold ${colorClass}`}>{label}</div>;
                    })()}
                    <div className="mt-1 text-sm text-gray-900 truncate">
                      {schedule.contents || '-'}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                      <span className="truncate">
                        {t('schedule.table.time')}: {schedule.stime?.substring(0, 5) || '-'}
                        {schedule.etime ? ` - ${schedule.etime.substring(0, 5)}` : ''}
                      </span>
                      <span className="truncate">{t('schedule.table.customer')}: {schedule.customerName || '-'}</span>
                      <span className="truncate">{t('schedule.table.product')}: {schedule.productName || '-'}</span>
                      <span className="truncate">{t('schedule.table.location')}: {schedule.location || '-'}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDelete(schedule);
                      }}
                      className="rounded border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                    >
                      {t('schedule.action.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[1120px] table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-28 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('schedule.table.date')}
                  </th>
                  <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('schedule.table.time')}
                  </th>
                  <th className="w-36 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('schedule.table.customer')}
                  </th>
                  <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('schedule.table.product')}
                  </th>
                  <th className="w-72 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('schedule.table.contents')}
                  </th>
                  <th className="w-36 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('schedule.table.location')}
                  </th>
                  <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('schedule.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr
                    key={schedule.no}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEdit(schedule)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(() => {
                        const { label, colorClass } = formatWorkDate(schedule.workDate);
                        return <span className={colorClass}>{label}</span>;
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.stime && schedule.etime
                        ? `${schedule.stime.substring(0, 5)} - ${schedule.etime.substring(0, 5)}`
                        : schedule.stime
                        ? schedule.stime.substring(0, 5)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.customerName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.productName || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 truncate whitespace-nowrap">
                      {schedule.contents || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDelete(schedule);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t('schedule.action.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ScheduleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        onDelete={async (schedule) => {
          const deleted = await handleDelete(schedule);
          if (deleted) {
            setIsModalOpen(false);
          }
        }}
        schedule={selectedSchedule}
        mode={modalMode}
      />
    </div>
  );
}

