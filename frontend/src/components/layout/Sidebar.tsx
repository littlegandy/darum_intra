import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Role } from '../../types';
import { useI18n } from '../../i18n/i18n';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

const IconList = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </svg>
);

const IconCalendar = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M8 4v4" />
    <path d="M16 4v4" />
    <path d="M4 10h16" />
    <rect x="4" y="6" width="16" height="14" rx="1" ry="1" />
  </svg>
);

const IconDepartment = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 21h18" />
    <rect x="5" y="4" width="14" height="17" rx="1" ry="1" />
    <path d="M9 9h2" />
    <path d="M13 9h2" />
    <path d="M9 13h2" />
    <path d="M13 13h2" />
  </svg>
);

const IconEmployees = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="9" r="4" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </svg>
);

const IconSettings = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M4 12h2" />
    <path d="M18 12h2" />
    <path d="M12 4v2" />
    <path d="M12 18v2" />
    <path d="M6.3 6.3l1.4 1.4" />
    <path d="M16.3 16.3l1.4 1.4" />
    <path d="M6.3 17.7l1.4-1.4" />
    <path d="M16.3 7.7l1.4-1.4" />
  </svg>
);

const Sidebar = ({ isOpen, isCollapsed, onClose }: SidebarProps) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === Role.ROLE_ADMIN || user?.role === Role.ROLE_SUPERADMIN;
  const { t } = useI18n();

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
      isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
    } ${isCollapsed ? 'justify-center' : ''}`;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/30 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100dvh-4rem)] sm:h-[calc(100vh-4rem)] transform border-r border-gray-200 bg-white shadow-sm transition-all duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="flex h-14 items-center gap-2 px-3">
          <div className="h-9 w-9 rounded-md bg-blue-600 text-center text-lg font-bold leading-9 text-white">
            D
          </div>
          {!isCollapsed && (
            <div className="leading-tight">
              <p className="text-sm font-semibold text-gray-900">Darumtech</p>
              <p className="text-xs text-gray-500">Intra V2</p>
            </div>
          )}
        </div>

        <nav className="px-2">
          <ul className="space-y-2">
            <li>
              {!isCollapsed && (
                  <div className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t('nav.schedule')}
                  </div>
              )}
              <ul className="space-y-1">
                <li>
                  <NavLink to="/schedules/department" className={linkClasses} onClick={onClose}>
                    <IconDepartment className="h-5 w-5" />
                    {!isCollapsed && <span>{t('nav.department')}</span>}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/schedules" end className={linkClasses} onClick={onClose}>
                    <IconList className="h-5 w-5" />
                    {!isCollapsed && <span>{t('nav.mySchedules')}</span>}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/schedules/calendar" className={linkClasses} onClick={onClose}>
                    <IconCalendar className="h-5 w-5" />
                    {!isCollapsed && <span>{t('nav.calendar')}</span>}
                  </NavLink>
                </li>
              </ul>
            </li>
            <li>
              {!isCollapsed && (
                <div className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t('nav.admin')}
                </div>
              )}
              <ul className="space-y-1">
                <li>
                  <NavLink to="/employees" className={linkClasses} onClick={onClose}>
                    <IconEmployees className="h-5 w-5" />
                    {!isCollapsed && <span>{t('nav.employees')}</span>}
                  </NavLink>
                </li>
                {isAdmin && (
                  <li>
                    <NavLink to="/admin/master" className={linkClasses} onClick={onClose}>
                      <IconSettings className="h-5 w-5" />
                      {!isCollapsed && <span>{t('nav.masterData')}</span>}
                    </NavLink>
                  </li>
                )}
              </ul>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
