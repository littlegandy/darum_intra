import { useState, useEffect, useRef } from 'react';
import {
  getAllSchedules,
  getDepartmentSchedulesByDate,
  updateSchedule,
  createSchedule,
  deleteScheduleWithGroup,
} from '../../api/scheduleApi';
import { getActiveDepartments, Department } from '../../api/masterApi';
import type { Schedule, UpdateScheduleRequest, CreateScheduleRequest, Employee } from '../../types';
import SearchableSelect from '../../components/shared/SearchableSelect';
import ScheduleFormModal from '../../components/schedule/ScheduleFormModal';
import DeleteConfirmModal from '../../components/schedule/DeleteConfirmModal';
import { useAuthStore } from '../../store/authStore';
import { getEmployees } from '../../api/employeeApi';
import { useI18n } from '../../i18n/i18n';
import { useToast } from '../../components/shared/ToastProvider';

export default function DepartmentSchedulePage() {
  const { t } = useI18n();
  const { pushToast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptno, setSelectedDeptno] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('edit');
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);

  const toLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(
    toLocalDateString(new Date())
  );

  const goToPrevDay = () => {
    const d = new Date(`${selectedDate}T00:00:00`);
    d.setDate(d.getDate() - 1);
    setSelectedDate(toLocalDateString(d));
  };

  const goToNextDay = () => {
    const d = new Date(`${selectedDate}T00:00:00`);
    d.setDate(d.getDate() + 1);
    setSelectedDate(toLocalDateString(d));
  };

  const [contentModal, setContentModal] = useState<{ open: boolean; schedule: Schedule | null }>({ open: false, schedule: null });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Schedule | undefined>();
  const requestIdRef = useRef(0);

  useEffect(() => {
    loadDepartments();
    loadEmployees();
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [selectedDeptno, selectedDate]);

  const loadDepartments = async () => {
    try {
      const data = await getActiveDepartments();
      setDepartments(data);
      setSelectedDeptno(null);
    } catch (err: any) {
      setError(err.response?.data?.message || t('deptSchedule.error'));
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await getEmployees({ activeOnly: true });
      const filtered = data.filter((e) => (e.empState ?? true) && (e.intraView ?? true));
      setEmployees(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSchedules = async () => {
    const currentId = ++requestIdRef.current;
    try {
      setLoading(true);
      setError(null);
      const data = selectedDeptno === null
        ? await getAllSchedules(selectedDate, selectedDate)
        : await getDepartmentSchedulesByDate(selectedDeptno, selectedDate);
      if (currentId !== requestIdRef.current) return;
      setSchedules(data);
    } catch (err: any) {
      if (currentId !== requestIdRef.current) return;
      setError(err.response?.data?.message || t('deptSchedule.error'));
    } finally {
      if (currentId !== requestIdRef.current) return;
      setLoading(false);
    }
  };

  const schedulesByDepartment = schedules.reduce((acc, schedule) => {
    const deptKey = schedule.deptno || -1;
    if (!acc[deptKey]) {
      acc[deptKey] = [];
    }
    acc[deptKey].push(schedule);
    return acc;
  }, {} as Record<number, Schedule[]>);

  const visibleDepartments = departments.filter((dept) =>
    employees.some((e) => e.deptno === dept.deptno)
  );

  const filteredDepartments = (selectedDeptno
    ? visibleDepartments.filter((d) => d.deptno === selectedDeptno)
    : visibleDepartments
  );

  const openCreateModal = () => {
    setSelectedSchedule(null);
    setModalMode('create');
    setModalOpen(true);
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

  const handleDelete = async (schedule: Schedule) => {
    const groupCount = schedule.groupCount ?? 1;

    if (groupCount > 1) {
      setDeleteTarget(schedule);
      setShowDeleteModal(true);
      return false;
    } else {
      if (confirm(t('schedule.confirm.deleteSingle'))) {
        return await doDelete(schedule, false);
      }
      return false;
    }
  };

  const toMinutes = (time?: string | null) => {
    if (!time) return Number.MAX_SAFE_INTEGER;
    const [hour, minute] = time.substring(0, 5).split(':');
    return Number(hour) * 60 + Number(minute);
  };

  const compareSchedules = (a: Schedule, b: Schedule) => {
    const startA = toMinutes(a.stime);
    const startB = toMinutes(b.stime);
    if (startA !== startB) return startA - startB;
    const endA = toMinutes(a.etime);
    const endB = toMinutes(b.etime);
    if (endA !== endB) return endA - endB;
    return (a.no ?? 0) - (b.no ?? 0);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('deptSchedule.title')}</h1>
          <p className="mt-1 text-gray-600">{t('deptSchedule.subtitle')}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('schedule.new')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <div className="max-w-full min-w-0 sm:max-w-none">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('deptSchedule.filter.department')}
            </label>
            <SearchableSelect
              value={selectedDeptno ?? 0}
              onChange={(value) => setSelectedDeptno(value === 0 ? null : value)}
              options={[
                { value: 0, label: t('employee.filters.all') },
                ...visibleDepartments.map((dept) => ({ value: dept.deptno, label: dept.deptName })),
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('deptSchedule.filter.date')}
            </label>
            <div className="flex items-center gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={goToPrevDay}
                className="shrink-0 rounded border border-gray-300 px-2 py-2 text-gray-600 hover:bg-gray-100"
                aria-label="이전 날"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 min-w-0 border border-gray-300 rounded px-3 py-2 sm:w-auto"
              />
              <button
                type="button"
                onClick={goToNextDay}
                className="shrink-0 rounded border border-gray-300 px-2 py-2 text-gray-600 hover:bg-gray-100"
                aria-label="다음 날"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="ml-auto flex items-end gap-3" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="text-gray-600">{t('deptSchedule.loading')}</div>
        </div>
      )}

      {!loading && schedules.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">{t('deptSchedule.empty')}</p>
        </div>
      )}

      {!loading && filteredDepartments.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          {t('deptSchedule.noDepartment')}
        </div>
      )}

      {!loading && filteredDepartments.length > 0 && (
        <div className="space-y-6">
          {filteredDepartments.map((dept) => {
            const deptEmployees = employees.filter((e) => e.deptno === dept.deptno);
            const deptSchedules = schedulesByDepartment[dept.deptno ?? -1] || [];
            return (
              <div key={dept.deptno} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900">
                  {dept.deptName}
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ({deptSchedules.length}/{deptEmployees.length})
                  </span>
                </div>
                <div className="sm:hidden divide-y divide-gray-100">
                  {deptEmployees.map((emp) => {
                    const empSchedules = deptSchedules
                      .filter((s) => s.empno === emp.empno)
                      .slice()
                      .sort(compareSchedules);
                    const isCurrentUser = user?.empno === emp.empno;
                    return (
                      <div key={`${dept.deptno}-${emp.empno}`} className={isCurrentUser ? 'bg-blue-50' : ''}>
                        <div className="flex items-baseline justify-between gap-2 px-4 py-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{emp.name}</div>
                            <div className="text-xs text-gray-500 truncate">{emp.jobgradeName || '-'}</div>
                          </div>
                          {isCurrentUser && (
                            <button
                              type="button"
                              onClick={openCreateModal}
                              className="shrink-0 rounded border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700"
                            >
                              {t('schedule.new')}
                            </button>
                          )}
                        </div>
                        {empSchedules.length === 0 ? (
                          <div className="px-4 pb-4 text-sm text-gray-500">
                            {isCurrentUser ? (
                              <button
                                type="button"
                                onClick={openCreateModal}
                                className="text-red-600 underline decoration-dashed underline-offset-4"
                              >
                                {t('deptSchedule.noSchedule')}
                              </button>
                            ) : (
                              t('deptSchedule.noSchedule')
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2 px-4 pb-4">
                            {empSchedules.map((s) => (
                              <button
                                key={s.no}
                                type="button"
                                onClick={() => {
                                  if (isCurrentUser) {
                                    setSelectedSchedule(s);
                                    setModalMode('edit');
                                    setModalOpen(true);
                                  } else {
                                    setContentModal({ open: true, schedule: s });
                                  }
                                }}
                                className={`w-full rounded border px-3 py-2 text-left ${
                                  isCurrentUser ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-gray-900 truncate">
                                      {s.contents || '-'}
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                                      <span className="truncate">{t('schedule.table.customer')}: {s.customerName || '-'}</span>
                                      <span className="truncate">{t('schedule.table.product')}: {s.productName || '-'}</span>
                                      <span className="truncate">{t('schedule.table.location')}: {s.location || '-'}</span>
                                    </div>
                                  </div>
                                  <div className="shrink-0 text-xs font-semibold text-gray-700">
                                    {s.stime && s.etime
                                      ? `${s.stime.substring(0, 5)} - ${s.etime.substring(0, 5)}`
                                      : s.stime
                                      ? s.stime.substring(0, 5)
                                      : t('deptSchedule.timeUnset')}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full min-w-[960px] table-fixed divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="sticky left-0 z-10 w-40 bg-gray-50 px-4 py-3 text-center text-xs font-semibold text-gray-600">
                          {t('deptSchedule.table.nameJob')}
                        </th>
                        <th className="w-32 px-4 py-3 text-center text-xs font-semibold text-gray-600">
                          {t('schedule.table.customer')}
                        </th>
                        <th className="w-28 px-4 py-3 text-center text-xs font-semibold text-gray-600">
                          {t('schedule.table.product')}
                        </th>
                        <th className="w-56 px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          {t('deptSchedule.table.contents')}
                        </th>
                        <th className="w-32 px-4 py-3 text-center text-xs font-semibold text-gray-600">
                          {t('schedule.table.location')}
                        </th>
                        <th className="w-28 px-4 py-3 text-center text-xs font-semibold text-gray-600">
                          {t('deptSchedule.table.time')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {deptEmployees.length === 0 && (
                        <tr>
                          <td className="sticky left-0 z-0 bg-white px-4 py-3 text-center text-sm text-gray-900 align-top">-</td>
                          <td colSpan={5} className="px-4 py-3 text-center text-sm text-red-600 italic">
                            {t('deptSchedule.noSchedule')}
                          </td>
                        </tr>
                      )}
                      {deptEmployees.map((emp) => {
                        const empSchedules = deptSchedules
                          .filter((s) => s.empno === emp.empno)
                          .slice()
                          .sort(compareSchedules);
                        const rowClass = user?.empno === emp.empno ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50';

                        if (empSchedules.length === 0) {
                          const isCurrentUser = user?.empno === emp.empno;
                          return (
                            <tr key={`${dept.deptno}-${emp.empno}-empty`} className={rowClass}>
                              <td className="sticky left-0 z-0 w-40 bg-white px-4 py-3 text-center text-sm text-gray-900 align-top">
                                <div className="flex items-baseline gap-2 justify-center">
                                  <span className="font-semibold">{emp.name}</span>
                                  <span className="text-xs text-gray-500 whitespace-nowrap">{emp.jobgradeName || '-'}</span>
                                </div>
                              </td>
                              <td colSpan={5} className="px-4 py-3 text-center text-sm text-red-600 italic">
                                {isCurrentUser ? (
                                  <button
                                    type="button"
                                    onClick={openCreateModal}
                                    className="underline decoration-dashed underline-offset-4"
                                  >
                                    {t('deptSchedule.noSchedule')}
                                  </button>
                                ) : (
                                  t('deptSchedule.noSchedule')
                                )}
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={`${dept.deptno}-${emp.empno}`} className={rowClass}>
                            <td className="sticky left-0 z-0 w-40 bg-white px-4 py-3 text-center text-sm text-gray-900 align-top">
                              <div className="flex items-baseline gap-2 justify-center">
                                <span className="font-semibold">{emp.name}</span>
                                <span className="text-xs text-gray-500 whitespace-nowrap">{emp.jobgradeName || '-'}</span>
                              </div>
                            </td>
                            <td className="w-32 px-4 py-0 text-center text-sm text-gray-900 align-top">
                              <div className="divide-y divide-gray-100">
                                {empSchedules.map((s) => (
                                  <div
                                    key={s.no}
                                    className="truncate whitespace-nowrap py-3 text-center text-sm text-gray-900"
                                    title={s.customerName || '-'}
                                  >
                                    {s.customerName || '-'}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="w-28 px-4 py-0 text-center text-sm text-gray-900 align-top">
                              <div className="divide-y divide-gray-100">
                                {empSchedules.map((s) => (
                                  <div
                                    key={s.no}
                                    className="truncate whitespace-nowrap py-3 text-center text-sm text-gray-900"
                                    title={s.productName || '-'}
                                  >
                                    {s.productName || '-'}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="w-56 px-4 py-0 text-sm text-gray-900 align-top">
                              <div className="divide-y divide-gray-100">
                                {empSchedules.map((s) => (
                                  <div
                                    key={s.no}
                                    className="cursor-pointer truncate whitespace-nowrap py-3 hover:font-semibold"
                                    onClick={() => {
                                      if (user?.empno === s.empno) {
                                        setSelectedSchedule(s);
                                        setModalMode('edit');
                                        setModalOpen(true);
                                      } else {
                                        setContentModal({ open: true, schedule: s });
                                      }
                                    }}
                                  >
                                    {s.contents || '-'}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="w-32 px-4 py-0 text-center text-sm text-gray-900 align-top">
                              <div className="divide-y divide-gray-100">
                                {empSchedules.map((s) => (
                                  <div
                                    key={s.no}
                                    title={s.location || '-'}
                                    className="truncate whitespace-nowrap py-3 text-center text-sm text-gray-900"
                                  >
                                    {s.location || '-'}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="w-28 px-4 py-0 text-center text-sm text-gray-900 align-top">
                              <div className="divide-y divide-gray-100">
                                {empSchedules.map((s) => (
                                  <div key={s.no} className="py-3 text-center">
                                    <span>
                                      {s.stime && s.etime
                                        ? `${s.stime.substring(0, 5)} - ${s.etime.substring(0, 5)}`
                                        : s.stime
                                        ? s.stime.substring(0, 5)
                                        : t('deptSchedule.timeUnset')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {contentModal.open && contentModal.schedule && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setContentModal({ open: false, schedule: null })}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <p className="text-xs text-gray-500">{contentModal.schedule.employeeName}</p>
                <p className="font-semibold text-gray-900">{contentModal.schedule.workDate}</p>
              </div>
              <button
                onClick={() => setContentModal({ open: false, schedule: null })}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 px-5 py-4 text-sm text-gray-700">
              <div>
                <span className="text-xs font-medium text-gray-400">{t('schedule.table.customer')}</span>
                <p className="mt-0.5">{contentModal.schedule.customerName || '-'}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-400">{t('schedule.table.product')}</span>
                <p className="mt-0.5">{contentModal.schedule.productName || '-'}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-400">{t('schedule.table.location')}</span>
                <p className="mt-0.5">{contentModal.schedule.location || '-'}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-400">{t('scheduleForm.contents')}</span>
                <p className="mt-0.5 whitespace-pre-wrap">{contentModal.schedule.contents || '-'}</p>
              </div>
              {contentModal.schedule.stime && contentModal.schedule.etime && (
                <div>
                  <span className="text-xs font-medium text-gray-400">{t('scheduleForm.startTime')} - {t('scheduleForm.endTime')}</span>
                  <p className="mt-0.5">{contentModal.schedule.stime.substring(0, 5)} - {contentModal.schedule.etime.substring(0, 5)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        groupCount={deleteTarget?.groupCount ?? 1}
        onDeleteSingle={() => {
          if (deleteTarget) {
            setShowDeleteModal(false);
            void doDelete(deleteTarget, false);
          }
        }}
        onDeleteAll={() => {
          if (deleteTarget) {
            setShowDeleteModal(false);
            void doDelete(deleteTarget, true);
          }
        }}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteTarget(undefined);
        }}
      />

      {modalOpen && (
        <ScheduleFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={async (data: CreateScheduleRequest | UpdateScheduleRequest) => {
            if (modalMode === 'create') {
              await createSchedule(data as CreateScheduleRequest);
              pushToast(t('schedule.alert.created'), 'success');
            } else if (selectedSchedule) {
              await updateSchedule(selectedSchedule.no, data as UpdateScheduleRequest);
              pushToast(t('schedule.alert.updated'), 'success');
            }
            setModalOpen(false);
            loadSchedules();
          }}
          onDelete={async (schedule) => {
            setModalOpen(false);
            await handleDelete(schedule);
          }}
          schedule={selectedSchedule ?? undefined}
          mode={modalMode}
          defaultStartDate={selectedDate}
          defaultEndDate={selectedDate}
        />
      )}
    </div>
  );
}
