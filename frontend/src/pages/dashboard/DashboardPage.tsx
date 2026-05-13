import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getMyDashboardStats, DashboardStats } from '../../api/dashboardApi';
import { Role } from '../../types';
import { useI18n } from '../../i18n/i18n';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.role === Role.ROLE_ADMIN || user?.role === Role.ROLE_SUPERADMIN;

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getMyDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Dashboard stats load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h2>
        <p className="mt-1 text-gray-600">{t('dashboard.welcome', { name: user?.name || '' })}</p>
      </div>

      {loading && (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600">{t('schedule.loading')}</p>
        </div>
      )}

      {!loading && stats && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.today')}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900">{t('dashboard.total')}</h4>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats.todayScheduleCount}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-900">{t('dashboard.work')}</h4>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.todayWorkScheduleCount}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-red-900">{t('dashboard.holiday')}</h4>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats.todayHolidayCount}
                </p>
              </div>
            </div>
          </div>

          {stats.weekScheduleCount !== undefined && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.week')}</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-indigo-900">{t('dashboard.total')}</h4>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">
                    {stats.weekScheduleCount}
                  </p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-teal-900">{t('dashboard.work')}</h4>
                  <p className="text-3xl font-bold text-teal-600 mt-2">
                    {stats.weekWorkScheduleCount}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-orange-900">{t('dashboard.holiday')}</h4>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {stats.weekHolidayCount}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.month')}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-purple-900">{t('dashboard.total')}</h4>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {stats.monthScheduleCount}
                </p>
              </div>
              <div className="bg-cyan-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-cyan-900">{t('dashboard.work')}</h4>
                <p className="text-3xl font-bold text-cyan-600 mt-2">
                  {stats.monthWorkScheduleCount}
                </p>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-pink-900">{t('dashboard.holiday')}</h4>
                <p className="text-3xl font-bold text-pink-600 mt-2">
                  {stats.monthHolidayCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.quickLinks')}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <a
                href="/schedules"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <span className="font-medium text-gray-900">{t('dashboard.mySchedules')}</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              {isAdmin && (
                <a
                  href="/employees"
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-gray-900">{t('dashboard.employees')}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
