import { useEffect, useState } from 'react';
import {
  getDepartments,
  getCustomers,
  getProducts,
  getSupports,
  createDepartment,
  createCustomer,
  createProduct,
  createSupport,
  updateDepartment,
  updateCustomer,
  updateProduct,
  updateSupport,
  deleteDepartment,
  deleteCustomer,
  deleteProduct,
  deleteSupport,
  Department,
  Customer,
  Product,
  Support,
} from '../../api/masterApi';
import {
  getJobgrades,
  createJobgradeApi,
  updateJobgradeApi,
  deleteJobgradeApi,
  Jobgrade,
} from '../../api/jobgradeApi';
import {
  getPositions,
  createPositionApi,
  updatePositionApi,
  deletePositionApi,
  Position,
} from '../../api/positionApi';
import { getEmployees } from '../../api/employeeApi';
import type { Employee } from '../../types';
import { useI18n } from '../../i18n/i18n';

type Tab = 'departments' | 'jobgrades' | 'positions' | 'customers' | 'products' | 'supports';

const AdminMasterPage = () => {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [supports, setSupports] = useState<Support[]>([]);
  const [jobgrades, setJobgrades] = useState<Jobgrade[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [employeeCounts, setEmployeeCounts] = useState<Record<number, number>>({});
  const [jobCounts, setJobCounts] = useState<Record<number, number>>({});
  const [positionCounts, setPositionCounts] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [form, setForm] = useState({
    deptName: '',
    deptRank: '',
    custName: '',
    darumSales: '',
    custLocation: '',
    prodName: '',
    prodState: true,
    supportName: '',
    jobName: '',
    postName: '',
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptData, custData, prodData, suppData, jobData, posData, employees] = await Promise.all([
        getDepartments(),
        getCustomers(),
        getProducts(),
        getSupports(),
        getJobgrades(),
        getPositions(),
        getEmployees({ activeOnly: true }),
      ]);

      setDepartments(deptData);
      setCustomers([...custData].sort((a, b) => a.custName.localeCompare(b.custName)));
      setProducts(prodData);
      setSupports(suppData);
      setJobgrades(jobData);
      setPositions(posData.sort((a, b) => a.postno - b.postno));

      const deptCounts = employees.reduce((acc, emp: Employee) => {
        const key = emp.deptno ?? emp.department?.deptno;
        if (key !== undefined && key !== null) acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      const jCounts = employees.reduce((acc, emp: Employee) => {
        const key = emp.jobno ?? emp.jobgrade?.jobno;
        if (key !== undefined && key !== null) acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      const pCounts = employees.reduce((acc, emp: Employee) => {
        const key = emp.postno ?? emp.position?.postno;
        if (key !== undefined && key !== null) acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      setEmployeeCounts(deptCounts);
      setJobCounts(jCounts);
      setPositionCounts(pCounts);
    } catch (e: any) {
      setError(e?.response?.data?.message || t('master.error'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      deptName: '',
      deptRank: '',
      custName: '',
      darumSales: '',
      custLocation: '',
      prodName: '',
      prodState: true,
      supportName: '',
      jobName: '',
      postName: '',
    });
  };

  useEffect(() => {
    if (!showForm) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [showForm]);

  const handleCloseForm = () => {
    setShowForm(false);
    setFormMode('create');
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'departments') {
      if (editingId !== null) {
        await updateDepartment(editingId, { deptName: form.deptName, deptRank: form.deptRank ? Number(form.deptRank) : undefined });
      } else {
        await createDepartment({ deptName: form.deptName, deptRank: form.deptRank ? Number(form.deptRank) : undefined });
      }
    } else if (tab === 'customers') {
      const payload = { custName: form.custName, darumSales: form.darumSales, location: form.custLocation };
      if (editingId !== null) await updateCustomer(editingId, payload);
      else await createCustomer(payload);
    } else if (tab === 'products') {
      const payload = { prodName: form.prodName, prodState: form.prodState, vacation: false };
      if (editingId !== null) await updateProduct(editingId, payload);
      else await createProduct(payload);
    } else if (tab === 'supports') {
      const payload = { suppname: form.supportName, vacation: false };
      if (editingId !== null) await updateSupport(editingId, payload);
      else await createSupport(payload);
    } else if (tab === 'jobgrades') {
      const payload = { jobName: form.jobName };
      if (editingId !== null) await updateJobgradeApi(editingId, payload);
      else await createJobgradeApi(payload);
    } else if (tab === 'positions') {
      const payload = { postName: form.postName };
      if (editingId !== null) await updatePositionApi(editingId, payload);
      else await createPositionApi(payload);
    }
    resetForm();
    setShowForm(false);
    await loadAll();
  };

  const onEdit = (id: number, name: string, extra?: any) => {
    setEditingId(id);
    setFormMode('edit');
    if (tab === 'departments') {
      setForm((p) => ({ ...p, deptName: name, deptRank: extra?.deptRank ?? '' }));
    } else if (tab === 'customers') {
      setForm((p) => ({ ...p, custName: name, darumSales: extra?.darumSales || '', custLocation: extra?.location || '' }));
    } else if (tab === 'products') {
      setForm((p) => ({ ...p, prodName: name, prodState: extra?.prodState ?? true }));
    } else if (tab === 'supports') {
      setForm((p) => ({ ...p, supportName: name }));
    } else if (tab === 'jobgrades') {
      setForm((p) => ({ ...p, jobName: name }));
    } else if (tab === 'positions') {
      setForm((p) => ({ ...p, postName: name }));
    }
    setShowForm(true);
  };

  const onDelete = async (id: number, name?: string) => {
    const targetName = name || t('master.table.name');
    if (!confirm(t('master.confirmDelete', { name: targetName }))) return;
    if (tab === 'departments') await deleteDepartment(id);
    else if (tab === 'customers') await deleteCustomer(id);
    else if (tab === 'products') await deleteProduct(id);
    else if (tab === 'supports') await deleteSupport(id);
    else if (tab === 'jobgrades') await deleteJobgradeApi(id);
    else if (tab === 'positions') await deletePositionApi(id);
    if (editingId === id) resetForm();
    await loadAll();
  };

  const tabLabel = (key: Tab) => {
    switch (key) {
      case 'departments':
        return t('master.tab.departments');
      case 'jobgrades':
        return t('master.tab.jobgrades');
      case 'positions':
        return t('master.tab.positions');
      case 'customers':
        return t('master.tab.customers');
      case 'products':
        return t('master.tab.products');
      case 'supports':
        return t('master.tab.supports');
      default:
        return '';
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('master.title')}</h1>
          <p className="text-gray-600 mt-1">{t('master.subtitle')}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <div className="flex flex-wrap gap-2">
            {(['departments', 'jobgrades', 'positions', 'customers', 'products', 'supports'] as Tab[]).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setTab(key);
                  resetForm();
                }}
                className={`px-3 py-1 rounded ${tab === key ? 'bg-blue-600 text-white' : 'bg-white border'}`}
              >
                {tabLabel(key)}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              resetForm();
              setFormMode('create');
              setShowForm(true);
            }}
            className="rounded bg-blue-600 px-3 py-2 text-white sm:px-3 sm:py-1"
          >
            {t('master.form.create')}
          </button>
        </div>
      </div>

      {loading && <div className="bg-white p-4 rounded shadow">{t('master.loading')}</div>}

      {!loading && (
        <div className="bg-white rounded shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">{t('master.list.title')}</h2>
              <span className="text-sm text-gray-600">
                {t('master.list.count', { count: (() => {
                  switch (tab) {
                    case 'departments':
                      return departments.length;
                    case 'jobgrades':
                      return jobgrades.length;
                    case 'positions':
                      return positions.length;
                    case 'customers':
                      return customers.length;
                    case 'products':
                      return products.length;
                    case 'supports':
                      return supports.length;
                    default:
                      return 0;
                  }
                })() })}
              </span>
            </div>

            <div className="sm:hidden divide-y divide-gray-100">
              {tab === 'departments' &&
                departments.map((d) => (
                  <div key={d.deptno} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {d.deptName} <span className="text-xs text-gray-500">#{d.deptno}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                          <span className="truncate">{t('master.table.rank')}: {d.deptRank ?? '-'}</span>
                          <span className="truncate">{t('master.table.employeeCount')}: {employeeCounts[d.deptno] ?? 0}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <button
                          type="button"
                          className="rounded border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                          onClick={() => onEdit(d.deptno, d.deptName, { deptRank: d.deptRank })}
                        >
                          {t('master.action.edit')}
                        </button>
                        <button
                          type="button"
                          className="rounded border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                          onClick={() => onDelete(d.deptno, d.deptName)}
                        >
                          {t('master.action.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {tab === 'customers' &&
                customers.map((c) => (
                  <div key={c.custno} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {c.custName} <span className="text-xs text-gray-500">#{c.custno}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                          <span className="truncate">{t('master.form.sales')}: {c.darumSales || '-'}</span>
                          <span className="truncate">{t('master.form.location')}: {c.location || '-'}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <button
                          type="button"
                          className="rounded border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                          onClick={() => onEdit(c.custno, c.custName, c)}
                        >
                          {t('master.action.edit')}
                        </button>
                        <button
                          type="button"
                          className="rounded border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                          onClick={() => onDelete(c.custno, c.custName)}
                        >
                          {t('master.action.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {tab === 'products' &&
                products.map((p) => (
                  <div key={p.prodno} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {p.prodName} <span className="text-xs text-gray-500">#{p.prodno}</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          {t('employee.table.status')}: {p.prodState ? t('master.active') : t('master.inactive')}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <button
                          type="button"
                          className="rounded border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                          onClick={() => onEdit(p.prodno, p.prodName, p)}
                        >
                          {t('master.action.edit')}
                        </button>
                        <button
                          type="button"
                          className="rounded border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                          onClick={() => onDelete(p.prodno, p.prodName)}
                        >
                          {t('master.action.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {tab === 'supports' &&
                supports.map((s) => (
                  <div key={s.suppno} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {s.suppname} <span className="text-xs text-gray-500">#{s.suppno}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <button
                          type="button"
                          className="rounded border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                          onClick={() => onEdit(s.suppno, s.suppname)}
                        >
                          {t('master.action.edit')}
                        </button>
                        <button
                          type="button"
                          className="rounded border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                          onClick={() => onDelete(s.suppno, s.suppname)}
                        >
                          {t('master.action.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {tab === 'jobgrades' &&
                jobgrades.map((j) => (
                  <div key={j.jobno} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {j.jobName} <span className="text-xs text-gray-500">#{j.jobno}</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          {t('master.table.employeeCount')}: {jobCounts[j.jobno] ?? 0}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <button
                          type="button"
                          className="rounded border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                          onClick={() => onEdit(j.jobno, j.jobName)}
                        >
                          {t('master.action.edit')}
                        </button>
                        <button
                          type="button"
                          className="rounded border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                          onClick={() => onDelete(j.jobno, j.jobName)}
                        >
                          {t('master.action.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {tab === 'positions' &&
                positions.map((p) => (
                  <div key={p.postno} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {p.postName} <span className="text-xs text-gray-500">#{p.postno}</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          {t('master.table.employeeCount')}: {positionCounts[p.postno] ?? 0}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <button
                          type="button"
                          className="rounded border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                          onClick={() => onEdit(p.postno, p.postName)}
                        >
                          {t('master.action.edit')}
                        </button>
                        <button
                          type="button"
                          className="rounded border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                          onClick={() => onDelete(p.postno, p.postName)}
                        >
                          {t('master.action.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="hidden sm:block overflow-auto max-h-[600px]">
              {tab === 'departments' && (
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">{t('master.table.no')}</th>
                      <th className="px-3 py-2 text-left">{t('master.table.name')}</th>
                      <th className="px-3 py-2 text-left">{t('master.table.rank')}</th>
                      <th className="px-3 py-2 text-left">{t('master.table.employeeCount')}</th>
                      <th className="px-3 py-2 text-left">{t('master.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((d) => (
                      <tr key={d.deptno} className="border-b">
                        <td className="px-3 py-2">{d.deptno}</td>
                        <td className="px-3 py-2">{d.deptName}</td>
                        <td className="px-3 py-2">{d.deptRank ?? '-'}</td>
                        <td className="px-3 py-2">{employeeCounts[d.deptno] ?? 0}</td>
                        <td className="px-3 py-2 space-x-2">
                          <button className="text-blue-600" onClick={() => onEdit(d.deptno, d.deptName, { deptRank: d.deptRank })}>
                            {t('master.action.edit')}
                          </button>
                          <button className="text-red-600" onClick={() => onDelete(d.deptno, d.deptName)}>
                            {t('master.action.delete')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'customers' && (
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">{t('master.table.no')}</th>
                      <th className="px-3 py-2 text-left">{t('master.table.name')}</th>
                      <th className="px-3 py-2 text-left">{t('master.form.sales')}</th>
                      <th className="px-3 py-2 text-left">{t('master.form.location')}</th>
                      <th className="px-3 py-2 text-left">{t('master.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.custno} className="border-b">
                        <td className="px-3 py-2">{c.custno}</td>
                        <td className="px-3 py-2">{c.custName}</td>
                        <td className="px-3 py-2">{c.darumSales || '-'}</td>
                        <td className="px-3 py-2">{c.location || '-'}</td>
                        <td className="px-3 py-2 space-x-2">
                          <button className="text-blue-600" onClick={() => onEdit(c.custno, c.custName, c)}>
                            {t('master.action.edit')}
                          </button>
                          <button className="text-red-600" onClick={() => onDelete(c.custno, c.custName)}>
                            {t('master.action.delete')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'products' && (
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">{t('master.table.no')}</th>
                      <th className="px-3 py-2 text-left">{t('master.table.name')}</th>
                      <th className="px-3 py-2 text-left">{t('employee.table.status')}</th>
                      <th className="px-3 py-2 text-left">{t('master.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.prodno} className="border-b">
                        <td className="px-3 py-2">{p.prodno}</td>
                        <td className="px-3 py-2">{p.prodName}</td>
                        <td className="px-3 py-2">{p.prodState ? t('master.active') : t('master.inactive')}</td>
                        <td className="px-3 py-2 space-x-2">
                          <button className="text-blue-600" onClick={() => onEdit(p.prodno, p.prodName, p)}>
                            {t('master.action.edit')}
                          </button>
                          <button className="text-red-600" onClick={() => onDelete(p.prodno, p.prodName)}>
                            {t('master.action.delete')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'supports' && (
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">{t('master.table.no')}</th>
                      <th className="px-3 py-2 text-left">{t('master.table.name')}</th>
                      <th className="px-3 py-2 text-left">{t('master.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supports.map((s) => (
                      <tr key={s.suppno} className="border-b">
                        <td className="px-3 py-2">{s.suppno}</td>
                        <td className="px-3 py-2">{s.suppname}</td>
                        <td className="px-3 py-2 space-x-2">
                          <button className="text-blue-600" onClick={() => onEdit(s.suppno, s.suppname)}>
                            {t('master.action.edit')}
                          </button>
                          <button className="text-red-600" onClick={() => onDelete(s.suppno, s.suppname)}>
                            {t('master.action.delete')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'jobgrades' && (
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">{t('master.table.no')}</th>
                      <th className="px-3 py-2 text-left">{t('master.table.name')}</th>
                      <th className="px-3 py-2 text-left">{t('master.table.employeeCount')}</th>
                      <th className="px-3 py-2 text-left">{t('master.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobgrades.map((j) => (
                      <tr key={j.jobno} className="border-b">
                        <td className="px-3 py-2">{j.jobno}</td>
                        <td className="px-3 py-2">{j.jobName}</td>
                        <td className="px-3 py-2">{jobCounts[j.jobno] ?? 0}</td>
                        <td className="px-3 py-2 space-x-2">
                          <button className="text-blue-600" onClick={() => onEdit(j.jobno, j.jobName)}>
                            {t('master.action.edit')}
                          </button>
                          <button className="text-red-600" onClick={() => onDelete(j.jobno, j.jobName)}>
                            {t('master.action.delete')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'positions' && (
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">{t('master.table.no')}</th>
                      <th className="px-3 py-2 text-left">{t('master.table.name')}</th>
                      <th className="px-3 py-2 text-left">{t('master.table.employeeCount')}</th>
                      <th className="px-3 py-2 text-left">{t('master.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((p) => (
                      <tr key={p.postno} className="border-b">
                        <td className="px-3 py-2">{p.postno}</td>
                        <td className="px-3 py-2">{p.postName}</td>
                        <td className="px-3 py-2">{positionCounts[p.postno] ?? 0}</td>
                        <td className="px-3 py-2 space-x-2">
                          <button className="text-blue-600" onClick={() => onEdit(p.postno, p.postName)}>
                            {t('master.action.edit')}
                          </button>
                          <button className="text-red-600" onClick={() => onDelete(p.postno, p.postName)}>
                            {t('master.action.delete')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
      )}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-xs uppercase text-gray-500">{tabLabel(tab)}</p>
                <h3 className="text-lg font-semibold text-gray-900">
                  {formMode === 'edit' ? t('master.form.edit') : t('master.form.create')}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                X
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-4 py-5">
              {tab === 'departments' && (
                <>
                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-gray-700">{t('master.form.departmentName')}</span>
                    <input
                      required
                      type="text"
                      value={form.deptName}
                      onChange={(e) => setForm((p) => ({ ...p, deptName: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-gray-700">{t('master.form.departmentRank')}</span>
                    <input
                      type="number"
                      value={form.deptRank}
                      onChange={(e) => setForm((p) => ({ ...p, deptRank: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </label>
                </>
              )}

              {tab === 'customers' && (
                <>
                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-gray-700">{t('master.form.customerName')}</span>
                    <input
                      required
                      type="text"
                      value={form.custName}
                      onChange={(e) => setForm((p) => ({ ...p, custName: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-gray-700">{t('master.form.sales')}</span>
                    <input
                      type="text"
                      value={form.darumSales}
                      onChange={(e) => setForm((p) => ({ ...p, darumSales: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-gray-700">{t('master.form.location')}</span>
                    <input
                      type="text"
                      value={form.custLocation}
                      onChange={(e) => setForm((p) => ({ ...p, custLocation: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </label>
                </>
              )}

              {tab === 'products' && (
                <>
                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-gray-700">{t('master.form.productName')}</span>
                    <input
                      required
                      type="text"
                      value={form.prodName}
                      onChange={(e) => setForm((p) => ({ ...p, prodName: e.target.value }))}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.prodState}
                      onChange={(e) => setForm((p) => ({ ...p, prodState: e.target.checked }))}
                      className="h-4 w-4"
                    />
                    {t('master.form.productActive')}
                  </label>
                </>
              )}

              {tab === 'supports' && (
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-gray-700">{t('master.form.supportName')}</span>
                  <input
                    required
                    type="text"
                    value={form.supportName}
                    onChange={(e) => setForm((p) => ({ ...p, supportName: e.target.value }))}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </label>
              )}

              {tab === 'jobgrades' && (
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-gray-700">{t('master.form.jobgradeName')}</span>
                  <input
                    required
                    type="text"
                    value={form.jobName}
                    onChange={(e) => setForm((p) => ({ ...p, jobName: e.target.value }))}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </label>
              )}

              {tab === 'positions' && (
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-gray-700">{t('master.form.positionName')}</span>
                  <input
                    required
                    type="text"
                    value={form.postName}
                    onChange={(e) => setForm((p) => ({ ...p, postName: e.target.value }))}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </label>
              )}

              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="rounded border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t('employee.form.cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {formMode === 'edit' ? t('master.form.edit') : t('master.form.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMasterPage;

