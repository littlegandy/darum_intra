import { useEffect, useMemo, useRef, useState } from 'react';
import { Customer, Product, Support, getCustomers, getProducts, getSupports } from '../../api/masterApi';
import { CreateScheduleRequest, Schedule, UpdateScheduleRequest } from '../../types';
import { useAuthStore } from '../../store/authStore';
import SearchableSelect from '../shared/SearchableSelect';
import { useI18n } from '../../i18n/i18n';
import DateRangePicker from '../shared/DateRangePicker';

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateScheduleRequest | UpdateScheduleRequest) => Promise<void>;
  schedule?: Schedule;
  mode: 'create' | 'edit';
  defaultStartDate?: string;
  defaultEndDate?: string;
  onDelete?: (schedule: Schedule) => Promise<void>;
}

const getDefaultDateTimes = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0, 0);

  const toDate = (d: Date) => d.toISOString().split('T')[0];
  const toTime = (d: Date) => d.toTimeString().slice(0, 5);

  return {
    startDate: toDate(start),
    endDate: toDate(end),
    stime: toTime(start),
    etime: toTime(end),
  };
};

export default function ScheduleFormModal({
  isOpen,
  onClose,
  onSubmit,
  schedule,
  mode,
  defaultStartDate,
  defaultEndDate,
  onDelete,
}: ScheduleFormModalProps) {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const defaults = useMemo(() => getDefaultDateTimes(), []);
  const draftKey = useMemo(() => `scheduleFormDraft:${user?.empno ?? 'guest'}`, [user?.empno]);
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const contentsInputRef = useRef<HTMLTextAreaElement>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [supports, setSupports] = useState<Support[]>([]);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const leaveCustomerIds = useMemo(() => new Set([52, 53, 54]), []);
  const leaveProductIds = useMemo(() => new Set([43, 44, 45]), []);
  const restrictedSupportIds = useMemo(() => new Set([997, 998, 999]), []);

  const [formData, setFormData] = useState({
    empno: user?.empno || 0,
    custno: schedule?.custno || undefined,
    prodno: schedule?.prodno || undefined,
    suppno: schedule?.suppno || undefined,
    contents: schedule?.contents || '',
    location: schedule?.location || '',
    startDate: schedule?.workDate || defaultStartDate || defaults.startDate,
    endDate: schedule?.workDate || defaultEndDate || defaults.endDate,
    stime: schedule?.stime?.slice(0, 5) || defaults.stime,
    etime: schedule?.etime?.slice(0, 5) || defaults.etime,
    holiday: schedule?.holiday ?? true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [additionalDate, setAdditionalDate] = useState('');

  const timeOptions = useMemo(() => {
    const options: string[] = [];
    for (let hour = 0; hour < 24; hour += 1) {
      for (let minute = 0; minute < 60; minute += 10) {
        options.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
      }
    }
    options.push('24:00');
    return options;
  }, []);

  const isLeaveCustomer = leaveCustomerIds.has(formData.custno ?? 0);
  const isHalfLeaveProduct = formData.prodno === 44 || formData.prodno === 45;
  const isFullLeaveProduct = formData.prodno === 43;

  const productOptions = useMemo(() => {
    if (isLeaveCustomer) {
      return products.filter((product) => leaveProductIds.has(product.prodno));
    }
    return products.filter((product) => !leaveProductIds.has(product.prodno));
  }, [isLeaveCustomer, leaveProductIds, products]);

  const supportOptions = useMemo(() => {
    if (isLeaveCustomer) {
      if (isFullLeaveProduct) {
        return supports.filter((support) => support.suppno === 997 || support.suppno === 998);
      }
      if (isHalfLeaveProduct) {
        return supports.filter((support) => support.suppno === 997 || support.suppno === 999);
      }
      return [];
    }
    return supports.filter((support) => !restrictedSupportIds.has(support.suppno));
  }, [isLeaveCustomer, isFullLeaveProduct, isHalfLeaveProduct, supports, restrictedSupportIds]);

  useEffect(() => {
    if (!isOpen) return;

    if (isLeaveCustomer) {
      setFormData((prev) => ({
        ...prev,
        prodno: leaveProductIds.has(prev.prodno ?? -1)
          ? prev.prodno
          : productOptions[0]?.prodno,
        suppno: supportOptions.some((support) => support.suppno === (prev.suppno ?? -1))
          ? prev.suppno
          : supportOptions[0]?.suppno,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      prodno: leaveProductIds.has(prev.prodno ?? -1) ? undefined : prev.prodno,
      suppno: restrictedSupportIds.has(prev.suppno ?? -1) ? undefined : prev.suppno,
    }));
  }, [isLeaveCustomer, isOpen, leaveProductIds, productOptions, restrictedSupportIds, supportOptions]);

  useEffect(() => {
    if (isOpen) {
      loadMasterData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // 모달 닫힐 때 날짜 선택 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setSelectedDates([]);
      setAdditionalDate('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && schedule) {
      setFormData({
        empno: schedule.empno,
        custno: schedule.custno,
        prodno: schedule.prodno,
        suppno: schedule.suppno,
        contents: schedule.contents || '',
        location: schedule.location || '',
        startDate: schedule.workDate,
        endDate: schedule.workDate,
        stime: schedule.stime?.slice(0, 5) || defaults.stime,
        etime: schedule.etime?.slice(0, 5) || defaults.etime,
        holiday: schedule.holiday ?? true,
      });
    } else {
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setFormData({
            empno: user?.empno || 0,
            custno: parsed.custno,
            prodno: parsed.prodno,
            suppno: parsed.suppno,
            contents: parsed.contents || '',
            location: parsed.location || '',
            startDate: parsed.startDate || defaultStartDate || defaults.startDate,
            endDate: parsed.endDate || defaultEndDate || defaults.endDate,
            stime: parsed.stime?.slice(0, 5) || defaults.stime,
            etime: parsed.etime?.slice(0, 5) || defaults.etime,
            holiday: parsed.holiday ?? true,
          });
          return;
        } catch {
          localStorage.removeItem(draftKey);
        }
      }
      const freshDefaults = getDefaultDateTimes();
      setFormData({
        empno: user?.empno || 0,
        custno: undefined,
        prodno: undefined,
        suppno: undefined,
        contents: '',
        location: '',
        startDate: defaultStartDate || freshDefaults.startDate,
        endDate: defaultEndDate || freshDefaults.endDate,
        stime: freshDefaults.stime,
        etime: freshDefaults.etime,
        holiday: true,
      });
    }
  }, [isOpen, mode, schedule, user, defaults, defaultStartDate, defaultEndDate, draftKey]);

  useEffect(() => {
    if (!isOpen || mode !== 'create') return;
    const payload = {
      custno: formData.custno,
      prodno: formData.prodno,
      suppno: formData.suppno,
      contents: formData.contents,
      location: formData.location,
      startDate: formData.startDate,
      endDate: formData.endDate,
      stime: formData.stime,
      etime: formData.etime,
      holiday: formData.holiday,
    };
    localStorage.setItem(draftKey, JSON.stringify(payload));
  }, [draftKey, formData, isOpen, mode]);

  const loadMasterData = async () => {
    try {
      setLoadingMaster(true);
      const [customersData, productsData, supportsData] = await Promise.all([
        getCustomers(),
        getProducts(),
        getSupports(),
      ]);
      const priorityIds = [52, 53, 54];
      const sortedCustomers = customersData
        .slice()
        .sort((a, b) => {
          const aPriority = priorityIds.includes(a.custno) ? -1 : 0;
          const bPriority = priorityIds.includes(b.custno) ? -1 : 0;
          if (aPriority !== bPriority) return aPriority - bPriority;
          return a.custName.localeCompare(b.custName, 'ko', { sensitivity: 'base' });
        });
      setCustomers(sortedCustomers);
      setProducts(productsData);
      setSupports(supportsData);
    } catch (err) {
      console.error('Failed to load master data:', err);
    } finally {
      setLoadingMaster(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !formData.custno) return;
    const matched = customers.find((c) => c.custno === formData.custno);
    if (matched && matched.location && formData.location !== matched.location) {
      setFormData((prev) => ({ ...prev, location: matched.location! }));
    }
  }, [customers, formData.custno, formData.location, isOpen]);

  // 날짜 범위 생성 함수
  const generateDateRange = (start: string, end: string, includeWeekends: boolean): string[] => {
    const dates: string[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      if (includeWeekends || !isWeekend) {
        dates.push(d.toISOString().split('T')[0]);
      }
    }
    
    return dates;
  };

  // 범위 선택 핸들러
  const handleDateRangeChange = (start: string, end: string) => {
    setFormData(prev => ({ ...prev, startDate: start, endDate: end }));
    
    // 날짜 범위로부터 날짜 목록 자동 생성 (시작일과 종료일이 모두 있을 때만)
    if (start && end) {
      const dates = generateDateRange(start, end, formData.holiday ?? true);
      setSelectedDates(dates);
    }
  };

  // 주말 체크박스 변경 핸들러
  const handleHolidayChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, holiday: checked }));
    
    // 이미 선택된 범위가 있으면 칩 재생성
    if (formData.startDate && formData.endDate) {
      const dates = generateDateRange(formData.startDate, formData.endDate, checked);
      setSelectedDates(dates);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'holiday') {
        handleHolidayChange(checked);
      } else {
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else if (name === 'custno' || name === 'prodno' || name === 'suppno') {
      const numeric = value ? Number(value) : undefined;
      if (name === 'custno') {
        const matched = customers.find((c) => c.custno === numeric);
        setFormData((prev) => ({
          ...prev,
          [name]: numeric,
          location: matched?.location ?? prev.location,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: numeric,
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.startDate) {
      setError(t('scheduleForm.errorRequired', { field: t('scheduleForm.startDate') }));
      startInputRef.current?.click();
      return;
    }

    if (!formData.endDate) {
      setError(t('scheduleForm.errorRequired', { field: t('scheduleForm.endDate') }));
      endInputRef.current?.click();
      return;
    }

    if (!formData.custno) {
      setError(t('scheduleForm.errorRequired', { field: t('scheduleForm.customer') }));
      return;
    }

    if (!formData.prodno) {
      setError(t('scheduleForm.errorRequired', { field: t('scheduleForm.product') }));
      return;
    }

    if (!formData.suppno) {
      setError(t('scheduleForm.errorRequired', { field: t('scheduleForm.support') }));
      return;
    }

    if (!formData.location.trim()) {
      setError(t('scheduleForm.errorRequired', { field: t('scheduleForm.location') }));
      locationInputRef.current?.focus();
      return;
    }

    if (!formData.contents.trim()) {
      setError(t('scheduleForm.errorRequired', { field: t('scheduleForm.contents') }));
      contentsInputRef.current?.focus();
      return;
    }

    const normalizeDateTime = (dateStr: string, timeStr?: string) => {
      if (!timeStr || timeStr !== '24:00') {
        return { dateStr, timeStr };
      }
      const date = new Date(`${dateStr}T00:00:00`);
      date.setDate(date.getDate() + 1);
      const nextDate = date.toISOString().split('T')[0];
      return { dateStr: nextDate, timeStr: '00:00' };
    };

    const buildDateTime = (dateStr: string, timeStr?: string) => {
      const date = new Date(`${dateStr}T00:00:00`);
      if (!timeStr) return date;
      if (timeStr === '24:00') {
        date.setDate(date.getDate() + 1);
        return date;
      }
      const [hour, minute] = timeStr.split(':');
      date.setHours(Number(hour), Number(minute), 0, 0);
      return date;
    };

    if (formData.startDate && formData.endDate && formData.stime && formData.etime) {
      const start = buildDateTime(formData.startDate, formData.stime);
      const end = buildDateTime(formData.endDate, formData.etime);
      if (end <= start) {
        setError(t('scheduleForm.errorTime'));
        return;
      }
    }

    try {
      setSubmitting(true);

      const normalizedStart = normalizeDateTime(formData.startDate, formData.stime);
      const normalizedEnd = normalizeDateTime(formData.endDate, formData.etime);
      const payload = {
        ...formData,
        startDate: normalizedStart.dateStr,
        endDate: normalizedEnd.dateStr,
        stime: normalizedStart.timeStr,
        etime: normalizedEnd.timeStr,
      };

      if (mode === 'create') {
        await onSubmit(payload as CreateScheduleRequest);
        localStorage.removeItem(draftKey);
      } else {
        const { empno, ...updateData } = payload;
        await onSubmit(updateData as UpdateScheduleRequest);
      }

      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || t('scheduleForm.errorRequest'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/40 p-4 sm:items-center sm:p-6">
      <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-gray-500">
              {mode === 'create' ? t('scheduleForm.subtitleCreate') : t('scheduleForm.subtitleEdit')}
            </p>
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'create' ? t('scheduleForm.titleCreate') : t('scheduleForm.titleEdit')}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label={t('scheduleForm.close')}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-5 px-4 pb-6 pt-4 sm:px-6">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <DateRangePicker
              startDate={formData.startDate}
              endDate={formData.endDate}
              startLabel={t('scheduleForm.startDate')}
              endLabel={t('scheduleForm.endDate')}
              closeLabel={t('scheduleForm.close')}
              required
              startInputRef={startInputRef}
              endInputRef={endInputRef}
              onChange={handleDateRangeChange}
            />

            {selectedDates.length > 0 && (
              <div className="rounded border border-gray-200 bg-gray-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    선택된 날짜 ({selectedDates.length}개)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDates([])}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    전체 삭제
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {selectedDates.map(date => {
                    const dateObj = new Date(date);
                    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];
                    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                    
                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => setSelectedDates(prev => prev.filter(d => d !== date))}
                        className={`flex items-center gap-1 rounded px-2 py-1 text-sm transition ${
                          isWeekend
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        <span>{date.slice(5)} ({dayOfWeek})</span>
                        <span className="text-xs">×</span>
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  💡 날짜를 클릭하면 제거됩니다. 범위를 다시 선택하면 목록이 초기화됩니다.
                </div>
              </div>
            )}

            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
              <input
                type="checkbox"
                name="holiday"
                checked={formData.holiday}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{t('scheduleForm.weekendHoliday')}</span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('scheduleForm.startTime')}</label>
                <select
                  name="stime"
                  value={formData.stime}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('scheduleForm.endTime')}</label>
                <select
                  name="etime"
                  value={formData.etime}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{t('scheduleForm.customer')}</label>
                <SearchableSelect
                  value={formData.custno ?? 0}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, custno: val === 0 ? undefined : val }))
                  }
                  options={[
                    { value: 0, label: t('scheduleForm.selectNone') },
                    ...customers.map((customer) => ({
                      value: customer.custno,
                      label: customer.custName,
                    })),
                  ]}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{t('scheduleForm.product')}</label>
                <SearchableSelect
                  value={formData.prodno ?? 0}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, prodno: val === 0 ? undefined : val }))
                  }
                  options={[
                    { value: 0, label: t('scheduleForm.selectNone') },
                    ...productOptions.map((product) => ({
                      value: product.prodno,
                      label: product.prodName,
                    })),
                  ]}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{t('scheduleForm.support')}</label>
                <SearchableSelect
                  value={formData.suppno ?? 0}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, suppno: val === 0 ? undefined : val }))
                  }
                  options={[
                    { value: 0, label: t('scheduleForm.selectNone') },
                    ...supportOptions.map((support) => ({
                      value: support.suppno,
                      label: support.suppname,
                    })),
                  ]}
                />
              </div>
              {loadingMaster && (
                <div className="flex items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                  {t('scheduleForm.loadingMaster')}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('scheduleForm.location')}</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder={t('scheduleForm.locationPlaceholder')}
                ref={locationInputRef}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('scheduleForm.contents')}</label>
              <textarea
                name="contents"
                value={formData.contents}
                onChange={handleChange}
                rows={4}
                placeholder={t('scheduleForm.contentsPlaceholder')}
                ref={contentsInputRef}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="sticky bottom-0 left-0 right-0 flex flex-col gap-3 border-t border-gray-200 bg-white pb-2 pt-4">
            <div className="flex justify-end gap-3">
              {mode === 'edit' ? (
                <>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? t('scheduleForm.submitting') : t('scheduleForm.submitEdit')}
                  </button>
                  {schedule && onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(schedule)}
                      className="rounded border border-red-200 px-4 py-2 text-red-600 transition hover:bg-red-50"
                    >
                      {t('schedule.action.delete')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="rounded border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t('scheduleForm.cancel')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="rounded border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t('scheduleForm.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? t('scheduleForm.submitting') : t('scheduleForm.submitCreate')}
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
