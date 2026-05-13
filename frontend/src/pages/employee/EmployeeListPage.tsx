import { useEffect, useMemo, useRef, useState } from 'react';
import { getEmployees, createEmployee, updateEmployeeApi, deleteEmployeeApi } from '../../api/employeeApi';
import { getDepartments } from '../../api/masterApi';
import { getJobgrades } from '../../api/jobgradeApi';
import { getPositions } from '../../api/positionApi';
import type { Employee } from '../../types';
import SearchableSelect from '../../components/shared/SearchableSelect';
import { useAuthStore } from '../../store/authStore';
import { Role } from '../../types';
import { useI18n } from '../../i18n/i18n';

const EmployeeListPage = () => {
  const { t } = useI18n();
  const defaultPassword = 'passw0rd!';
  const isValidPassword = (value: string) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(value);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<any>({
    id: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    entryDate: '',
    leaveDate: '',
    empState: true,
    intraView: true,
    permission: 'ROLE_USER',
    deptno: undefined,
    jobno: undefined,
    postno: undefined,
  });
  const [deptOptions, setDeptOptions] = useState<{ value: number; label: string }[]>([]);
  const [jobOptions, setJobOptions] = useState<{ value: number; label: string }[]>([]);
  const [posOptions, setPosOptions] = useState<{ value: number; label: string }[]>([]);
  const { user } = useAuthStore();
  const isAdmin = user?.role === Role.ROLE_ADMIN || user?.role === Role.ROLE_SUPERADMIN;
  const idInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const entryDateInputRef = useRef<HTMLInputElement>(null);
  const roleLabel = (role?: string) => {
    if (role === 'ROLE_ADMIN') return t('employee.role.admin');
    if (role === 'ROLE_SUPERADMIN') return t('employee.role.superadmin');
    return t('employee.role.user');
  };

  useEffect(() => {
    load();
  }, [activeOnly]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, deptData, jobData, posData] = await Promise.all([
        getEmployees({ activeOnly }),
        getDepartments(),
        getJobgrades(),
        getPositions(),
      ]);
      setEmployees(data);
      setDeptOptions(deptData.map((d) => ({ value: d.deptno, label: d.deptName })));
      setJobOptions(jobData.map((j) => ({ value: j.jobno, label: j.jobName })));
      setPosOptions(posData
        .slice()
        .sort((a, b) => a.postno - b.postno)
        .map((p) => ({ value: p.postno, label: p.postName })));
    } catch (e: any) {
      setError(e?.response?.data?.message || t('employee.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.departmentName) set.add(e.departmentName);
    });
    return Array.from(set).sort();
  }, [employees]);

  const filtered = employees.filter((e) => {
    const byDept = deptFilter === 'all' || e.departmentName === deptFilter;
    const byRole = roleFilter === 'all' || e.permission === roleFilter;
    return byDept && byRole;
  });
  const visibleEmployees = filtered;

  const openCreate = () => {
    setEditing(null);
    setFormError(null);
    setForm({
      id: '',
      password: defaultPassword,
      name: '',
      email: '',
      phone: '',
      entryDate: '',
      leaveDate: '',
      empState: true,
      intraView: true,
      permission: 'ROLE_USER',
      deptno: undefined,
      jobno: undefined,
      postno: undefined,
    });
    setShowForm(true);
  };

  useEffect(() => {
    if (!showForm) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showForm]);

  const openEdit = (emp: Employee) => {
    if (!isAdmin && user?.id !== emp.id) {
      return;
    }
    setEditing(emp);
    setFormError(null);
    setForm({
      id: emp.id,
      password: '',
      name: emp.name,
      email: emp.email || '',
      phone: emp.phone || '',
      entryDate: emp.entryDate,
      leaveDate: emp.leaveDate || '',
      empState: emp.empState ?? true,
      intraView: emp.intraView ?? true,
      permission: emp.permission,
      deptno: emp.deptno ?? emp.department?.deptno,
      jobno: emp.jobno ?? emp.jobgrade?.jobno,
      postno: emp.postno ?? emp.position?.postno,
    });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.id?.trim()) {
      setFormError(t('employee.form.errorRequired', { field: t('employee.form.id') }));
      idInputRef.current?.focus();
      return;
    }
    if (!form.name?.trim()) {
      setFormError(t('employee.form.errorRequired', { field: t('employee.form.name') }));
      nameInputRef.current?.focus();
      return;
    }
    if (!form.entryDate) {
      setFormError(t('employee.form.errorRequired', { field: t('employee.form.entryDate') }));
      entryDateInputRef.current?.focus();
      return;
    }
    if (editing) {
      const password = form.password?.trim();
      if (password && !isValidPassword(password)) {
        setFormError(t('employee.form.errorPasswordPolicy'));
        passwordInputRef.current?.focus();
        return;
      }
      const payload: any = {
        name: form.name,
        ...(password ? { password } : {}),
        email: form.email,
        phone: form.phone,
        entryDate: form.entryDate,
        permission: form.permission,
        deptno: form.deptno,
        jobno: form.jobno,
        postno: form.postno,
        leaveDate: form.leaveDate || null,
        empState: form.empState,
        intraView: form.intraView,
      };
      await updateEmployeeApi(editing.empno, payload);
    } else {
      const password = form.password?.trim() || defaultPassword;
      if (!isValidPassword(password)) {
        setFormError(t('employee.form.errorPasswordPolicy'));
        passwordInputRef.current?.focus();
        return;
      }
      await createEmployee({
        id: form.id,
        password,
        name: form.name,
        email: form.email,
        phone: form.phone,
        entryDate: form.entryDate,
        leaveDate: form.leaveDate || null,
        empState: form.empState,
        intraView: form.intraView,
        permission: form.permission,
        deptno: form.deptno,
        jobno: form.jobno,
        postno: form.postno,
      });
    }
    setShowForm(false);
    await load();
  };

  const handleDelete = async (empno: number) => {
    const target = employees.find((e) => e.empno === empno);
    const name = target?.name || t('employee.table.name');
    if (!confirm(t('employee.confirmDelete', { name }))) return;
    await deleteEmployeeApi(empno);
    await load();
  };

  return (
    <div className="p-4 sm:p-6">
      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">{t('employee.title')}</h2>
          <p className="text-gray-600">{t('employee.subtitle')}</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 self-start sm:self-auto"
          >
            {t('employee.create')}
          </button>
        )}
      </div>

      <div className="bg-white rounded shadow p-4 mb-4 flex flex-col gap-3 sm:flex-row sm:gap-4 sm:items-end">
        <div className="w-full sm:w-64">
          <label className="text-sm text-gray-700 mb-1 block">{t('employee.filters.department')}</label>
          <SearchableSelect
            value={deptFilter === 'all' ? 0 : departments.indexOf(deptFilter) + 1}
            onChange={(val) => {
              if (val === 0) setDeptFilter('all');
              else setDeptFilter(departments[val - 1]);
            }}
            options={[
              { value: 0, label: t('employee.filters.all') },
              ...departments.map((d, idx) => ({ value: idx + 1, label: d })),
            ]}
          />
        </div>
        <div className="w-full sm:w-64">
          <label className="text-sm text-gray-700 mb-1 block">{t('employee.filters.role')}</label>
          <SearchableSelect
            value={
              roleFilter === 'all'
                ? 0
                : roleFilter === 'ROLE_USER'
                ? 1
                : roleFilter === 'ROLE_ADMIN'
                ? 2
                : 3
            }
            onChange={(val) => {
              if (val === 0) setRoleFilter('all');
              else if (val === 1) setRoleFilter('ROLE_USER');
              else if (val === 2) setRoleFilter('ROLE_ADMIN');
              else setRoleFilter('ROLE_SUPERADMIN');
            }}
            options={[
              { value: 0, label: t('employee.filters.all') },
              { value: 1, label: t('employee.role.user') },
              { value: 2, label: t('employee.role.admin') },
              { value: 3, label: t('employee.role.superadmin') },
            ]}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">{t('employee.filters.activeOnly')}</span>
        </label>
        <div className="ml-0 sm:ml-auto rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 self-start sm:self-auto">
          <span className="text-base font-semibold text-blue-600">{filtered.length}</span>
          <span className="ml-2">{t('schedule.total')}</span>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-600">{t('schedule.loading')}</div>
        ) : (
          <>
            <div className="sm:hidden divide-y divide-gray-100">
              {visibleEmployees.map((emp, index) => {
                const prevDept = index > 0 ? visibleEmployees[index - 1].departmentName : null;
                const showSeparator = index > 0 && prevDept !== emp.departmentName;
                const canEdit = isAdmin || user?.id === emp.id;
                return (
                  <div key={emp.empno}>
                    {showSeparator && (
                      <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">
                        {emp.departmentName || '-'}
                      </div>
                    )}
                    <div className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {emp.name} <span className="text-xs text-gray-500">#{emp.empno}</span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                            <span className="truncate">{t('employee.table.department')}: {emp.departmentName || '-'}</span>
                            <span className="truncate">{t('employee.table.jobgrade')}: {emp.jobgradeName || '-'}</span>
                            <span className="truncate">{t('employee.table.position')}: {emp.positionName || '-'}</span>
                            <span className="truncate">{t('employee.table.role')}: {roleLabel(emp.permission)}</span>
                            <span className="truncate">{t('employee.table.status')}: {emp.empState === false ? t('employee.status.inactive') : t('employee.status.active')}</span>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2">
                          {canEdit && (
                            <button
                              onClick={() => openEdit(emp)}
                              className="rounded border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                            >
                              {t('employee.action.edit')}
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(emp.empno)}
                              className="rounded border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                            >
                              {t('employee.action.delete')}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="truncate">{t('employee.table.entryDate')}: {emp.entryDate}</span>
                        <span className="truncate">{t('employee.table.leaveDate')}: {emp.leaveDate || '-'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  {t('employee.noResults')}
                </div>
              )}
            </div>

            <div className="hidden sm:block overflow-auto max-h-[600px]">
              <table className="min-w-[1100px] table-fixed divide-y divide-gray-200 text-sm whitespace-nowrap">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('employee.table.no')}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('employee.table.name')}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('employee.table.department')}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('employee.table.jobgrade')}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('employee.table.position')}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('employee.table.role')}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('employee.table.status')}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('employee.table.entryDate')}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('employee.table.leaveDate')}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('employee.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleEmployees.map((emp, index) => {
                    const prevDept = index > 0 ? visibleEmployees[index - 1].departmentName : null;
                    const showSeparator = index > 0 && prevDept !== emp.departmentName;
                    return (
                      <tr
                        key={emp.empno}
                        className={`hover:bg-gray-50 ${showSeparator ? 'border-t-4 border-gray-300' : ''}`}
                      >
                      <td className="px-4 py-3">{emp.empno}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{emp.name}</td>
                      <td className="px-4 py-3">{emp.departmentName || '-'}</td>
                      <td className="px-4 py-3">{emp.jobgradeName || '-'}</td>
                      <td className="px-4 py-3">{emp.positionName || '-'}</td>
                      <td className="px-4 py-3">{roleLabel(emp.permission)}</td>
                      <td className="px-4 py-3">{emp.empState === false ? t('employee.status.inactive') : t('employee.status.active')}</td>
                      <td className="px-4 py-3">{emp.entryDate}</td>
                      <td className="px-4 py-3">{emp.leaveDate || '-'}</td>
                      <td className="px-4 py-3 space-x-2">
                        {(isAdmin || user?.id === emp.id) ? (
                          <button
                            onClick={() => openEdit(emp)}
                            className="text-blue-600 hover:underline"
                          >
                            {t('employee.action.edit')}
                          </button>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(emp.empno)}
                            className="text-red-600 hover:underline"
                          >
                            {t('employee.action.delete')}
                          </button>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
                        {t('employee.noResults')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-stretch justify-center p-4 sm:items-center sm:p-6 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {editing ? t('employee.form.editTitle') : t('employee.form.createTitle')}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label={t('scheduleForm.close')}
              >
                X
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col px-4 pb-6 pt-4 sm:px-6">
              {formError && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  {formError}
                </div>
              )}
              <form
                className="grid flex-1 min-h-0 grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2"
                onSubmit={submit}
              >
              <div>
                <label className="text-sm text-gray-700">{t('employee.form.id')}</label>
                <input
                  type="text"
                  value={form.id}
                  onChange={(e) => setForm((p: any) => ({ ...p, id: e.target.value }))}
                  disabled={!!editing}
                  required
                  ref={idInputRef}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">
                  {editing ? t('employee.form.passwordOptional') : t('employee.form.password')}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p: any) => ({ ...p, password: e.target.value }))}
                  required={!editing}
                  ref={passwordInputRef}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">{t('employee.form.name')}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))}
                  required
                  ref={nameInputRef}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">{t('employee.form.entryDate')}</label>
                <input
                  type="date"
                  value={form.entryDate}
                  onChange={(e) => setForm((p: any) => ({ ...p, entryDate: e.target.value }))}
                  required
                  ref={entryDateInputRef}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">{t('employee.form.email')}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p: any) => ({ ...p, email: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">{t('employee.form.phone')}</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((p: any) => ({ ...p, phone: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700 block mb-1">{t('employee.form.permission')}</label>
                {isAdmin ? (
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'ROLE_USER', label: t('employee.role.user') },
                      { value: 'ROLE_ADMIN', label: t('employee.role.admin') },
                      { value: 'ROLE_SUPERADMIN', label: t('employee.role.superadmin') },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm((p: any) => ({ ...p, permission: opt.value }))}
                        className={`rounded border px-3 py-2 text-sm ${
                          form.permission === opt.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        aria-pressed={form.permission === opt.value}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    {roleLabel(form.permission)}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-700">{t('employee.form.department')}</label>
                <SearchableSelect
                  value={form.deptno ?? -1}
                  onChange={(val) => setForm((p: any) => ({ ...p, deptno: val === -1 ? undefined : val }))}
                  options={[{ value: -1, label: t('scheduleForm.selectNone') }, ...deptOptions]}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">{t('employee.form.jobgrade')}</label>
                <SearchableSelect
                  value={form.jobno ?? -1}
                  onChange={(val) => setForm((p: any) => ({ ...p, jobno: val === -1 ? undefined : val }))}
                  options={[{ value: -1, label: t('scheduleForm.selectNone') }, ...jobOptions]}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">{t('employee.form.position')}</label>
                <SearchableSelect
                  value={form.postno ?? -1}
                  onChange={(val) => setForm((p: any) => ({ ...p, postno: val === -1 ? undefined : val }))}
                  options={[{ value: -1, label: t('scheduleForm.selectNone') }, ...posOptions]}
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.empState ?? true}
                  onChange={(e) => setForm((p: any) => ({ ...p, empState: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{t('employee.form.active')}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.intraView ?? true}
                  onChange={(e) => setForm((p: any) => ({ ...p, intraView: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{t('employee.form.intraView')}</span>
              </label>
              <div>
                <label className="text-sm text-gray-700">{t('employee.form.leaveDate')}</label>
                <input
                  type="date"
                  value={form.leaveDate || ''}
                  onChange={(e) => setForm((p: any) => ({ ...p, leaveDate: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="col-span-1 sm:col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded">
                  {t('employee.form.cancel')}
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                  {t('employee.form.save')}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeListPage;

